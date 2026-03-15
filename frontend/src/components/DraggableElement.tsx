import { useDraggable } from "@dnd-kit/react";
import { cn } from "../utils/cn";
import { Trash2Icon } from "lucide-react";
import { useGlobalStateContext } from "../context/GlobalStateContext";

type Props = {
	id: string;
	type: string;
	children?: React.ReactNode;
	className?: string;
	template?: boolean;
	disabled?: boolean;
	editable?: boolean;
};

export default function DraggableElement({
	id,
	type,
	children,
	className,
	template = false,
	disabled = false,
	editable = true,
}: Props) {
	const { deleteBlock } = useGlobalStateContext();
	const { ref, isDragging } = useDraggable({ id, type, disabled: disabled });

	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col gap-1 border-2 border-solid bg-gray-600 rounded-md transition-opacity",
				className,
				isDragging ? "opacity-30" : "opacity-100",
			)}
		>
			<div className="flex flex-row items-start">
				{/* The actual drag handle - only this starts the drag */}
				{!disabled && (
					<div className="flex cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded h-min w-min">
						⠿
					</div>
				)}

				{/* Content area: clicks here won't trigger the IfBlock drag */}
				<div className="flex-1">{children}</div>
				{editable && (
					<button
						className="flex cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded h-min w-min"
						onClick={() => deleteBlock(id)}
					>
						<Trash2Icon className="w-4 h-4" />
					</button>
				)}
			</div>
		</div>
	);
}
