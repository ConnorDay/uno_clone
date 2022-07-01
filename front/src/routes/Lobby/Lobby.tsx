import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Homescreen } from "../Homescreen/Homescreen";

type Props = {
    connectionInfo: { name: string; code: string };
    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>;
};

function Lobby(props: Props) {
    const { name, code } = props.connectionInfo;
    const { setDisplay } = props;

    const [socket, setSocket] = useState<Socket>();

    const [count, setCount] = useState(0);

    useEffect(() => {
        const socket = io(
            `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
            {
                query: {
                    name,
                    code,
                },
            }
        );

        socket.on("playerConnected", (player) => {
            console.log(`Player ${player.name} connected!`);
        });

        socket.on("playerSync", (playerList) => {
            console.log("playerSync", playerList);
        });

        setSocket(socket);
    }, []);

    const closeSocket = () => {
        if (socket === undefined) {
            return;
        }

        socket.close();
        setSocket(undefined);
    };

    //Return a connecting screen until the socket is set
    //TODO: add a time out to this screen
    if (socket === undefined) {
        return <>Connecting...</>;
    }

    return (
        <div>
            {count}
            <button
                onClick={() => {
                    setCount(count + 1);
                }}
            >
                +
            </button>
            <button
                onClick={() => {
                    closeSocket();
                    setDisplay(<Homescreen setDisplay={setDisplay} />);
                }}
            >
                go back
            </button>
        </div>
    );
}

export { Lobby };
