export const PLAYGROUND_STORAGE_KEY = "algo-playground-storage";
export const SOLUTION_LIBRARY_STORAGE_KEY = "algo-clicker-solution-library";

export const LEGACY_SOLUTION_STORAGE_KEYS = [
    PLAYGROUND_STORAGE_KEY,
    "algo-clicker-storage",
    "algo-clicker-solutions",
    "algo-solutions",
];

type StateLike = {
    blocks: Record<string, unknown>;
    rootBlocks: string[];
    templates: string[];
    env: unknown;
};

export type SavedSolution<T extends StateLike> = {
    id: string;
    name: string;
    savedAt: string;
    state: T;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");

const hasBlocksAndRoots = (
    value: unknown,
): value is { blocks: Record<string, unknown>; rootBlocks: string[] } => {
    if (!isObject(value)) return false;
    return isObject(value.blocks) && isStringArray(value.rootBlocks);
};

const normalizeState = <T extends StateLike>(
    raw: unknown,
    fallback: T,
): T | null => {
    if (!isObject(raw)) return null;

    if (hasBlocksAndRoots(raw)) {
        const rawObj = raw as Record<string, unknown>;
        return {
            ...fallback,
            ...rawObj,
            templates: isStringArray(rawObj.templates)
                ? rawObj.templates
                : fallback.templates,
            env: isObject(rawObj.env) ? rawObj.env : fallback.env,
        } as T;
    }

    if (hasBlocksAndRoots(raw.solution)) {
        return normalizeState(raw.solution, fallback);
    }

    if (Array.isArray(raw.solutions)) {
        for (let i = raw.solutions.length - 1; i >= 0; i -= 1) {
            const normalized = normalizeState(raw.solutions[i], fallback);
            if (normalized) return normalized;
        }
    }

    return null;
};

export const loadLegacySolutionFromLocalStorage = <T extends StateLike>(
    fallback: T,
    storageKeys: string[] = LEGACY_SOLUTION_STORAGE_KEYS,
    storage?: Storage,
): T | null => {
    const targetStorage = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!targetStorage) return null;

    for (const key of storageKeys) {
        const rawValue = targetStorage.getItem(key);
        if (!rawValue) continue;

        try {
            const parsed = JSON.parse(rawValue) as unknown;
            const normalized = normalizeState(parsed, fallback);
            if (normalized) return normalized;
        } catch {
            // Ignore malformed legacy entries and keep searching.
        }
    }

    return null;
};

const cloneState = <T extends StateLike>(state: T): T =>
    JSON.parse(JSON.stringify(state)) as T;

const parseLibraryEntries = <T extends StateLike>(
    raw: unknown,
    fallback: T,
): SavedSolution<T>[] => {
    if (!Array.isArray(raw)) return [];

    const parsed: SavedSolution<T>[] = [];
    for (const entry of raw) {
        if (!isObject(entry)) continue;
        const normalizedState = normalizeState(entry.state, fallback);
        if (!normalizedState) continue;

        parsed.push({
            id:
                typeof entry.id === "string" && entry.id.length > 0
                    ? entry.id
                    : crypto.randomUUID(),
            name:
                typeof entry.name === "string" && entry.name.trim().length > 0
                    ? entry.name.trim()
                    : "Unavngivet løsning",
            savedAt:
                typeof entry.savedAt === "string" && entry.savedAt.length > 0
                    ? entry.savedAt
                    : new Date().toISOString(),
            state: normalizedState,
        });
    }

    return parsed;
};

export const loadSolutionLibraryFromLocalStorage = <T extends StateLike>(
    fallback: T,
    storage?: Storage,
): SavedSolution<T>[] => {
    const targetStorage =
        storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!targetStorage) return [];

    const rawValue = targetStorage.getItem(SOLUTION_LIBRARY_STORAGE_KEY);
    if (!rawValue) return [];

    try {
        const parsed = JSON.parse(rawValue) as unknown;
        return parseLibraryEntries(parsed, fallback).sort((a, b) =>
            b.savedAt.localeCompare(a.savedAt),
        );
    } catch {
        return [];
    }
};

export const saveNamedSolutionToLocalStorage = <T extends StateLike>(
    name: string,
    state: T,
    storage?: Storage,
): SavedSolution<T>[] => {
    const targetStorage =
        storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!targetStorage) return [];

    const trimmedName = name.trim();
    const fallbackState = cloneState(state);
    const existing = loadSolutionLibraryFromLocalStorage(fallbackState, targetStorage);
    const savedAt = new Date().toISOString();

    const next: SavedSolution<T>[] = [
        {
            id: crypto.randomUUID(),
            name: trimmedName.length > 0 ? trimmedName : "Unavngivet løsning",
            savedAt,
            state: cloneState(state),
        },
        ...existing,
    ];

    targetStorage.setItem(SOLUTION_LIBRARY_STORAGE_KEY, JSON.stringify(next));
    return next;
};

export const deleteNamedSolutionFromLocalStorage = (
    id: string,
    storage?: Storage,
): void => {
    const targetStorage =
        storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
    if (!targetStorage) return;

    const rawValue = targetStorage.getItem(SOLUTION_LIBRARY_STORAGE_KEY);
    if (!rawValue) return;

    try {
        const parsed = JSON.parse(rawValue) as unknown;
        if (!Array.isArray(parsed)) return;
        const filtered = parsed.filter(
            (entry) => !(isObject(entry) && entry.id === id),
        );
        targetStorage.setItem(SOLUTION_LIBRARY_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
        // Ignore malformed data.
    }
};