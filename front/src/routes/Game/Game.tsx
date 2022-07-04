import { useEffect, useState } from "react";
import { PlayerList } from "../../components";
import { Global } from "../../Global";

type playerSyncConnectingObject = {
    name: string;
    id: string;
    connected: boolean;
};

type playerSyncObject = {
    name: string;
    id: string;
    numCards: number;
};

type gameSyncObject = {
    turn: number;
    players: playerSyncObject[];
};

function Game() {
    const { socket } = Global;

    //state objects
    const [players, setPlayers] = useState(<PlayerList players={[]} />);

    //Setup the socket
    useEffect(() => {
        socket.on("playerSync", (syncObject: playerSyncConnectingObject[]) => {
            setPlayers(
                <PlayerList
                    players={syncObject}
                    additional={(p) => {
                        let player = p as playerSyncConnectingObject;
                        if (!player.connected) {
                            return <>(connecting)</>;
                        }
                        return <></>;
                    }}
                />
            );
        });

        socket.on("gameSync", (syncObject: gameSyncObject) => {
            const currPlayerId = syncObject.players[syncObject.turn].id;
            setPlayers(
                <PlayerList
                    players={syncObject.players}
                    additional={(p) => {
                        let player = p as playerSyncObject;
                        let toDisplay = `(${player.numCards})`;

                        if (player.id === currPlayerId) {
                            toDisplay += " (current turn)";
                        }

                        return <>{toDisplay}</>;
                    }}
                />
            );
        });

        socket.emit("gameLoaded");
    }, []);

    return <div>{players}</div>;
}

export { Game };
