import { useGlobalStateContext } from "../context/GlobalStateContext";
import { cn } from "../utils/cn";
import BlockSelector from "./BlockSelector";
import { PlayIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";

export default function Workbench() {
	const { rootBlocks, resetApplication, rerunApplication, runApplication } =
		useGlobalStateContext();
	const initialProgramBlockId = rootBlocks[0];

	return (
		<div className="w-full bg-gray-800 p-4 rounded-md">
			<div className="flex flex-row items-center justify-between">
				<h2 className="text-white text-lg font-bold">Workbench</h2>
				<div className="flex gap-2">
					<Button className="bg-blue-500" onClick={() => runApplication()}>
						<PlayIcon className="inline-block w-5 h-5 mr-1" />
					</Button>
					<Button className="bg-yellow-500" onClick={() => rerunApplication()}>
						<RefreshCwIcon className="inline-block w-5 h-5 mr-1" />
					</Button>
					<Button className="bg-red-500" onClick={() => resetApplication()}>
						<Trash2Icon className="inline-block w-5 h-5 mr-1" />
					</Button>
				</div>
			</div>
			<div className="w-full h-full bg-gray-800 p-4 rounded-md border-none">
				{initialProgramBlockId ? (
					<BlockSelector id={initialProgramBlockId} />
				) : (
					<p className="text-gray-400 italic text-sm">
						Initial program block is missing.
					</p>
				)}
			</div>
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
