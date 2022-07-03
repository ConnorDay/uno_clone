import { Lobby } from "./lobby";
import { Player } from "./player";
import { Room } from "./room";

type playerSyncConnectingObject = {
    name: string;
    id: string;
    connected: boolean;
};

class Uno extends Room {
    private playersConnected: string[] = [];
    private connecting = true;

    constructor(code: string, playerList: Player[]) {
        super(code);

        this.listenerEvents.push("gameLoaded");

        // Wait for each player to connect
        playerList.forEach((player) => {
            this.addPlayer(player, false);

            player.socket.on("gameLoaded", () => {
                //Make sure we haven't already marked this player as connected
                if (this.playersConnected.includes(player.id)) {
                    console.log(
                        `user '${player.name}' attempted to connect, but was already connected`
                    );
                    return;
                }

                console.log(
                    `user '${player.name}' in '${this.code}' has connected to the game`
                );

                this.playersConnected.push(player.id);

                this.sync();

                //check if all players have connected
                if (this.players.length === this.playersConnected.length) {
                    this.start();
                }
            });
        });

        this.emitAll("roundStart");
    }

    public sync() {
        if (this.connecting) {
            const toSend: playerSyncConnectingObject[] = [];
            this.players.forEach((player) => {
                toSend.push({
                    name: player.name,
                    id: player.id,
                    connected: this.playersConnected.includes(player.id),
                });
            });
            this.emitAll("playerSync", toSend);
            return;
        }
    }

    private start() {
        this.connecting = false;
        console.log(`game started for '${this.code}'`);

        //remove loaded listener for all players
        this.players.forEach((player) => {
            player.socket.removeAllListeners("gameLoaded");
        });

        //Remove gameLoaded event from listenerEvents
        this.listenerEvents = this.listenerEvents.filter(
            (event) => event !== "gameLoaded"
        );
    }
}

export { Uno };
