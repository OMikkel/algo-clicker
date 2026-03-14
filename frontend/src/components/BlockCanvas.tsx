import { useGlobalStateContext } from "../context/GlobalStateContext";
import { cn } from "../utils/cn";
import DropZone from "./DropZone";
import { PlayIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";

export default function BlockCanvas() {
	const { rootBlocks } = useGlobalStateContext();

	return (
		<div className="w-full bg-gray-800 p-4 rounded-md">
			<div className="flex flex-row items-center justify-evenly">
				<h2 className="text-white text-lg font-bold">Canvas</h2>
				<div className="flex gap-2">
					<Button className="bg-blue-500">
						<PlayIcon className="inline-block w-5 h-5 mr-1" />
					</Button>
					<Button className="bg-yellow-500">
						<RefreshCwIcon className="inline-block w-5 h-5 mr-1" />
					</Button>
					<Button className="bg-red-500">
						<Trash2Icon className="inline-block w-5 h-5 mr-1" />
					</Button>
				</div>
			</div>
			<DropZone
				id="root"
				slot="root"
				blockIds={rootBlocks}
				className="w-full h-full bg-gray-800 p-4 rounded-md border-none"
			/>
		</div>
	);
}

function Button({
	children,
	className,
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			className={cn(
				"px-2 py-1 bg-green-700 rounded text-white font-bold flex items-center justify-center",
				className,
			)}
		>
			{children}
		</button>
	);
}
