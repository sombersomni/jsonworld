//index
import React from "react";
import ReactDOM from "react-dom";
import World from "./components/World.js";

const config = {
    "antialias" : true,
    "enableShadows": true,
    "worldObjects" : [
        {
            "name" : "wooden-crate",
            "grid" : "basic",
            "layoutLimit" : "10 20 20",
            "margin": "20 0 0",
            "padding": 25,
            "type" : "box",
            "size" : [ 50, 50, 50 ],
            "position" : [ 0, 0, 0 ], 
            "color" : "white",
            "count" : 27,
            "shadow" : true,
            "material" : "lambert",
            "modifiers" : {
                "margin" : ( m ) => m + 2,
            },
            "texture" : "imgs/create.jpg"
            
        },
        {
            "name" : "floor",
            "type" : "plane",
            "color" : "#ff0000",
            "material" : "phong",
            "size" : "10000 10000",
            "rotation" : "90 0 0",
            "position" : [ 0, -100, 0 ],
            "shadow" : true
        },
      
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