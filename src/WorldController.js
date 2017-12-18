import * as THREE from "three";
import anime from "animejs";

import animationChoices from "./animationChoices.js";

import initializeAudio from "./AudioController.js";

function WorldController (options) {
    this.preloader = options.preloader;
    this.sounds = options.sounds;
    //packages for storing
    this.audioControllers = [];
    this.cameras = [];
    this.scenes = [];
    //

    this.canvas = this.getCanvas();
    this.camera = this.setupCamera( options );
    this.clock = new THREE.Clock();
    this.audioControllers = undefined;
    this.scene = new THREE.Scene();
    this.renderer = this.setupRenderer( options );


    this.runScene = this.runScene.bind( this );
}

var framework = {
    initPreloader: function ( options ) {
        let g = this.createGeometry( options );
        let m = this.createMaterial( options.material, options.color );
        let mesh = new THREE.Mesh( g, m );
        this.setupMesh(g, m);
        mesh.name = "root";
        let wrapper = new THREE.Group();
        mesh.anime = this.createAnime( mesh, options.animation );
        wrapper.add( mesh );
        wrapper.name = "preloader";
        this.scene.add( wrapper );
    },
    createAnime: animationChoices,
    createGeometry: function ( options = {} ) {
        //goes through every geometry type plus custom ones
        var segments = options.segments ? options.segments : 2,
            type = options.type !== undefined ? options.type : "default";
        var size;
        if ( typeof options.size === "number" ) {
            //uses a single number for sizing
            size = options.size;
        } else if ( options.size instanceof Array ) {
            console.log( "this is an array for size" );
        }
        else {
            console.log( "size options are not valid for " + options.type );
            return;
        }
        //CHOICES
        switch( type ) {
            case "box":
                if( typeof options.size === "number" ) {
                    return new THREE.BoxGeometry( size, size, size );
                } else {
                    return new THREE.BoxGeometry( size[0], size[1], size[2] );
                }
            case "cylinder" :
                return new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
            case "dodecahedron" :
                //creates dodecahedron geometry.
                return new THREE.DodecahedronGeometry( size );
            case "plane" :
                //creates plane geometry
                if ( typeof options.size === "number" ) {
                    //uses a single number for sizing
                    var size = options.size;
                    return new THREE.PlaneGeometry( size, size, segments );
                } else {
                    //uses the first value which should be width
                    return new THREE.PlaneGeometry( size[0], size[1], segments );
                }
            case "sphere":
                return new THREE.SphereGeometry( size ? size : 1 );
            default:
        }
    },
    createMaterial: function ( material, color = 0xffffff ) {
        color = color !== undefined ? color : 0xffffff;
        material = material !== undefined ? material : "wireframe";
        switch( material ) {
            case "normal" :
                return new THREE.MeshNormalMaterial( { flatShading: true, side: THREE.DoubleSide, transparent: true, opacity: .5 } );
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
    setupMesh: function (g, m) {

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
        this.scene.name = "menu";
        const menuScene = this.scene;
        this.scenes.push( menuScene );
        this.initPreloader( this.preloader );
        requestAnimationFrame( this.runScene );

        audioPromise.then( ( controllers ) => {
           this.audioControllers = controllers;
           const fadeTime = 10000;
           //add a delay

            var preloader = this.scene.getObjectByName( "preloader" );
            preloader.children[0].anime = this.createAnime( preloader.children[0], "fade" );
            setTimeout( () => {
                this.scenes.push( new THREE.Scene() );
                this.scene = this.scenes[1];
            }, fadeTime );
        } );

    },
    runAnimations: function ( time ) {
        this.scene.children.forEach( ( obj ) => {
            if( obj.type.toLowerCase() === "group" ) {
                obj.children.forEach( ( m ) => {
                    if( typeof m.anime === "function" ) {
                        m.anime( time, m.name );
                    } else {
                        m.material.needsUpdate = true;
                    }
                } );
            }
        });
    },
    runScene: function () {
        requestAnimationFrame( this.runScene );
        var time = this.clock.getDelta();
        var elaspedTime = this.clock.getElapsedTime();
        if ( Math.round( elaspedTime ) % 20 === 0 ) {
            console.log( this.audioControllers );
        }
        this.runAnimations( elaspedTime );
        this.camera.aspect = window.innerWidth/ window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.render( this.scene, this.camera );
    }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;