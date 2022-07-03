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
                    Global.setDisplay(<Lobby />);
                }}
            />
        </div>
    );
}

export { Homescreen };
