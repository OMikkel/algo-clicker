import { useDroppable } from "@dnd-kit/react";

type Props = {
    id: string
    children?: React.ReactNode
}

export default function StatementDropZone({id, children}: Props) {
    const { ref, isDropTarget } = useDroppable({id});

    return ((
                <div ref={ref} className={`flex-1 border-2 border-dashed bg-gray-200 rounded-md p-0.5 min-h-12 ${isDropTarget ? "border-solid bg-gray-600" : ""}`}>{children}</div>
        ))
}