import React, { useState } from "react";
import "./App.css";
import { Global } from "./Global";
import { Homescreen } from "./routes";

function App() {
    //Set the default display to be the homescreen. When a code/ name is submitted, change to the lobby and pass along the connection info
    const [toDisplay, setDisplay] = useState(<Homescreen />);

    if (Global.setDisplay === undefined) {
        Global.setDisplay = setDisplay;
    }

    return <div className="App">{toDisplay}</div>;
}

export default App;
