import { useDroppable } from "@dnd-kit/react";
import BlockSelector from "./BlockSelector";

type Props = {
    id: string;
    keys: string[];
    blocks: Record<string, any>;
    children?: React.ReactNode;
    className?: string;
}

export default function DropZone({ id, keys, blocks, children, className}: Props) {
    const {ref} = useDroppable({id: `container:${id}`})
    return (
        <div className={`relative flex flex-1 border-2 border-dashed border-gray-500 bg-gray-200 p-3 flex-col gap-3 rounded-md ${!children ? "min-h-18" : "border-solid"} ${className}`} ref={ref}>
            <p className="left-2 top-0 absolute text-blue-50">{id}</p>
            {keys.length > 0 ? keys.map((key) => (
                <BlockSelector key={key} path={`${id}.${key}`} block={blocks[key]} />
            )) : children ? children : <p className="text-gray-500 italic">Drop blocks here</p>}
        </div>            
    )
}