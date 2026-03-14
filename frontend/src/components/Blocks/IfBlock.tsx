import React from "react";
import ConditionBlock from "./ConditionBlock";
import StatementContainer from "./StatementContainer";

type Props = {
	children: React.ReactNode;
};

function IfBlock({ children }: Props) {
	let condition = null;
	let trueBlock = null;
	let elseBlock = null;

	children.forEach((child) => {
		if (child.type?.name === "IfConditionBlock") {
			condition = child;
		} else if (child?.type?.name === "IfTrueBlock") {
			trueBlock = child;
		} else if (child?.type?.name === "IfFalseBlock") {
			elseBlock = child;
		}
	});

	return (
		<div className="bg-blue-500 min-w-72 p-4 rounded-md flex flex-col gap-4 border">
			<div className="flex items-center gap-4">
				<p>If</p>
				<div className="flex-1">{condition}</div>
			</div>
			<div className="flex flex-col items-start justify-center gap-4">
				<div className="flex flex-1 w-full">{trueBlock}</div>
				<p>Else</p>
				<div className="flex flex-1 w-full">{elseBlock}</div>
			</div>
		</div>
	);
}

function IfConditionBlock({children}: {children?: React.ReactNode}) {
    return <ConditionBlock>{children}</ConditionBlock>
}
function IfTrueBlock({children}: {children?: React.ReactNode}) {
    return <StatementContainer>{children}</StatementContainer>
}
function IfFalseBlock({children}: {children?: React.ReactNode}) {
    return <StatementContainer>{children}</StatementContainer>
}

IfBlock.Condition = IfConditionBlock;
IfBlock.True = IfTrueBlock;
IfBlock.False = IfFalseBlock;

export default IfBlock;
