//index
import React from "react";
import ReactDOM from "react-dom";
import World from "./components/World.js";

const config = {
    "worldObjects" : [
        {
            "grid" : "basic",
            "type" : "box",
            "size" : [ 50, 50, 50 ],
            "position" : "100 0 0", 
            "color" : "white",
            "count" : 50,
            "shadow" : true,
            "material" : "lambert",
            "texture" : "imgs/create.jpg"
            
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