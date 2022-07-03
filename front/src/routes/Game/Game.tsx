import { useEffect } from "react";
import { Global } from "../../Global";

function Game() {
    const { socket } = Global;
    useEffect(() => {
        socket.emit("gameLoaded");
    }, []);
    return <>this is the game screen</>;
}

export { Game };
