//World Component

import React, { Component } from "react";
import * as THREE from "three";

class World extends Component {
	constructor ( props ) {
		super( props );
		//bound functions
		this.initWorld = this.initWorld.bind( this );
		this.preloadTextures = this.preloadTextures.bind( this );
	}
	componentDidMount () {
		var canvas = document.getElementById( "world" ), camera, clock, gui, scene, stats, renderer;

		this.initWorld();
	}
	initWorld () {
		//set up the world
		const texturesLoaded = this.preloadTextures();
		console.log( texturesLoaded );
		texturesLoaded.then( data => {
			console.log( data );
		} );
			/*
			  clock = new THREE.Clock();
			  var width = window.innerWidth,
			      height = window.innerHeight;
			  scene = new THREE.Scene();
			  scene.background = new THREE.Color( 0xff0022 );
			  //scene.fog = new THREE.FogExp2( 0x220000, .02 );
			  camera = new THREE.PerspectiveCamera( 100, width/height, 1, 1000 );
			  camera.position.z = 100;
			  renderer = new THREE.WebGLRenderer( { canvas: canvas } );
			  renderer.setPixelRatio( window.devicePixelRatio );
			  renderer.setSize( width, height );
			  
			  //logo
			  var logoTexture = new THREE.TextureLoader().load( "imgs/logo.png", function ( texture ) {
			    return texture;
			  } );
			  console.log( logoTexture );
			  var planeGeo = new THREE.PlaneGeometry( 100, 100, 4, 4 );
			  var legoMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true });
			  var logoMaterial = new THREE.MeshBasicMaterial( { transparent: true, map: logoTexture } );
			  var logo = new THREE.Mesh( planeGeo, logoMaterial );
			  logo.name = "logo";
			  //test object
			  var cube = createBox( 10, 10, 10, 1, legoMaterial );
			  cube.name = "cube";
			  cube.position.z = 30;
			  //scene
			  scene.add( cube );
			  scene.add( logo );
			  //renderer
			  camera.lookAt( logo.position );
			  renderer.render( scene, camera );
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
				<canvas id="world"></canvas>
			</div>
		);
	}
}

export default World;