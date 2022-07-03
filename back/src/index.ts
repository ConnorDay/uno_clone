import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { Room } from "./room";
import { Lobby } from "./lobby";

//Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

//////////////////
//Socket Methods//
//////////////////

io.on("connection", (socket) => {
    Room.registerConnection(
        {
            code: socket.handshake.query.code as string,
            name: socket.handshake.query.name as string,
        },
        socket,
        (code) => {
            return new Lobby(code);
        }
    );
});

////////////////
//HTTP METHODS//
////////////////

app.use(cors());
app.use(express.json());

const router = express.Router();
router.get("/", async (req, res) => {
    res.json({ message: "it worked" });
});

app.use("/", router);

server.listen(8000, () => console.log("Server has been started"));
