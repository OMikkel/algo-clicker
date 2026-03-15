import { useDraggable } from "@dnd-kit/react";

type Props = {
    id: string
    children?: React.ReactNode
}

export default function ConditionBlock({ id, children }: Props) {
    const {ref} = useDraggable({id})
    
	return (
		<div ref={ref} className={`border-dashed border-2 border-gray-400 bg-gray-200 rounded-md ${children && "border-solid"}`}>
			{children}
		</div>
	);
}
