//import { Uno.Game } from "./game";
import { Player } from "../player";
import { Room } from "../room";
import { Game } from "./game";

type playerSyncLobbyObject = {
    name: string;
    id: string;
    ready: boolean;
};

export class Lobby extends Room {
    constructor(code: string) {
        super(code);
        this.listenerEvents.push("toggleReady");
    }

    //Overridden method
    public addPlayer(player: Player): void {
        super.addPlayer(player);

        //Change when the player is ready or not
        player.socket.on("toggleReady", () => {
            player.ready = !player.ready;
            console.log(`user '${player.name}' ready: '${player.ready}'`);
            this.sync();

            this.checkReady();
        });
    }

    //Overridden method
    public sync() {
        const toReturn: playerSyncLobbyObject[] = [];

        this.players.forEach((player) => {
            toReturn.push({
                name: player.name,
                id: player.id,
                ready: player.ready,
            });
        });

        this.emitAll("playerSync", toReturn);
    }

    /**
     * Checks if all players are ready, and starts a countdown if they are.
     */
    public checkReady() {
        const allReady = this.players.every((player) => player.ready);

        if (allReady) {
            console.log(
                `All players ready in room '${this.code}', starting round timer`
            );

            //The time in milliseconds to wait before starting the round
            const delay = 5 * 1000;

            //The unix timestamp that the round should start
            const startTime = Date.now() + delay;

            this.emitAll("roundTimerStart", startTime);

            //Start the timer to start the game
            this.timeouts.startRound = setTimeout(() => {
                console.log(`room '${this.code}' has started a round`);
                this.removeListeners();
                Room.allRooms[this.code] = new Game(this.code, this.players);
            }, delay);
        } else if (this.timeouts.startRound !== undefined) {
            //If the roundStartTimer has already been started, cancel it

            console.log("A player has become unready, stopping round timer");

            clearTimeout(this.timeouts.startRound);
            this.timeouts.startRound = undefined;
            this.emitAll("roundTimerStop");
        }
    }

    private timeouts: { [key: string]: NodeJS.Timeout | undefined } = {
        startRound: undefined,
    };
}
