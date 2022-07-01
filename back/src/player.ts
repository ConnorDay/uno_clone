import { Socket } from "socket.io";

class Player {
    public name: string;
    public code: string;
    public socket: Socket;
    constructor(name: string, code: string, socket: Socket) {
        this.name = name;
        this.code = code;
        this.socket = socket;
    }
}

export { Player };
