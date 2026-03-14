import { useDraggable } from "@dnd-kit/react";

type Props = {
    children?: React.ReactNode
}

export default function StatementBlock({ children }: Props) {
    const {attributes, listeners, ref, transform} = useDraggable({
        id: new Date().getTime()
    });
	return (
		<div ref={ref} className={`w-full flex-1 border-dashed border-2 border-gray-400 bg-gray-200 rounded-md ${children && "border-solid"}`}>
			{children ? children : "Statement"}
		</div>
	);
}
