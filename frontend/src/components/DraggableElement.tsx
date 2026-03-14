import { useDraggable } from "@dnd-kit/react"

export default function DraggableElement({ id, children, className, ...props }) {
    const {ref} = useDraggable({id})

    return (
        <div className={`cursor-move border-2 border-solid p-3 bg-gray-600 rounded-md ${className}`} {...props} ref={ref}>
            {children}
        </div>
    )
}