//World Component
import React, { Component } from "react";
import * as THREE from "three";

import progressEmitter from "../events/progressEmitter.js";
import Progress from "./Progress.js";
import WorldController from "../WorldController.js";

class World extends Component {
	constructor ( props ) {
		super( props );

		this.state = {
			message: "click the screen to start.",
		};

		this.world = new WorldController( this.props.config );
	}
	createLinks ( links ) {
		var pattern = /(bandcamp|instagram|soundcloud|spotify|twitter|tumblr|youtube){1}/;
		var domLinks = [];
		for ( let i = 0; i < links.length; i++ ) {
			var match = links[i].match( pattern );
			domLinks.push( <a href = { links[i]} key ={ match[0] } ><span className ="fa-stack fa-lg">
			  <i className = "fa fa-square-o fa-stack-2x"></i>
			  <i className ={ "fa fa-" + match[0] + " fa-stack-1x" }></i>
			</span> </a> );
		}
		return domLinks;
	}
	componentDidMount () {
        progressEmitter.on("message", ( e ) => {
            this.setState( { message: e.message } );
        } );
		this.world.start();
	}
	componentWillReceiveProps( nextProps ) {
		console.log( nextProps );
		//makes sure it doesn't equal current props and goes when true
		/*
		if ( nextProps.preloadApp.start !== this.props.preloadApp.start && nextProps.preloadApp.start ) {
			var logo = this.scene.getObjectByName( "logo" );
			this.scene.remove( logo );
			this.createPreloader( nextProps.preloader, this.scene );
			var preloader = this.scene.getObjectByName( "preloader" );
			anime( {
				targets: preloader.rotation,
				y: Math.PI * 2,
				direction: "alternate",
				duration: 1000,
				loop: true
			} );
		}
		*/
	}
	render () {
		const { config } = this.props;
		return (
			<div>
				<div id = "links">
					{ this.createLinks( config.menu.links ) }
				</div>
				<canvas id="world" ></canvas>
				<Progress message = { this.state.message } />
			</div>
		);
	}
	preloadTextures( textures ) {
		//wait for textures to load before starting anything
		return new Promise( ( res ) => {
			new THREE.TextureLoader().load( "imgs/logo.png", texture => {
				texture.name = "logo_texture";
			    res( texture );
			} );
		} );
	}
}

export default World;