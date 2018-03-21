//index
import React from "react";
import ReactDOM from "react-dom";
import World from "./components/World.js";

const config = {
    "worldObjects" : [
        {
            "type" : "sphere",
            "size" : 20,
            "position" : "100 0 0", 
            "color" : "red",
            "count" : 5,
            "shadow" : true
            
        }
    ]
}


const Main = () => {
	return (
		<div className = "container">
            <World  config = { config } />
		</div>
	);
}

const docRoot = document.querySelector( "#root" );
ReactDOM.render(<Main />, docRoot );