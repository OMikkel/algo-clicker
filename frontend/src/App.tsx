import { DndContext } from "@dnd-kit/core";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import "./App.css";
import IfBlock from "./components/Blocks/IfBlock";

function Draggable() {
	const { ref } = useDraggable({
		id: "draggable",
	});

	return <button ref={ref}>Draggable</button>;
}

function Droppable({ id, children }) {
	const { ref } = useDroppable({
		id,
	});

	return (
		<div ref={ref} style={{ width: 300, height: 300 }}>
			{children}
		</div>
	);
}

function App() {
	return (
		<DndContext>
			<div className="p-16 flex items-center justitfy-center flex-col">
				<IfBlock>
					<IfBlock.Condition>Condition</IfBlock.Condition>
					<IfBlock.True>
						<IfBlock>
							<IfBlock.Condition>Condition 2</IfBlock.Condition>
							<IfBlock.True>True</IfBlock.True>
							<IfBlock.False>False</IfBlock.False>
						</IfBlock>
					</IfBlock.True>
					<IfBlock.False>awjdijaidjaw</IfBlock.False>
				</IfBlock>
			</div>
		</DndContext>
	);
}

export default App;
