import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

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
    console.log(`user ${socket.handshake.query.name} connected`);
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("message", (message) => {
        console.log(message);
    });

    socket.emit("message", `Hello ${socket.handshake.query.name}`);
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
