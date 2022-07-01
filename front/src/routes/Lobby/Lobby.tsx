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

    const [players, setPlayers] = useState<string[]>([]);

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

        socket.on("playerSync", (playerList) => {
            console.log("playerSync", playerList);
            setPlayers(playerList);
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

    let counter = 0;

    return (
        <div className="lobbyRoot">
            {players.map((player) => {
                return <p id={`player_${counter++}`}>{player}</p>;
            })}
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
