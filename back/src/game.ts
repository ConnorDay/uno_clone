import { Lobby } from "./lobby";
import { Player } from "./player";
import { Room } from "./room";

type playerSyncConnectingObject = {
    name: string;
    id: string;
    connected: boolean;
};

class Uno extends Room {
    private playersConnected: { [key: string]: boolean } = {};
    private connecting = true;

    constructor(code: string, playerList: Player[]) {
        super(code);

        // Wait for each player to connect
        playerList.forEach((player) => {
            this.addPlayer(player, false);

            this.playersConnected[player.id] = false;

            player.socket.on("gameLoaded", () => {
                console.log(
                    `user '${player.name}' in '${this.code}' has connected to the game`
                );

                this.playersConnected[player.id] = true;

                this.sync();

                //check if any player hasn't connected
                let ready = true;
                for (let id in this.playersConnected) {
                    if (!this.playersConnected[id]) {
                        ready = false;
                        break;
                    }
                }

                if (ready) {
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
                    connected: this.playersConnected[player.id],
                });
            });
            this.emitAll("playerSync", toSend);
            return;
        }
    }

    private start() {
        this.connecting = false;
        console.log(`game started for '${this.code}'`);
    }
}

export { Uno };
