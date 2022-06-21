import { useState } from "react";
import "./CodeEnter.css";

function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    code: string,
    setText: (text: string) => void
) {
    setText("");

    e.preventDefault();
}

function handleTextChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setInputText: (text: string) => void
) {
    //Check if the new text has an invalid character (non-alphanumeric)
    const isInvalid = /[^a-z0-9\-\_]+/i.test(event.target.value);

    //Only set the new text if it is valid
    if (!isInvalid) {
        setInputText(event.target.value);
    }
}

function CodeEnter() {
    const [inputText, setInputText] = useState("");
    return (
        <form
            className="CodeEnter"
            onSubmit={(e) => handleSubmit(e, inputText, setInputText)}
        >
            <label htmlFor="codeInput">Please enter a code</label>
            <input
                type="text"
                id="codeInput"
                onChange={(event) => handleTextChange(event, setInputText)}
                value={inputText}
            />
        </form>
    );
}

export { CodeEnter };
