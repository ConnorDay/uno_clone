import { Socket } from "socket.io-client";

export type ConnectionInfo = {
    name: string;
    code: string;
};

type Global = {
    connectionInfo: ConnectionInfo;
    socket: Socket;

    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>;
};

const Global: Global = {} as Global;

export { Global };
