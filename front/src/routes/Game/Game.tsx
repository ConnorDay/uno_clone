import { Socket } from "socket.io-client";

type Props = {
    connectionInfo: { name: string; code: string };
    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>;
    socket: Socket;
};

function Game() {
    return <>this is the game screen</>;
}

export { Game };
