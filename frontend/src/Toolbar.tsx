import BlockSelector from "./components/BlockSelector";
import { BLOCK_GROUPS } from "./constants/AstConditions";
import { useGlobalStateContext } from "./context/GlobalStateContext";

export default function Toolbar() {
	const { templates, blocks } = useGlobalStateContext();

	return (
		<div className="bg-gray-800 p-4 rounded-md">
			<h2 className="text-white text-lg font-bold mb-4">Toolbar</h2>
			{Object.keys(BLOCK_GROUPS).map((group, index) => (
				<details className="flex flex-col gap-3" open={index === 0}>
					<summary className="w-full">{group}</summary>
					<div className="flex flex-col gap-2 mb-4">
						{templates.map((templateId) => {
							const block = blocks[templateId];
							if (block.type && BLOCK_GROUPS[group].includes(block.type))
								return (
									<BlockSelector key={templateId} id={templateId} preview />
								);
						})}
					</div>
				</details>
			))}
		</div>
	);
}
