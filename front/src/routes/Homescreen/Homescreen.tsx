import { Lobby } from "..";
import { CodeEnter } from "../../components";
import "./Homescreen.css";

type Props = {
    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>;
};

function changeDisplay(
    setDisplay: React.Dispatch<React.SetStateAction<JSX.Element>>,
    code: string,
    name: string
) {
    setDisplay(
        <Lobby connectionInfo={{ code, name }} setDisplay={setDisplay} />
    );
}

function Homescreen(props: Props) {
    const { setDisplay } = props;

    return (
        <div className="homescreen">
            <CodeEnter
                onSubmit={(code: string, name: string) => {
                    changeDisplay(setDisplay, code, name);
                }}
            />
        </div>
    );
}

export { Homescreen };
