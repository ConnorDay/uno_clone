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

        //Let all other players in the room know that a new player has connected
        targetRoom.emitAll("playerConnected", { name });

        //Sync the new player so that they get all other connections
        //NOTE: this happens after adding the player so that they can see themselves in the player list
        targetRoom.addPlayer(new Player(name, code, socket));
        socket.emit("playerSync", targetRoom.playerSyncInfo);
    }

    ////////////
    // Public //
    ////////////

    public addPlayer(player: Player) {
        this.players.push(player);
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
