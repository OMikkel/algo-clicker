import BlockSelector from "./components/BlockSelector";
import { BLOCK_REGISTRY } from "./constants/AstConditions";
import type { Block } from "./types/blocks";
import { createBlockFromAST } from "./utils/objects";

type Props = {};

export default function Toolbar({}: Props) {
	const ASTs: Block[] = Object.keys(BLOCK_REGISTRY).map((key) =>
		createBlockFromAST(key, ""),
	);

	return (
		<div className="w-64 bg-gray-800 p-4 rounded-md">
			<h2 className="text-white text-lg font-bold mb-4">Toolbar</h2>
			{ASTs.map((ast) => (
				<BlockSelector key={ast.id} block={ast} />
			))}
		</div>
	);
}
