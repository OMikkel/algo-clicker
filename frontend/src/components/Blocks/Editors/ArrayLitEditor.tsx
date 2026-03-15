import { useState, useEffect } from "react";
import { useGlobalStateContext } from "../../../context/GlobalStateContext";
import type { ArrayLitBlock } from "../../../types/blocks/arrayType";

function parseArrayValues(input: string): number[] {
	return input
		.split(",")
		.map((tok) => tok.trim())
		.filter((tok) => tok.length > 0)
		.map((tok) => Number(tok))
		.filter((n) => !Number.isNaN(n));
}

export function ArrayLitEditor({
	block,
	editable,
}: {
	block: ArrayLitBlock;
	editable?: boolean;
}) {
	const { updateBlockData } = useGlobalStateContext();

	// 1. Create local state to hold the "raw" string as the user types
	const [localValue, setLocalValue] = useState(
		Array.isArray(block.values) ? block.values.join(", ") : "",
	);

	// 2. Keep local state in sync if global state changes externally
	useEffect(() => {
		setLocalValue(Array.isArray(block.values) ? block.values.join(", ") : "");
	}, [block.values]);

	const handleBlur = () => {
		const validatedArray = parseArrayValues(localValue);
		updateBlockData(block.id, { values: validatedArray });

		// Optional: Re-format the local input to show the "cleaned" version
		setLocalValue(validatedArray.join(", "));
	};

	return (
		<input
			type="text"
			value={localValue} // Bind to local state
			onChange={(e) => setLocalValue(e.target.value)} // Allow typing
			onPointerDown={(e) => e.stopPropagation()}
			onBlur={handleBlur} // Validate and save on exit
			onKeyDown={(e) => e.key === "Enter" && handleBlur()} // Save on Enter key
			className="w-32 bg-black/30 border-none rounded px-1 text-right focus:ring-1 focus:ring-blue-500 outline-none"
			placeholder="1, 2, 3"
			disabled={!editable}
		/>
	);
}
