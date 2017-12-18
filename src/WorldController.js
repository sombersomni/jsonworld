import * as THREE from "three";

import animationChoices from "./animationChoices.js";
import geometryChoices from "./geometryChoices.js";
import initializeAudio from "./audioInitializer.js";
import progressEmitter from "./events/progressEmitter";

function WorldController (options) {
    this.preloader = options.preloader;
    this.sounds = options.sounds;
    this.worldObjects = options.worldObjects;
    //packages for storing
    this.audioControllers = [];
    this.cameras = [];
    this.scenes = [];
    //

    this.canvas = this.getCanvas();
    this.camera = this.setupCamera( options );
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.renderer = this.setupRenderer( options );


    this.runScene = this.runScene.bind( this );
}

var framework = {
    createAnime: animationChoices,
    createGeometry: geometryChoices,
    createMaterial: function ( material, color = 0xffffff ) {
        color = color !== undefined ? color : 0xffffff;
        material = material !== undefined ? material : "wireframe";
        switch( material ) {
            case "normal" :
                return new THREE.MeshNormalMaterial( { flatShading: true, side: THREE.DoubleSide, transparent: true } );
            case "wireframe" :
                return new THREE.MeshNormalMaterial( { transparent: true, wireframe: true } );
            default:
                return new THREE.MeshBasicMaterial( { color } );

        }
    },
    getCanvas: function ( id = "world" ) {
        //if canvas doesn't exist we will create one//
        const canvas = document.querySelector( "canvas" );
        if( canvas === null || canvas === undefined ) {
            let newCanvas = document.createElement( "canvas" );
            newCanvas.setAttribute( "id", id );
            document.body.appendChild( newCanvas );
            return newCanvas;
        } else {
            return canvas;
        }
    },
    setupCamera: function ( options = {} ) {
        //camera setup * need to add cinematic option later
        const opt = options.camera || options;
        let camera;
        const width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        const aspectRatio = width/ height,
            fov = opt.fov !== undefined ? opt.fov : 60,
            far = opt.far !== undefined ? opt.far : 1000,
            type = opt.type !== undefined ? opt.type : "perspective",
            near = opt.near !== undefined ? opt.near : .01;

        switch( type.toLowerCase() ) {
            case "perspective":
                camera = new THREE.PerspectiveCamera( fov, aspectRatio, near, far );
                break;
            case "orthographic":
                camera = new THREE.OrthographicCamera( width/ -2, width / 2, height/ 2, height/ -2, near, far );
                break;
            default:
                console.warn( "this camera type is not acceptable" );

        }
        camera.position.set( 0, 0, 200 );

        if( this.cameras.length > 0 ) {
            camera.name = "cam_"+ this.cameras.length ;
            this.cameras.push( camera );
        } else {
            camera.name = "main";
            this.cameras.push( camera );
        }

        return camera;
    },
    setupMesh: function ( options, sI ) {
        let g = this.createGeometry( options );
        let m = this.createMaterial( options.material, options.color );
        let mesh = new THREE.Mesh( g, m );
        mesh.name = this.scenes.length === 1 ? "preloader" : "";
        mesh.anime = this.createAnime( mesh, options.animation );
        this.scenes[ sI ].add( mesh );
    },
    setupScene: function( options = {}, audioControllers ) {
        this.scenes.push( new THREE.Scene() );
        this.scenes[ this.scenes.length - 1 ].name = this.scenes.length === 1 ? "menu" : "main";
        if( this.scenes.length === 1 ) {
            this.scene = this.scenes[0];
        }
        if( options instanceof  Array ) {
            options.forEach( ( o ) => {
                this.setupMesh( o, 1 );
            } );
        } else {
            this.setupMesh( options, this.scenes.length - 1 );
        }
    },
    setupRenderer: function ( options = {} ) {
        const opt = options.renderer || options;
        let renderer = new THREE.WebGLRenderer( { canvas : this.canvas } );
        const color = opt.color !== undefined ? opt.color : 0x0022CC,
            width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        renderer.setSize( width, height );
        renderer.setPixelRatio( window.devicePixelRatio );
        //bg color
        renderer.setClearColor( color );
        return renderer;
    },
    start: function () {
        const audioPromise = initializeAudio( this.sounds );
        this.setupScene( this.preloader );
        requestAnimationFrame( this.runScene );

        audioPromise.then( ( controllers ) => {
            progressEmitter.emit( "message", { message: "building world. please wait" } );
            this.audioControllers = controllers;
            this.setupScene( this.worldObjects, controllers );

            const fadeTime = 10000;
            //add a delay

            let preloader = this.scene.getObjectByName( "preloader" );
            preloader.anime = this.createAnime( preloader, "fade" );
            setTimeout( () => {
                progressEmitter.emit( "message", { message: "" } );
                this.scene = this.scenes[1];
                console.log( this.scene );
            }, fadeTime );
        } );

    },
    runAnimations: function ( time ) {
        this.scene.children.forEach( ( m ) => {
            if( m.type.toLowerCase() === "mesh" ) {
                if( typeof m.anime === "function" ) {
                    m.anime( time, m.name );
                } else {
                    m.material.needsUpdate = true;
                }
            }
        });
    },
    runScene: function () {
        requestAnimationFrame( this.runScene );
        var time = this.clock.getDelta();
        var elaspedTime = this.clock.getElapsedTime();
        this.runAnimations( elaspedTime );
        this.camera.aspect = window.innerWidth/ window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.render( this.scene, this.camera );
    }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;