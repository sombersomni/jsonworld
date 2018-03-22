//index
import React from "react";
import ReactDOM from "react-dom";
import World from "./components/World.js";

const wallColor = "yellow";
const config = {
    "antialias" : true,
    "enableShadows": true,
    "worldObjects" : [
        {
            "name" : "wooden-crate",
            "grid" : "basic",
            "layoutLimit" : "10 10 10",
            "margin": "20 0 0",
            "padding": 10,
            "type" : "box",
            "size" : [ 50, 50, 50 ],
            "position" : [ 0, 0, 0 ], 
            "color" : "white",
            "count" : 149,
            "shadow" : true,
            "material" : "lambert",
            "modifiers" : {
                "margin" : ( m ) => m + 2,
            },
            "texture" : "imgs/create.jpg",
            "animation" : "_floatUp asymmetry",
            "animationKeyframes" : {
                "_floatUp" : [ { y: 1000 } ]
            }
            
        },
        {
            "name" : "floor",
            "type" : "plane",
            "color" : wallColor,
            "material" : "phong",
            "size" : "10000 10000",
            "rotation" : "45 0 0",
            "position" : [ 0, -200, 0 ],
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