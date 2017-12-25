import * as THREE from "three";
import ThreeBSP from "./csg/threeCSG.js";

//UTILS
import colorInterpreter from "./utils/colorInterpreter.js";
import calculateCameraView from "./utils/cameraView.js";

import createAnime from "./createAnime.js";
import createGeometry from "./createGeometry.js";
import createMaterial from "./createMaterial.js";


import initializeAudio from "./audioInitializer.js";
import progressEmitter from "./events/progressEmitter";

function WorldController (options) {

    this.menu = options.menu;
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
    this.fog = this.setupFog( options );
    this.scene = new THREE.Scene();
    this.renderer = this.setupRenderer( options );

    this.initWorld = this.initWorld.bind( this );
    this.runScene = this.runScene.bind( this );
}

const framework = {
    createAnime,
    createGeometry,
    createMaterial,
    getCanvas: function ( id = "world" ) {
        //if canvas doesn't exist we will create one//
        const canvas = document.querySelector("canvas");
        if (canvas === null || canvas === undefined) {
            let newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("id", id);
            document.body.appendChild(newCanvas);
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
        const aspectRatio = width / height,
            fov = opt.fov !== undefined ? opt.fov : 60,
            far = opt.far !== undefined ? opt.far : 1000,
            type = opt.type !== undefined ? opt.type : "perspective",
            near = opt.near !== undefined ? opt.near : .01;

        switch (type.toLowerCase()) {
            case "perspective":
                camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
                break;
            case "orthographic":
                camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, near, far);
                break;
            default:
                console.warn("this camera type is not acceptable");

        }
        camera.position.set(0, 0, 200);

        if (this.cameras.length > 0) {
            camera.name = "cam_" + this.cameras.length;
            this.cameras.push(camera);
        } else {
            camera.name = "main";
            this.cameras.push(camera);
        }

        return camera;
    },
    setupMesh: function ( options, sI ) {
        if ( options.count !== undefined && options.count > 1 ) {
            let group = new THREE.Group();
            for ( let i = 0; i <= options.count - 1; i++ ) {
                let g = this.createGeometry(options);
                let m = this.createMaterial(options);
                let mesh = new THREE.Mesh( g, m );
                //mesh.material.color = new THREE.Color( i/options.count, .5, .5 );
                mesh.name = options.name !== undefined ? options.name + "i" : "";
                mesh.anime = this.createAnime( mesh, options.animation );
                mesh.position.set( Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1 ) ),
                    Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1 ) ),
                    Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1) ) );
                group.add( mesh );
            }
            this.scenes[sI].add( group );
        } else {
            let g = this.createGeometry(options);
            let m = this.createMaterial(options);
            let mesh = new THREE.Mesh( g, m );
            mesh.name = options.name !== undefined ? options.name : "";
            mesh.anime = this.createAnime(mesh, options.animation);
            this.scenes[sI].add(mesh);
        }

        return;

    },
    setupScene: function( options = {}, audioControllers = {} ) {
        this.scenes.push( new THREE.Scene() );
        this.scenes[ this.scenes.length - 1 ].name = this.scenes.length === 1 ? "menu" : "main_" + this.scenes.length - 1;
        this.scenes[ this.scenes.length - 1 ].fog = this.fog;
        let light = new THREE.DirectionalLight( 0xffffff, 100 );
        light.position.set( 0, 1000, 0 );
        this.scenes[ this.scenes.length - 1 ].add( light );
        if (options instanceof Array) {
            options.forEach( ( o ) => {
                this.setupMesh(o, this.scenes.length - 1 );
            });
        } else {
                this.setupMesh( options, this.scenes.length - 1 );
        }

        return;
    },
    setupRenderer: function ( options = {} ) {
        const opt = options.renderer || options;
        let renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        const color = opt.color !== undefined ? opt.color : 0xcc0022,
            width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        //bg color
        renderer.setClearColor(color);
        return renderer;
    },
    setupFog: function ( options = {} ) {
        let fog;
        const opt = options.fog !== undefined ? options.fog : {};
        const camOpt = options.camera !== undefined ? options.camera : {};
        const color = opt.color !== undefined ? colorInterpreter( opt.color )  :  new THREE.Color();
        const density = opt.density !== undefined ? opt.density : .0025;
        const far = camOpt.far !== undefined ? camOpt.far : 1000;
        const type =  opt.type !== undefined ? opt.type : "exponential";
        const near = camOpt.near !== undefined ? camOpt.near : .01;

        if ( type === "linear" ) {
            fog = new THREE.Fog( color, near, far );
        } else {
            fog = new THREE.FogExp2( color, density );
        }
        return fog;
    },
    initWorld: function () {
        //initializes world after clicking and removes event listener to prevent memory leaks
        this.canvas.removeEventListener("click", this.initWorld, false);
        let title = this.scenes[ this.scenes.length - 1 ].getObjectByName( "title" );
        const camData = calculateCameraView( title.position.z, this.camera );
        //title.scale.set( 1 * ( camData.width / title.geometry.parameters.width ), 1 * ( camData.width / title.geometry.parameters.height ), 1 );
        title.anime = this.createAnime( title, "fade" );
        const audioPromise = initializeAudio( this.sounds );
        //delays preloader but not the audio loader
        setTimeout( () => {
            this.scenes[ this.scenes.length - 1 ].remove( title );
            this.preloader.name = "preloader";
            this.setupMesh( this.preloader, this.scenes.length - 1 );
        }, 1000 );

        audioPromise.then( ( controllers ) => {
            progressEmitter.emit( "message", { message: "building world. please wait" } );
            this.audioControllers = controllers;
            this.setupScene( this.worldObjects, controllers );
            const fadeTime = 2000;
            //add a delay

            let preloader = this.scene.getObjectByName( "preloader" );
            preloader.anime = this.createAnime( preloader, "fade" );
            setTimeout( () => {
                progressEmitter.emit( "message", { message: "" } );
                this.scene = this.scenes[ this.scenes.length - 1 ];
                console.log( this.scene );
            }, fadeTime );
        } );

    },
    start: function () {
        console.log( ThreeBSP );
        this.scenes.push( new THREE.Scene() );
        this.scene = this.scenes[ 0 ];
        this.canvas.addEventListener("click", this.initWorld );
        requestAnimationFrame( this.runScene );
        let checkFormat = /\w+(?!\/){1}(?=\.jpg|\.png|\.gif){1}/;
        const isImgLink = checkFormat.test(this.menu.title);
        if (isImgLink) {
            let texture = new THREE.TextureLoader().load(this.menu.title, (tex) => {

                const options = {
                    type: "plane",
                    name: "title",
                    material: "basic",
                    animation: this.menu.animation !== undefined ? this.menu.animation : "default",
                    color: new THREE.Color(),
                    size: [ tex.image.naturalWidth, tex.image.naturalHeight  ],
                    texture: tex
                };
                this.setupMesh( options, this.scenes.length - 1 );
                //calculate title mesh so if img is too large it will fit inside the camera view
                let title = this.scenes[ this.scenes.length - 1 ].getObjectByName( "title" );
                const camData = calculateCameraView( title.position.z, this.camera );
                title.scale.set( 1 / 2, 1 / 2, 1 );
            });
        } else {
            console.log("turn into a 3D font");
        }
    },
    runAnimations: function ( time ) {
        this.scene.children.forEach( ( obj ) => {
            if( obj.type.toLowerCase() === "mesh" ) {
                /*
                if ( obj.geometry.parameters.hasOwnProperty( "width" ) && obj.geometry.parameters.hasOwnProperty( "height" ) ) {
                    const camData = calculateCameraView( obj.position.z, this.camera );
                } else if ( obj.geometry.parameters.hasOwnProperty( "radius" ) ) {
                    const camData = calculateCameraView( obj.position.z, this.camera );
                } else {
                    console.warn( "can't calculate object parameters" );
                }
                */

                if( typeof obj.anime === "function" ) {
                    obj.anime( time, obj.name );
                } else {
                    obj.material.needsUpdate = true;
                }
            }
            else if ( obj.type.toLowerCase() === "group" ) {
                obj.children.forEach( ( m ) => {
                    if( typeof obj.anime === "function" ) {
                        m.anime( time, obj.name );
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
        this.runAnimations( elaspedTime );


        /*
        this.camera.aspect = window.innerWidth/ window.innerHeight;
        this.camera.updateProjectionMatrix();
        */
        this.renderer.render( this.scene, this.camera );
    }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;