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
		"density": .1
	},
	"menu": {
        "title": "imgs/header.png",
		"links": [ "https://open.spotify.com/episode/5Yd71D8hCdiDeTsKwaQW1Q", "https://twitter.com/kartunehustla" ],
		"animation": "default"
	},
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
		//fill this array with objects that will compliment each sound. this is where your object options should go
		{
			"type": "sphere", //can call primitive shapes like box or premade objects like lego
			"color": 0xFF7618, //you can use hex values, rgba(0,0,0,0) or strings such as "red"
			"scale": 2, //pick the overall scale for the object. use an array for more control [ "x", "y", "z" ]
			"size": [ 20, 10, 3 ], // [ "width", "height", "depth" ] for easier creationg. you can use a single number for uniform sizing. if not defined, moves to default
			"position": [ 20, 0, -20 ], // starting position for object.[ "x", "y", "z" ].if not defined, computer will figure out a place to put it
			"material": "normal",
			"sound_id": 1 //maps the sound to this object and will be replaced with uuid once ordered.
    },
        {
            "type": "dodecahedron",
			"animation": "spin_random",
            "color": 0x00ff22,
			"count": 100,
            "scale": [2,1,1],
            "size": 10,
            "position": 0,
			"material": "standard",
            "sound_id": 2,
			"isUniform": true
        }
	]
};

const dummy = {
	preloadApp: {
		start: false
	},
	audio: {
		controllers: []
	}
};

const reducer = ( state = {}, action ) => {
	switch( action.type ) {
		case "START_APP":
			var newState = Object.assign( {}, state, { preloadApp: { start : action.start } } );
			return newState;
        case "SEND_AUDIO_CONTROLLERS":
            var newState = Object.assign( {}, state, { audio: { controllers: action.payload } } );
            return newState;
		default:
			return state;
	}
};

const store = createStore( reducer, dummy );

const Main = () => {
	return (
		<div className = "container">
			<World  config = { config } />
		</div>
	);
}

const docRoot = document.querySelector( "#root" );
ReactDOM.render( <Provider store = { store } > 
					<Main />
				</Provider>, docRoot );