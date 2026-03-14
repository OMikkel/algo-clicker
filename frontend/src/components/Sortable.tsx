import { useSortable } from "@dnd-kit/react/sortable"


export default function Sortable() {
    const {ref} = useSortable({id: "sortable"})
    return (
        <div></div>
    )
}