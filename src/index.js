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
		"color": "1 .3 .3",

	},
	"font": "fonts/AlphaMack_AOE_Regular.json",
    "preloader": {
        "type": "sphere",
        "material": "wireframe",
        "size": 20,
        "animation": "spin-basic 5s"
    }, // pick a preloader for when the app starts downloading sounds and builds 3D world
	"worldObjects": [
        {
            "type": "plane",
            "segments": 4,
            "material": "wireframe",
            "color" : 0xffaa00,
            "positionRelativeTo" : "self",
            "size" : [ 200, 200 ],
            "development": true
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