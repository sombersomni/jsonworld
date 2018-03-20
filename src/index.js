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
		"color": "1 .6 .6",

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
            "texture": "imgs/usflag.png",
            "segments": 256,
            "material": "standard",
            "color" : 0xffaa00,
            "positionRelativeTo" : "self",
     }
    ],
    "enableShadows": true,
    "development": true
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