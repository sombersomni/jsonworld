//World Component
import React, { Component } from "react";
import { connect } from "react-redux";
import * as THREE from "three";

import Progress from "./Progress.js";
import WorldController from "../WorldController.js";

class World extends Component {
	constructor ( props ) {
		super( props );
		
		this.world = null;

	}
	componentDidMount () {
		this.world = new WorldController( this.props.config );
		this.world.start();
		console.log( this.world );
		window.addEventListener( "resize" , this.onWindowResize, false );
		var canvas = document.getElementById( "world" );
		canvas.addEventListener( "mousemove", ( e ) => {
			this.onMouseMove( e );
		},  false );
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
		return (
			<div>
				<canvas id="world" ></canvas>
				<Progress message = { "dummy message" } />
			</div>
		);
	}
	onMouseMove ( e ) {
		//console.log( e.clientX );
	}
	onWindowResize () {

	    this.world.camera.aspect = window.innerWidth / window.innerHeight;
	    this.world.camera.updateProjectionMatrix();

	    this.world.renderer.setSize( window.innerWidth, window.innerHeight );

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