import { useDroppable } from "@dnd-kit/react";
import StatementBlock from "./StatementBlock";

type Props = {
    children?: React.ReactNode
}

export default function StatementContainer({children}: Props) {
    const { ref } = useDroppable({
        id: new Date().getTime()
    });

    return ((
            <div ref={ref} className="flex-1 border-2 rounded-md p-0.5">{children ? <StatementBlock>
                {children}
            </StatementBlock> : <StatementBlock />}</div>
        ))
}