import React, { useState } from "react";
import "./App.css";
import { Homescreen, Lobby } from "./routes";

function App() {
    const [toDisplay, setDisplay] = useState(<Homescreen />);
    return <div className="App">{toDisplay}</div>;
}

export default App;
