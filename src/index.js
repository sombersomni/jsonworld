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
            "type": "custom",
            "material": "wireframe",
            "count": 100,
            "gridLayout": [ 3, 3, 3 ],
            "animation": "linear 2s asymmetry, spin_basic 2s, custom_moveUp 3s asymmetry, blah 2s, zoom_beat 4s ease-in-sine 1s 2 alternate",
            "animationGrid": "basic",
            "animationKeyframes": {
                "linear": "50 100 -50 0", //you can also define each value in string notation like css,
                "custom-make-big": [ { scaleX: 2 }, { scaleX: 3 } ], //with custom animations you need to define what you want to change in the animation
                //you can use "scale" like the property above, or "rotation, position, opacity and a range of others"
                //if key of object is not defined in our dictionary of useable properties, a default position x
                "custom_moveUp": [ { y: Math.random() * 100 } ] //you can also only have one value if needed you can use random numbers
            }
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