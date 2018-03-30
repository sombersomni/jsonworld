//index
import React from "react";
import ReactDOM from "react-dom";
import World from "./components/World.js";

const wallColor = "yellow";
const config = {
    
    "enableShadows": true,
    "camera" : {
        "type" : "perspective",
    },
    "worldObjects" : [
        {
            "name" : "floor",
            "type" : "plane",
            "color" : "yellow",
            "material" : "phong",
            "size" : "20000 20000",
            "rotation" : "90 0 0",
            "position" : [ 0, -500, 10000 ],
            "shadow" : true
        },
        {
            "name" : "hearts",
            "material" : "lambert",
            "count" : 10,
            "color" : "#FF000A",
            "type" : "heart",
            "extrude" : {
               amount: 10,
                
            },
            "size" : "5 5 5",
            "position" : "0 0 0",
            "shadow" : true,
            "debug" : true
        },
        {
            "name" : "ball",
            "type" : "sphere",
            "position" : 0,
            "size" : 3,
            "color" : "red"
        }
    ]
}

/* 

{
            "name" : "wooden-crate",
            "grid" : "basic",
            "layoutLimit" : "10 10 10",
            "margin": "20 0 0",
            "padding": 10,
            "type" : "box",
            "size" : [ 50, 50, 50 ],
            "position" : [ 0, 0, 0 ], 
            "scale" : [ 1, 2, 1 ],
            "color" : "white",
            "count" : 149,
            "shadow" : true,
            "material" : "lambert",
            "modifiers" : {
                "margin" : ( m ) => m + 2,
            },
            "texture" : "imgs/create.jpg",
            "animation" : "_floatUp 20s asymmetry",
            "animationKeyframes" : {
                "_floatUp" : [ { y: 1000 } ]
            }
            
        }
*/

const Main = () => {
	return (
		<div className = "container">
            <World  config = { config } />
		</div>
	);
}

const docRoot = document.querySelector( "#root" );
ReactDOM.render(<Main />, docRoot );