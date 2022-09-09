import { Global } from "../../Global";

export type cardObject = {
    color: string;
    value: string;
    id: string;
};

type Props = {
    card: cardObject;
};

function play(id: string) {
    const { socket } = Global;
    socket.emit("playRequest", id);
}

function UnoCard(props: Props) {
    const { color, value, id } = props.card;
    return (
        <button onClick={() => play(id)}>
            {color} {value}
        </button>
    );
}

export { UnoCard };
