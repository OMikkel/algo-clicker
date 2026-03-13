import { useMemo } from "react";

type Props = {
	condition: () => boolean;
	children: React.ReactNode;
};

function IfBlock({ condition, children }: Props) {
	const conditionResult = useMemo(() => condition(), [condition]);

	return <div>{conditionResult ? <IfBlock.True /> : <IfBlock.False />}</div>;
}

function IfTrueBlock() {
	return <div></div>;
}

function IfFalseBlock() {
	return <div></div>;
}

IfBlock.True = IfTrueBlock;
IfBlock.False = IfFalseBlock;

export default IfBlock;
