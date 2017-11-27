//index
import React from "react";
import ReactDOM from "react-dom";
import Menu from "./components/Menu.js";
import World from "./components/World.js";

const config = {
	"bpm": 120,
	"genres": [ "progressive house", "house", "tech house" ],
	"logo": "imgs/logo.png", //it's best to have a transparent png for your logo
	"preloader": {
		type: "dodecahedron",
		size: 5
	}, // pick a preloader for when the app starts downloading sounds and builds 3D world
	"sounds": [
		//fill this array with sounds that will compliment each object. this is where your sound options should go
		{
			"type": "drums",
			"url": "tracked_songs/tundra_drums.mp3", //name your paths uniquely for a better user experience
			"obj_id": 1, //make sure the id number matches the object id for the object in worldObjects array
			"sampleSize": 512
		}, 
		{
			"name": "tundra synths",
			"type": "synth",
			"url": "tracked_songs/tundra_synth.mp3",
			"obj_id": 2,
			"sampleSize" : 1024
		}
	],
	"worldObjects": [
		//fill this array with objects that will compliment each sound. this is where your object options should go
		{
			"id": 1, // id can be a string or number, but make sure its unique
			"type": "lego", //can call primitive shapes like box or premade objects like lego
			"scale": 2, //pick the overall scale for the object. use an array for more control [ "x", "y", "z" ]
			"size": [ 5, 2, 3 ], // [ "width", "height", "depth" ] for easier creationg. you can use a single number for uniform sizing. if not defined, moves to default
			"position": [ 20, 0, -20 ] // starting position for object.[ "x", "y", "z" ].if not defined, computer will figure out a place to put it
		}
	]
};

const Main = () => {
	return (
		<div className = "container">
			<Menu logo = { config.logo } sounds = { config.sounds } />
			<World preloader = { config.preloader } objs = { config.worldObjects } />
		</div>
	);
}
const docRoot = document.querySelector( "#root" );
ReactDOM.render( <Main />, docRoot );