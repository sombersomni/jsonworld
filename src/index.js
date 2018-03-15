//index
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import World from "./components/World.js";

const config = {
	"bpm": 120,
	"genres": "house",
    "camera": {
        "type": "perspective",
        "fov": 90,
        "near": 1,
        "far": 2000
    },
	"fog": {
		"type": "exponential",
		"color": "1 0 0",

	},
	"font": "fonts/AlphaMack_AOE_Regular.json",
    "preloader": {
        "type": "sphere",
        "material": "wireframe",
        "size": 20,
        "animation": "spin_basic 5s"
    }, // pick a preloader for when the app starts downloading sounds and builds 3D world
	"worldObjects": [
        {
            "type": "dodecahedron",
            "material": "wireframe",
            "color" : 0x33cc00,
            "gridLayout": [ 3, 3, 3 ],
            "animation": "erratic, spin_basic 2s, custom_moveUp 5s",
            "animationGrid": "basic",
            "animationKeyframes": {
                "erratic" : "10 20 40",
                "linear": "50 100 -50 -80 50", //you can also define each value in string notation like css,
                "custom-make-big": [ { scaleX: 2 }, { scaleX: 3 } ], //with custom animations you need to define what you want to change in the animation
                //you can use "scale" like the property above, or "rotation, position, opacity and a range of others"
                //if key of object is not defined in our dictionary of useable properties, a default position x
                "custom_moveUp": [ { y: Math.random() * 100 }, { y: Math.random() * 100 }, { y: Math.random() * 100 }, { y: Math.random() * 100 } ], //you can also only have one value if needed you can use random numbers
                "spin_random" : "10 30 -20 360"
            },
            "shadow": true
        }
    ],
    "enableShadows": true
};


const Main = () => {
	return (
		<div className = "container">
            <World  config = { config } />
		</div>
	);
}

const docRoot = document.querySelector( "#root" );
ReactDOM.render(<Main />, docRoot );