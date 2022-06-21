import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Lobby() {
    useEffect(() => {
        const socket = io(
            `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
            {
                query: {
                    name: "test name :)",
                },
            }
        );

        socket.on("message", (message) => {
            console.log(message);
        });

        socket.emit("message", "hello :)");
    }, []);
    return <div>this is the lobby </div>;
}

export { Lobby };
