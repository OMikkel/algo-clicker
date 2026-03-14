import { useDroppable } from "@dnd-kit/react";

type Props = {
    id: string;
    children?: React.ReactNode;
    className?: string;
}

export default function DropZone({ id, children, className}: Props) {
    const {ref} = useDroppable({id})
    return (
        <div className={`flex flex-1 border-2 border-dashed border-gray-500 bg-gray-200 p-3 flex-col gap-3 rounded-md ${!children ? "min-h-12" : "border-solid"} ${className}`} ref={ref}>
            {children}
        </div>            
    )
}