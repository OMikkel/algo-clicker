

export const getKeysFromObject = (obj: object, prefix = ""): string[] => {
    return Object.keys(obj).map((key) => `${prefix}${key}`);
}