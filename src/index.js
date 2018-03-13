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
        "animation": "erratic"
    }, // pick a preloader for when the app starts downloading sounds and builds 3D world
	"sounds": [
		//fill this array with sounds that will compliment each object. this is where your sound options should go
		{
			"id": 1,
			"type": "drums",
			"url": "tracked_songs/tundra_drums.mp3", //name your paths uniquely for a better user experience
			"sampleSize": 512
		}, 
		{
			"id" : 2,
			"name": "tundra_synths",
			"type": "synth",
			"url": "tracked_songs/tundra_synth.mp3",
			"sampleSize" : 1024
		}
	],
	"worldObjects": [
        {
            type: "models/model.obj",
            material: "standard"
        }
    ]
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