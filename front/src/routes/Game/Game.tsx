import { useEffect, useState } from "react";
import { Hand, PlayerList } from "../../components";
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
    topCard: Card;
};

type Color = "red" | "blue" | "green" | "yellow" | "special";
type Card = {
    color: Color;
    value: string;
    id: string;
};

function Game() {
    const { socket } = Global;

    //state objects
    const [players, setPlayers] = useState(<PlayerList players={[]} />);
    const [hand, setHand] = useState(<Hand cards={[]} />);
    const [topCard, setTopCard] = useState<Card>();

    //Setup the socket
    useEffect(() => {
        //Sync event for before the game has started
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

        //Sync event for once the game has started
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
            setTopCard(syncObject.topCard);
        });

        //Sync event to update hand
        socket.on("handSync", (obj) => {
            setHand(<Hand cards={obj} />);
        });

        //Response to play Request
        socket.on("playResponse", (obj) => {
            console.log(obj.success);
        });

        //Emitted once the game has started
        socket.on("gameStart", () => {});

        socket.emit("gameLoaded");
    }, []);

    return (
        <div>
            {players}
            {hand}
            <div>
                {topCard?.color}
                {topCard?.value}
            </div>
        </div>
    );
}

export { Game };
