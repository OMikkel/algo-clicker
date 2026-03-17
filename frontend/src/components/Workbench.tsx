import { useMemo, useState } from "react";
import { useGlobalStateContext } from "../context/GlobalStateContext";
import type { BlockState } from "../context/GlobalStateContext";
import { cn } from "../utils/cn";
import BlockSelector from "./BlockSelector";
import {
	BookOpenIcon,
	CircleAlertIcon,
	FolderOpenIcon,
	PlayIcon,
	RefreshCwIcon,
	StepForward,
	Trash2Icon,
} from "lucide-react";
import {
	deleteNamedSolutionFromLocalStorage,
	loadSolutionLibraryFromLocalStorage,
	saveNamedSolutionToLocalStorage,
	type SavedSolution,
} from "../utils/solutionStorage";

export default function Workbench() {
	const {
		blocks,
		env,
		rootBlocks,
		templates,
		replaceBlockState,
		resetApplication,
		runApplication,
		stepForward,
		errorMessage,
		runState,
	} = useGlobalStateContext();
	const initialProgramBlockId = rootBlocks[0];
	const [isLibraryOpen, setIsLibraryOpen] = useState(false);
	const [solutionName, setSolutionName] = useState("");
	const [librarySolutions, setLibrarySolutions] = useState<
		SavedSolution<BlockState>[]
	>([]);

	const currentState = useMemo<BlockState>(
		() => ({
			blocks,
			rootBlocks,
			templates,
			env,
		}),
		[blocks, env, rootBlocks, templates],
	);

	const refreshLibrary = () => {
		setLibrarySolutions(loadSolutionLibraryFromLocalStorage(currentState));
	};

	const handleSaveCurrentSolution = () => {
		saveNamedSolutionToLocalStorage(solutionName, currentState);
		setSolutionName("");
		refreshLibrary();
	};

	const handleLoadSolution = (state: BlockState) => {
		replaceBlockState(state);
		setIsLibraryOpen(false);
	};

	const handleDeleteSolution = (id: string) => {
		deleteNamedSolutionFromLocalStorage(id);
		refreshLibrary();
	};

	return (
		<div className="w-full bg-gray-800 p-4 rounded-md">
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-white text-lg font-bold">Workbench</h2>
				<div className="flex gap-2">
					<Button
						className="bg-indigo-500"
						onClick={() => {
							refreshLibrary();
							setIsLibraryOpen(true);
						}}
					>
						<FolderOpenIcon className="inline-block w-5 h-5 mr-1" />
					</Button>
					{runState === "done" && (
						<Button className="bg-blue-500" onClick={() => runApplication()}>
							<PlayIcon className="inline-block w-5 h-5 mr-1" />
						</Button>
					)}
					{runState === "running" && (
						<Button className="bg-yellow-500 ">
							<RefreshCwIcon className="inline-block w-5 h-5 mr-1 animate-spin" />
						</Button>
					)}
					{runState === "idle" && (
						<>
							{/* <Button
								className="bg-orange-500"
								onClick={() => rerunApplication()}
							>
								<RefreshCwIcon className="inline-block w-5 h-5 mr-1" />
							</Button> */}
							<Button className="bg-yellow-500" onClick={() => stepForward()}>
								<StepForward className="inline-block w-5 h-5 mr-1" />
							</Button>
						</>
					)}

					<Button className="bg-red-500" onClick={() => resetApplication()}>
						<Trash2Icon className="inline-block w-5 h-5 mr-1" />
					</Button>
				</div>
			</div>
			<div>
				<div>
					<CircleAlertIcon
						className={cn(
							"inline-block w-5 h-5 mr-1",
							errorMessage ? "text-red-500" : "text-gray-500",
						)}
					/>
					<span
						className={cn(
							"text-sm",
							errorMessage ? "text-red-500" : "text-gray-500",
						)}
					>
						{errorMessage ? "Error: " + errorMessage : "No errors"}
					</span>
				</div>
				<div className="h-px bg-white/20 my-2" />
			</div>
			<div className="w-full bg-gray-800 p-4 rounded-md border-none">
				{initialProgramBlockId ? (
					<BlockSelector id={initialProgramBlockId} />
				) : (
					<p className="text-gray-400 italic text-sm">
						Initial program block is missing.
					</p>
				)}
			</div>

			{isLibraryOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
					<div className="w-full max-w-2xl rounded-lg border border-white/20 bg-gray-900 p-4 text-left shadow-2xl">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<BookOpenIcon className="h-5 w-5 text-indigo-300" />
								<h3 className="text-lg font-semibold text-white">
									Løsningsbibliotek
								</h3>
							</div>
							<Button
								className="bg-gray-700"
								onClick={() => setIsLibraryOpen(false)}
							>
								Luk
							</Button>
						</div>

						<div className="mb-4 flex gap-2">
							<input
								className="flex-1 rounded-md border border-white/20 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
								placeholder="Navn på løsning"
								value={solutionName}
								onChange={(event) => setSolutionName(event.target.value)}
							/>
							<Button
								className="bg-emerald-600"
								onClick={handleSaveCurrentSolution}
							>
								Gem nuværende
							</Button>
						</div>

						<div className="max-h-96 space-y-2 overflow-y-auto pr-1">
							{librarySolutions.length === 0 && (
								<p className="rounded-md border border-white/10 bg-gray-800 p-3 text-sm text-gray-300">
									Ingen gemte løsninger endnu.
								</p>
							)}
							{librarySolutions.map((solution) => (
								<div
									key={solution.id}
									className="flex items-center justify-between rounded-md border border-white/10 bg-gray-800 p-3"
								>
									<div>
										<div className="text-sm font-semibold text-white">
											{solution.name}
										</div>
										<div className="text-xs text-gray-400">
											{new Date(solution.savedAt).toLocaleString("da-DK")}
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											className="bg-blue-600"
											onClick={() => handleLoadSolution(solution.state)}
										>
											Load
										</Button>
										<Button
											className="bg-red-600"
											onClick={() => handleDeleteSolution(solution.id)}
										>
											Slet
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function Button({
	children,
	className,
	onClick,
}: {
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<button
			className={cn(
				"px-2 py-1 bg-green-700 rounded text-white font-bold flex items-center justify-center",
				className,
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
