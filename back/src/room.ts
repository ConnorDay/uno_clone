import { Socket } from "socket.io";
import { Player } from "./player";

export type roomDictionary = {
    [key: string]: Room;
};
export type connectionInfo = {
    code: string;
    name: string;
};

abstract class Room {
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
    static registerConnection(
        connection: connectionInfo,
        socket: Socket,
        toCreate: (code: string) => Room
    ) {
        const { code, name } = connection;

        console.log(`user '${name}' connected to '${code}'`);

        //Create the room if doesn't exist
        if (Room.allRooms[code] === undefined) {
            console.log(
                `creating room with code '${code}', since one was not found`
            );
            Room.allRooms[code] = toCreate(code);
        }
        const targetRoom = Room.allRooms[code];

        //Sync the new player so that they get all other connections
        //NOTE: this happens after adding the player so that they can see themselves in the player list
        const player = new Player(name, code, socket);
        targetRoom.addPlayer(player);
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
     * @param sync If the room should attempt to sync after adding the player
     */
    public addPlayer(player: Player, sync: boolean = true) {
        this.players.push(player);

        //Send a sync player signal on player disconnect
        player.socket.on("disconnect", () => {
            console.log(
                `user '${player.name}' has disconnected from '${this.code}'`
            );
            this.removePlayer(player);
            this.sync();
        });

        if (sync) {
            this.sync();
        }
    }

    /**
     * Removes a player from the list by selectively filtering them out
     * @param toRemove The player to remove
     * @param sync If the room should sync after removing the player
     */
    public removePlayer(toRemove: Player, sync: boolean = true) {
        this.players = this.players.filter((player) => {
            return player !== toRemove;
        });

        if (this.players.length === 0) {
            console.log(`room '${this.code}' has no players, deleting room`);
            delete Room.allRooms[this.code];
            return;
        }

        if (sync) {
            this.sync();
        }
    }

    public abstract sync(): void;

    ///////////////
    // Protected //
    ///////////////

    protected players: Player[] = [];

    /**
     * Emit the same message to all connected players
     * @param ev
     * @param args
     */
    protected emitAll(ev: string, ...args: any[]) {
        this.players.forEach((player) => {
            player.socket.emit(ev, ...args);
        });
    }

    protected removeListeners(additional?: string[]) {
        let toRemove = ["disconnect"];
        if (additional !== undefined) {
            toRemove = toRemove.concat(additional);
        }
        toRemove.forEach((event) => {
            this.players.forEach((player) => {
                player.socket.removeAllListeners(event);
            });
        });
    }
}

export { Room };
