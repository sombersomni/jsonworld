//World Component
import React, { Component } from "react";
import { connect } from "react-redux";
import * as THREE from "three";
import WorldController from "../WorldController.js";

var dummyOptions = {
    camera: {
        type: "perspective",
        fov: 90,
        near: 1,
        far: 2000
    },
    preloader: {
        type: "sphere",
        material: "normal",
        count: 3,
        size: 20,
        animation: {
            type: "spin_basic",
            speed: 5
        }
    }
};

let mapStateToWorld = ( state, ownProps ) => {
	return state;
}

class World extends Component {
	constructor ( props ) {
		super( props );
		
		this.world = null;

	}
	componentDidMount () {
		this.world = new WorldController( dummyOptions );
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
			</div>
		);
	}
	onMouseMove ( e ) {
		console.log( e.clientX );
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

const ReduxWorld = connect( mapStateToWorld )( World );

export default ReduxWorld;