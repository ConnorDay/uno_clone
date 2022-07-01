import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Homescreen } from "../Homescreen/Homescreen";

type Props = {
    connectionInfo: { name: string; code: string };
    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>;
};

function Lobby(props: Props) {
    const { name, code } = props.connectionInfo;
    const { setDisplay } = props;

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
    return (
        <div>
            this is the lobby{" "}
            <button
                onClick={() =>
                    setDisplay(<Homescreen setDisplay={setDisplay} />)
                }
            >
                go back
            </button>
        </div>
    );
}

export { Lobby };
