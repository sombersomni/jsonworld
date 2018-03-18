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
            "type": "box",
            "material": "standard",
            "color" : 0xffaa00,
            "count" : 1000,
            "positionRelativeTo" : "self",
            "size" : [ 20, 60, 20 ],
            "gridLayout": [ 3, 3, 3 ],
            "animation": "_moveRandomly 10s",
            "animationAsymmetry": true,
            "animationKeyframes" : {
                "_moveRandomly" : [ { x: 100, y: -10 }, { y: 40 }, { x: 50 }, { y: 100 } ]
            },
            "animationGrid": "basic",
            "shadow": true,
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