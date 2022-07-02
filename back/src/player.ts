import { Socket } from "socket.io";
import { randomUUID } from "crypto";

class Player {
    public name: string;
    public code: string;
    public socket: Socket;
    public id: string;
    public ready = false;

    constructor(name: string, code: string, socket: Socket) {
        this.name = name;
        this.code = code;
        this.socket = socket;
        this.id = randomUUID();
    }
}

export { Player };
