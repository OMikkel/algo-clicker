import { useDraggable } from "@dnd-kit/react";
import { cn } from "../utils/cn";

type Props = {
	id: string;
	type: string;
	children?: React.ReactNode;
	className?: string;
};

export default function DraggableElement({
	id,
	type,
	children,
	className,
}: Props) {
	const { ref, isDragging } = useDraggable({ id, type });

	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-row gap-1 border-2 border-solid bg-gray-600 rounded-md transition-opacity",
				className,
				isDragging ? "opacity-30" : "opacity-100",
			)}
		>
			{/* The actual drag handle - only this starts the drag */}
			<div className="flex cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded h-min w-min">
				⠿
			</div>

			{/* Content area: clicks here won't trigger the IfBlock drag */}
			<div className="flex-1">{children}</div>
		</div>
	);
}
