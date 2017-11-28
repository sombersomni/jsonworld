//World Component
import anime from "animejs";
import React, { Component } from "react";
import { connect } from "react-redux";
import * as THREE from "three";

let mapStateToWorld = ( state, ownProps ) => {
	return state;
}

class World extends Component {
	constructor ( props ) {
		super( props );
		
		this.state = {
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth
		}

		this.scene = new THREE.Scene();
		this.camera = undefined;
		this.canvas = undefined;
		this.clock = undefined;
		this.renderer = undefined;

		//bound functions
		this.draw = this.draw.bind( this );
		this.initWorld = this.initWorld.bind( this );
		this.preloadTextures = this.preloadTextures.bind( this );
		this.createGeometry = this.createGeometry.bind( this );
		this.createPreloader = this.createPreloader.bind( this );
		this.onWindowResize = this.onWindowResize.bind( this );
		this.onMouseMove = this.onMouseMove.bind( this );
	}
	componentDidMount () {
		window.addEventListener( "resize" , this.onWindowResize, false );
		this.canvas = document.getElementById( "world" );
		this.canvas.addEventListener( "mousemove", ( e ) => {
			this.onMouseMove( e );
		},  false );
		this.initWorld();
	}
	componentWillReceiveProps( nextProps ) {
		console.log( nextProps );
		//makes sure it doesn't equal current props and goes when true
		if ( nextProps.preloadApp.start !== this.props.preloadApp.start && nextProps.preloadApp.start ) {
			var logo = this.scene.getObjectByName( "logo" );
			this.scene.remove( logo );
			this.createPreloader( nextProps.preloader );
			var preloader = this.scene.getObjectByName( "preloader" );
			anime( {
				targets: preloader.rotation,
				y: Math.PI * 2,
				direction: "alternate",
				duration: 1000,
				loop: true
			} );
		}
	}
	render () {
		return (
			<div>
				<canvas id="world" ></canvas>
			</div>
		);
	}
	draw () {
		requestAnimationFrame( this.draw );
		this.renderer.render( this.scene, this.camera );
	}
	createCamera ( options ) {
		//setup camera options
		let camera; 
		console.log( this.state.windowHeight, this.state.windowWidth );
		const newOptions = {
			aspect: options.aspectRatio && typeof options.aspectRatio === "number" ? options.aspectRatio : ( this.state.windowWidth / this.state.windowHeight ),
			far: options.far && typeof options.far === "number" ? options.far : 2000,
			fov: options.fov && typeof options.fov === "number" ? options.fov : 50,
			near: options.near && typeof options.near === "number" ? options.near : 0.1,
			position: options.position && options.position instanceof Array && options.position.length === 3 ? options.position : [ 0, 0, 100 ]
		};
		if( options.type === "orthographic" ) {
			camera = new THREE.OrthographicCamera();
		} else {
			camera = new THREE.PerspectiveCamera( newOptions.fov, newOptions.aspect, newOptions.near, newOptions.far );
		}

		camera.position.set( newOptions.position[0], newOptions.position[1], newOptions.position[2] );
		return camera;
	}
	createPreloader ( preloader ) {
		//creates preloader based on config options
		if ( preloader instanceof Object && typeof preloader === "object" && preloader.hasOwnProperty( "type" ) ) {
			var geo = this.createGeometry( preloader );
			var material = this.createMaterial ( { type: preloader.material ? preloader.material : "default", 
				color: preloader.color ? preloader.color : "default" } );
			var preloaderMesh = new THREE.Mesh( geo, material );
			//center current object
			preloaderMesh.position.x -= Math.floor( ( preloaderMesh.geometry.parameters.radius * preloaderMesh.scale.x ) / 2 );
			preloaderMesh.position.y += 25;
			preloaderMesh.scale.set( 2, 2, 2 );
			//proloaderMesh.position.x -= proloaderMesh.wi
			preloaderMesh.name = "preloader";
			this.scene.add( preloaderMesh );
			return;
		} else {
			console.log( "there is no preloader" );
		}
	}
	createGeometry ( options ) {
		//goes through every geometry type plus custom ones
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
					return;
				}
			case "plane" :
				//creates plane geometry
				var segments = options.segments ? options.segments : 1;
				if ( typeof options.size === "number" ) {
					//uses a single number for sizing
					var size = options.size;
					return new THREE.PlaneGeometry( size, size, segments );
				} 
				else if ( options.size instanceof Array && options.size.length > 1 && options.size.length <= 3 ) {
					//uses the first value which should be width
					return new THREE.PlaneGeometry( options.size[0], options.size[1], segments );
				} else {

					console.log( "size options are not valid for " + options.type );
					return;
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
		renderer.setClearColor( 0xf266cc );
		return renderer;
	}
	initWorld () {
		//set up the world
		this.camera = this.createCamera( this.props.camera );
		//starts the world timer
		this.clock = new THREE.Clock();
		this.renderer = this.createRenderer();
		this.scene.background = 0xf266cc;
		//preloads all textures
		const texturesLoaded = this.preloadTextures();
		texturesLoaded.then( data => {
			//texture data is colected here
			console.log( data );
			if ( data.name.toLowerCase() === "logo_texture" ) {
				var material = new THREE.SpriteMaterial( { map: data, transparent: true, fog: this.fog ? true : false } );
				var sprite = new THREE.Sprite( material );
				sprite.name = "logo";
				sprite.position.set( 0, 20, 0);
				sprite.scale.set( 2000 / 40, 842 / 40, 0 );
				console.log( sprite );
				this.scene.add( sprite );
				this.camera.aspect = window.innerWidth / window.innerHeight;
			    this.camera.updateProjectionMatrix();

			    this.renderer.setSize( window.innerWidth, window.innerHeight );
				requestAnimationFrame( this.draw );
			}
		} );
	}
	onMouseMove ( e ) {
		console.log( e.clientX );
	}
	onWindowResize () {

	    this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize( window.innerWidth, window.innerHeight );

	}
	preloadTextures() {
		//wait for textures to load before starting anything
		return new Promise( (res, rej) => {
			new THREE.TextureLoader().load( "imgs/logo.png", texture => {
				texture.name = "logo_texture";
			    res( texture );
			} );
		} );
	}
}

const ReduxWorld = connect( mapStateToWorld )( World );

export default ReduxWorld;