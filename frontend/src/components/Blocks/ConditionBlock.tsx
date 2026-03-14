type Props = {
    children?: React.ReactNode
}

export default function ConditionBlock({ children }: Props) {
	return (
		<div className={`border-dashed border-2 border-gray-400 bg-gray-200 rounded-md ${children && "border-solid"}`}>
			{children}
		</div>
	);
}
