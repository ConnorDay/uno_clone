import { io } from "socket.io-client";
import { Lobby } from "..";
import { CodeEnter } from "../../components";
import { Global } from "../../Global";
import "./Homescreen.css";

function Homescreen() {
    return (
        <div className="homescreen">
            <CodeEnter
                onSubmit={(code: string, name: string) => {
                    Global.connectionInfo = { code, name };
                    Global.socket = io(
                        `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
                        {
                            query: {
                                name,
                                code,
                            },
                        }
                    );
                    Global.setDisplay(<Lobby />);
                }}
            />
        </div>
    );
}

export { Homescreen };
