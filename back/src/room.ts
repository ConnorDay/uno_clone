import { Socket } from "socket.io";
import { Player } from "./player";

type roomDictionary = {
    [key: string]: Room;
};
type connectionInfo = {
    code: string;
    name: string;
};

class Room {
    ////////////
    // Static //
    ////////////

    static allRooms: roomDictionary = {};

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
    }

    ////////////
    // Public //
    ////////////

    public addPlayer(player: Player) {
        this.players.push(player);
    }

    public removePlayer(toRemove: Player) {
        this.players = this.players.filter((player) => {
            return player !== toRemove;
        });
    }

    public emitAll(ev: string, ...args: any[]) {
        this.players.forEach((player) => {
            player.socket.emit(ev, ...args);
        });
    }

    public get playerSyncInfo(): string[] {
        const toReturn: string[] = [];

        this.players.forEach((player) => {
            toReturn.push(player.name);
        });

        return toReturn;
    }

    /////////////
    // Private //
    /////////////

    private players: Player[] = [];
}

export { Room };
