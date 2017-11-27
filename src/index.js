//index
import React from "react";
import ReactDOM from "react-dom";
import Menu from "./components/Menu.js";
import World from "./components/World.js";

const config = {
	"bpm": 120,
	"genres": [ "progressive house", "house", "tech house" ],
	"logo": "imgs/logo.png", //it's best to have a transparent png for your logo
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
			"id": 1,

		}
	]
};

const Main = () => {
	return (
		<div className = "container">
			<Menu logo = { config.logo } sounds = { config.sounds } />
			<World />
		</div>
	);
}
const docRoot = document.querySelector( "#root" );
ReactDOM.render( <Main />, docRoot );