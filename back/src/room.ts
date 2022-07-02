import { Socket } from "socket.io";
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
            Room.allRooms[code] = new Room();
        }
        const targetRoom = Room.allRooms[code];

        //Sync the new player so that they get all other connections
        //NOTE: this happens after adding the player so that they can see themselves in the player list
        const player = new Player(name, code, socket);
        targetRoom.addPlayer(player);
        targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);

        //Send a sync player signal on player disconnect
        socket.on("disconnect", () => {
            targetRoom.removePlayer(player);
            targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);
        });

        //Change when the player is ready or not
        socket.on("toggleReady", () => {
            player.ready = !player.ready;
            targetRoom.emitAll("playerSync", targetRoom.playerSyncInfo);
        });
    }

    ////////////
    // Public //
    ////////////

    /**
     * Add a player to the list.
     * For right now, all this does is push it to the list. This exists for compartmentalization.
     * @param player
     */
    public addPlayer(player: Player) {
        this.players.push(player);
    }

    /**
     * Removes a player from the list by selectively filtering them out
     * @param toRemove The player to remove
     */
    public removePlayer(toRemove: Player) {
        this.players = this.players.filter((player) => {
            return player !== toRemove;
        });
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
