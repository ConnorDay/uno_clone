interface Props {
	query?: {
		prompt: string;
		options: string[];
	};
	onQuerySelection: (index: number) => void;
}

export function Query(props: Props) {
	const { query, onQuerySelection } = props;
	if (query === undefined) {
		return <></>;
	}
	return (
		<div>
			{query.prompt}
			{query.options.map((option, index) => {
				return (
					<button onClick={() => onQuerySelection(index)}>
						{option}
					</button>
				);
			})}
		</div>
	);
}
