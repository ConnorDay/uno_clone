import { CodeEnter } from "../../components";
import "./Homescreen.css";

function Homescreen() {
    return (
        <div className="homescreen">
            <p>{process.env.REACT_APP_HOST}</p>
            <CodeEnter />
        </div>
    );
}

export { Homescreen };
