export type cardObject = {
    color: string;
    value: string;
    id: string;
};

type Props = {
    card: cardObject;
};

function UnoCard(props: Props) {
    const { color, value } = props.card;
    return (
        <button>
            {color} {value}
        </button>
    );
}

export { UnoCard };
