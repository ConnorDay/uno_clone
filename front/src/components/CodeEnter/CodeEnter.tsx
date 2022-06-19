import { useState } from "react";
import "./CodeEnter.css";

function handleSubmit(e: any, code: string, setText: (text: string) => void) {
    console.log(code);
    setText("");

    e.preventDefault();
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
                onChange={(event) => setInputText(event.target.value)}
                value={inputText}
            />
        </form>
    );
}

export { CodeEnter };
