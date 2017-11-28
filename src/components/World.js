//World Component

import React, { Component } from "react";
import * as THREE from "three";

class World extends Component {
	constructor ( props ) {
		super( props );

		this.state = {
			windowHeight: undefined,
			windowWidth: undefined,
		}

		this.scene = new THREE.Scene();
		this.camera = undefined;
		this.canvas = undefined;
		this.clock = undefined;
		this.renderer = undefined;

		//bound functions
		this.initWorld = this.initWorld.bind( this );
		this.preloadTextures = this.preloadTextures.bind( this );
		this.createGeometry = this.createGeometry.bind( this );
	}
	componentDidMount () {
		this.canvas = document.getElementById( "world" );
		this.setState( Object.assign( this.state, { windowHeight: window.innerHeight, windowWidth: window.innerWidth } ) );

		this.initWorld();
	}
	createCamera ( options ) {
		let camera; 
		const newOptions = {
			aspect: options.aspectRatio !== undefined && typeof options.aspectRatio === "number" ? options.aspectRatio : ( this.state.windowWidth / this.state.windowHeight ),
			far: options.far !== undefined && typeof options.far === "number" ? options.far : 2000,
			fov: options.fov !== undefined && typeof options.fov === "number" ? options.fov : 50,
			near: options.near !== undefined && typeof options.near === "number" ? options.near : 0.1,
			position: options.position !== undefined && options.position instanceof Array && options.position.length === 3 ? options.position : [ 0, 0, 100 ]
		};
		if( options.type === "orthographic" ) {
			camera = new THREE.OrthographicCamera();
		} else {
			camera = new THREE.PerspectiveCamera( newOptions.fov, newOptions.aspect, newOptions.near, newOptions.far );
		}

		camera.position.x = newOptions.position[0];
		camera.position.y = newOptions.position[1];
		camera.position.z = newOptions.position[2];

		return camera;
	}
	createGeometry ( options ) {
		console.log( typeof options.size );
		switch( options.type ) {
			case "dodecahedron" :
				//creates dodecahedron geometry.
				if ( typeof options.size === "number" ) {
					//uses a single number for sizing
					return new THREE.DodecahedronGeometry( options.size );
				} 
				else if ( options.size instanceof Array && options.size.length > 1 && options.size.length <= 3 ) {
					//uses the first value which should be width
					return new THREE.DodecahedronGeometry( options.size[0] );
				} else {

					console.log( "size options are not valid for " + options.type );
				}
			default:
		}
	}
	createMaterial ( options ) {
		var color = options.color === "default" ? 0xffffff : options.color;
		switch( options.type ) {
			case "wireframe" :
				return new THREE.MeshBasicMaterial( { transparent: true, wireframe: true } );
			default:
				return new THREE.MeshBasicMaterial( { color } );

		}
	}
	createRenderer ( ) {
		var renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( this.state.windowWidth, this.state.windowWidth, true );
		return renderer;
	}
	initWorld () {
		//set up the world
		this.camera = this.createCamera( this.props.camera );
		//starts the world timer
		this.clock = new THREE.Clock();
		this.renderer = this.createRenderer();

		//preloads all textures
		const texturesLoaded = this.preloadTextures();

		var { preloader } = this.props;
		if ( preloader instanceof Object && typeof preloader === "object" && preloader.hasOwnProperty( "type" ) ) {
			var geo = this.createGeometry( preloader );
			var material = this.createMaterial ( { type: preloader.material !== undefined ? preloader.material : "default", 
				color: preloader.color !== undefined ? preloader.color : "default" } );
			var preloaderMesh = new THREE.Mesh( geo, material );
			//center current object
			preloaderMesh.position.x -= Math.floor( ( preloaderMesh.geometry.parameters.radius * preloaderMesh.scale.x ) / 2 );
			preloaderMesh.position.y += 25;
			preloaderMesh.scale.y /= 2;
			//proloaderMesh.position.x -= proloaderMesh.wi
			preloaderMesh.name = "preloader";
			this.scene.add( preloaderMesh );
		} else {
			console.log( "there is no preloader" );
		}
		texturesLoaded.then( data => {
			//console.log( data );
			//var geo = this.createGeometry( this.props.objs[0] );
			this.renderer.render( this.scene, this.camera );
			//console.log( geo );
		} );
			/*
			  var width = window.innerWidth,
			      height = window.innerHeight;
			  scene.background = new THREE.Color( 0xff0022 );
			  //scene.fog = new THREE.FogExp2( 0x220000, .02 );
			  
			  //logo
			  var logoTexture = new THREE.TextureLoader().load( "imgs/logo.png", function ( texture ) {
			    return texture;
			  } );
			  */
	}
	preloadTextures() {
		//wait for textures to load before starting anything
		return new Promise( (res, rej) => {
			new THREE.TextureLoader().load( "imgs/logo.png", texture => {
			    res( texture );
			} );
		} );
	}
	render () {
		return (
			<div>
				<canvas id="world" ></canvas>
			</div>
		);
	}
}

export default World;