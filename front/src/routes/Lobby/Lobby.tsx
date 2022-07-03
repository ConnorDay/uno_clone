import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ConnectionInfo, Global } from "../../Global";
import { Game } from "../Game/Game";
import { Homescreen } from "../Homescreen/Homescreen";

type playerSyncLobbyObject = {
    name: string;
    id: string;
    ready: boolean;
};

function Lobby() {
    const { socket, connectionInfo, setDisplay } = Global;
    const { name, code } = connectionInfo;

    // State Objects //
    const [players, setPlayers] = useState<playerSyncLobbyObject[]>([]);
    const [roundStart, setRoundStart] = useState<number>();
    const [roundDisplayTime, setRoundDisplayTime] = useState<number>();

    //This is only ran once when the page loads for the first time
    useEffect(() => {
        //Update the player list when the playerSync signal is emitted
        socket.on("playerSync", (playerList) => {
            setPlayers(playerList);
        });

        socket.on("roundTimerStart", (startTime) => {
            setRoundStart(startTime);
        });

        socket.on("roundTimerStop", () => {
            setRoundStart(undefined);
            setRoundDisplayTime(undefined);
        });

        socket.on("roundStart", () => {
            setDisplay(<Game />);
        });

        //Close the socket when unrendered
        return () => {
            socket.removeListener("playerSync");
            socket.removeListener("roundTimerStart");
            socket.removeListener("roundTimerStop");
            socket.removeListener("roundStart");
        };
    }, []);

    //If the round timer has started, convert it into the number of seconds remaining until the round starts
    useEffect(() => {
        if (roundStart === undefined) {
            return;
        }

        const interval = setInterval(() => {
            let calcTime = roundStart - Date.now();
            calcTime /= 1000;
            calcTime = Math.ceil(calcTime);
            calcTime = Math.max(0, calcTime);

            setRoundDisplayTime(calcTime);
        }, 100);

        return () => {
            clearInterval(interval);
        };
    }, [roundStart]);

    return (
        <div className="lobbyRoot">
            {/* Render the time until the round starts */}
            {roundDisplayTime}

            {/* Map every player in the player list to html p tags */}
            {players.map((player) => {
                return (
                    <p key={player.id}>
                        {player.name} ({player.ready ? "ready" : "not ready"})
                    </p>
                );
            })}

            {/* Button to disconnect the socket, and go back to the homescreen */}
            <button
                onClick={() => {
                    Global.socket.close();
                    setDisplay(<Homescreen />);
                }}
            >
                go back
            </button>

            {/* Button to emit the toggleReady signal */}
            <button
                onClick={() => {
                    socket.emit("toggleReady");
                }}
            >
                toggle ready
            </button>
        </div>
    );
}

export { Lobby };
