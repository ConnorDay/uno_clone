import { useEffect, useState } from "react";
import { Global } from "../../Global";

type playerSyncConnectingObject = {
    name: string;
    id: string;
    connected: boolean;
};

function Game() {
    const { socket } = Global;

    //state objects
    const [players, setPlayers] = useState<playerSyncConnectingObject[]>([]);

    //Setup the socket
    useEffect(() => {
        socket.on("playerSync", (syncObject: playerSyncConnectingObject[]) => {
            setPlayers(syncObject);
        });

        socket.on("gameSync", (object) => {
            console.log(object);
        });

        socket.emit("gameLoaded");
    }, []);

    return (
        <div>
            {players.map((player) => {
                return (
                    <p key={player.id}>
                        {player.name} {player.connected ? "" : "(connecting)"}
                    </p>
                );
            })}
        </div>
    );
}

export { Game };
