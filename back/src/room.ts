import { Socket } from "socket.io";
import { getNodeMajorVersion } from "typescript";
import { Player } from "./player";

type roomDictionary = {
    [key: string]: Room;
};
type connectionInfo = {
    code: string;
    name: string;
};
type playerSyncLobbyObject = {
    name: string;
    id: string;
    ready: boolean;
};

type playerSyncObject = playerSyncLobbyObject;

class Room {
    ////////////
    // Static //
    ////////////

    static allRooms: roomDictionary = {};

    /**
     * A static method to register when a new player connects to the room.
     * Will determine if a room already exists with the given code, or create one if it doesn't exist
     * @param connection the connection information. Include the player's name and the room code
     * @param socket the socket connection of the player
     */
    static registerConnection(connection: connectionInfo, socket: Socket) {
        const { code, name } = connection;

        //Create the room if doesn't exist
        if (Room.allRooms[code] === undefined) {
            Room.allRooms[code] = new Room(code);
        }
        const targetRoom = Room.allRooms[code];

        //Sync the new player so that they get all other connections
        //NOTE: this happens after adding the player so that they can see themselves in the player list
        const player = new Player(name, code, socket);
        targetRoom.addPlayer(player);
        targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);

        //Send a sync player signal on player disconnect
        socket.on("disconnect", () => {
            console.log(
                `user '${player.name}' has disconnected from '${code}'`
            );
            targetRoom.removePlayer(player);
            targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);
        });

        //Change when the player is ready or not
        socket.on("toggleReady", () => {
            player.ready = !player.ready;
            console.log(`user '${player.name}' ready: '${player.ready}'`);
            targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);

            targetRoom.checkReady();
        });
    }

    ////////////
    // Public //
    ////////////
    public code: string;

    constructor(code: string) {
        this.code = code;
    }

    /**
     * Add a player to the list.
     * @param player
     */
    public addPlayer(player: Player) {
        this.players.push(player);

        this.checkReady();
    }

    /**
     * Removes a player from the list by selectively filtering them out
     * @param toRemove The player to remove
     */
    public removePlayer(toRemove: Player) {
        this.players = this.players.filter((player) => {
            return player !== toRemove;
        });

        if (this.players.length === 0) {
            console.log(`room '${this.code}' has no players, deleting room`);
            delete Room.allRooms[this.code];
            return;
        }

        this.checkReady();
    }

    /**
     * Emit the same message to all connected players
     * @param ev
     * @param args
     */
    public emitAll(ev: string, ...args: any[]) {
        this.players.forEach((player) => {
            player.socket.emit(ev, ...args);
        });
    }

    /**
     * Checks if all players are ready, and starts a countdown if they are.
     */
    public checkReady() {
        const allReady = this.players.every((player) => player.ready);

        if (allReady) {
            console.log("All players ready, starting round timer");

            //The time in milliseconds to wait before starting the round
            const delay = 5 * 1000;

            //The unix timestamp that the round should start
            const startTime = Date.now() + delay;

            this.emitAll("roundTimerStart", startTime);

            //Start the timer to start the game
            this.timeouts.startRound = setTimeout(() => {
                console.log(`room '${this.code}' has started a round`);
                this.emitAll("roundStart");
                this.inLobby = false;
            }, delay);
        } else if (this.timeouts.startRound !== undefined) {
            //If the roundStartTimer has already been started, cancel it

            console.log("A player has become unready, stopping round timer");

            clearTimeout(this.timeouts.startRound);
            this.timeouts.startRound = undefined;
            this.emitAll("roundTimerStop");
        }
    }

    // Getters //

    /**
     * A generic method to get a list of player sync information.
     * Automatically determines if the room is in the lobby or in the game, and returns different information accordingly
     */
    public get playerSyncInfo(): playerSyncObject[] {
        if (this.inLobby) {
            return this.playerSyncLobbyInfo;
        }
        //TODO: have this return game state specific info when the game state is implemented
        return [];
    }

    /////////////
    // Private //
    /////////////

    private players: Player[] = [];
    private inLobby = true;
    private timeouts: { [key: string]: NodeJS.Timeout | undefined } = {
        startRound: undefined,
    };

    /**
     * Get the sync information for when the room is specifically in the lobby state
     */
    private get playerSyncLobbyInfo(): playerSyncLobbyObject[] {
        const toReturn: playerSyncLobbyObject[] = [];

        this.players.forEach((player) => {
            toReturn.push({
                name: player.name,
                id: player.id,
                ready: player.ready,
            });
        });

        return toReturn;
    }
}

export { Room };
