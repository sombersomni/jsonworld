import React, { Component } from "react";
import { connect } from "react-redux";
import Logo from "./Logo.js";
import Progress from "./Progress.js";

const mapStateToMenu = ( state, ownProps ) => {
	return state;
}

class Menu extends Component {
	constructor ( props ) {
		super( props );

		//initial state
		this.state = {
			classType: "show", 
			message: ""
		};

		//binding all functions to avoid side-effects
		this.audioFetcher = this.audioFetcher.bind( this );
		this.createController = this.createController.bind( this );
		this.initializeAudio = this.initializeAudio.bind( this );
		this.seperateSoundName = this.seperateSoundName.bind( this );
		this.handleClick = this.handleClick.bind( this );
	}
	audioFetcher ( sound ) {
		//a promise wrapper that takes care of fetching audio data
		return new Promise( ( res, rej ) => {
			const name = sound.name ? sound.name : this.seperateSoundName( sound.url );
			fetch( sound.url ).then( response => {
				if( response.ok ){
					//if response works, returns a array of sound information
					return response.arrayBuffer();
				} else {
					//stops the promise from even continuing
					rej( { message: name + " failed to download" } );
				}
			} ).then( buffer => {
				//create the audio context here and start decoding buffer
				const ctx = new AudioContext();
				ctx.decodeAudioData( buffer, data => {
					// assign the controller with each attribute 
					 let audio = this.createController( ctx, name, sound.sampleSize, data );
					 res( audio );
				} );
			} );
		} );
	}
	createController ( ctx, name, fftSize, data ) {
		// packs a controller object with it's specific data
		this.setState( Object.assign( this.state, { message: name + " completed" } ) );
		const analyser = ctx.createAnalyser();
		const gain = ctx.createGain();
		const source = ctx.createBufferSource();
	  	source.buffer = data;
		analyser.fftSize = fftSize;
		let timeData = new Uint8Array( analyser.fftSize );
		let frequencyData = new Uint8Array( analyser.frequencyBinCount )
		source.connect( gain );
		gain.connect( ctx.destination );

		let audioController = {
			name,
			ctx,
			source,
			analyser,
			gain,
			timeData,
			frequencyData,
		}

		return audioController;
	}
	handleClick() {
		console.log( "clicked" );
		this.props.dispatch( { type: "START_APP", start: true } );
		this.setState( { classType: "hide", message: "downloading sounds. please wait" } );
		this.initializeAudio( this.props.sounds );
	}
	initializeAudio ( sounds ) {
		//loops through promises and waits til all sounds are loaded
		const promiseArr = [];
		for ( let x = 0; x < sounds.length; x++ ) {
			const p = this.audioFetcher( sounds[x] );
			promiseArr.push( p );
		}
		Promise.all( promiseArr ).then( controlArr => {
			//array full of audio controllers
			this.setState( Object.assign( this.state, { message: "building world. please wait" } ) );
			console.log( controlArr );
		} ).catch( err => {
			this.setState( Object.assign( this.state, { message: err.message } ) );
		} );
	}
	seperateSoundName ( path ) {
		//if for some reason the name isn't in config, grabs it out the url path
		var pattern = /\w+(?!\/){1}(?=\.mp3|\.wav|\.ogg){1}/;
		var matchedString = path.match(pattern);
		var remappedArr = matchedString[0].split( "_" ).map( function ( each ) {
			return each.toLowerCase();
		} );
		var newString = remappedArr.join( " " );
		return newString;
	}
	render () {
		return (
			<div id = "menu">
				<Progress classType = { this.state.classType } message = { this.state.message } onclick = { this.handleClick } />
			</div>
		);
	}
}

const ReduxMenu = connect( mapStateToMenu )( Menu );
export default ReduxMenu;