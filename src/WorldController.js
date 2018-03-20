import * as THREE from "three";
import ThreeBSP from "./csg/threeCSG.js";
let OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
import anime from "animejs";
var MTLLoader = require('three-mtl-loader');

// JSON
import defaultOptions from "./json/defaults.json"

//UTILS
import colorInterpreter from "./utils/colorInterpreter.js";
import calculateCameraView from "./utils/cameraView.js";

import createAnime from "./createAnime.js";
import createGeometry from "./createGeometry.js";
import createMaterial from "./createMaterial.js";


import initializeAudio from "./audioInitializer.js";
import progressEmitter from "./events/progressEmitter";

let isMesh = false;

function WorldController (options) {
    
    //constants 
    this.SLOWDOWN_POWER = 3;
    
    this.options = options;
    this.preloader = options.preloader;
    this.sounds = options.sounds;
    this.worldObjects = options.worldObjects;
    this.mainFont = options.font;

    //packages for storing
    this.audioControllers = [];
    this.cameras = [];
    this.fonts = [];
    this.scenes = [];
    this.hashed = [];
    this.counter = 0;
    //

    this.canvas = this.getCanvas();
    this.camera = this.setupCamera( options );
    this.clock = new THREE.Clock();
    this.fog = this.setupFog( options );
    this.scene = new THREE.Scene();
    this.renderer = this.setupRenderer( options );
    this.divWrapper = this.checkWrapper( options );

    this.initWorld = this.initWorld.bind( this );
    this.runScene = this.runScene.bind( this );
    this.onWindowResize = this.onWindowResize.bind( this );
    this.doMouseMove = this.doMouseMove.bind( this );
}

const framework = {
    checkWrapper: function ( options = {} ) {
        return document.getElementById( options.wrapperID !== undefined ? options.wrapperID : "world" );
    },
    cameraMovement: function ( e ) {
        //track player movement for camera tracking
      let marginLeft = this.divWrapper.style.left !== "" ? this.divWrapper.style.left : ( this.divWrapper.style.marginTop ? this.divWrapper.style.marginTop : 0 ), 
            marginTop = this.divWrapper.style.top !== "" ? this.divWrapper.style.top : ( this.divWrapper.style.marginTop ? this.divWrapper.style.marginTop : 0 );
      
      const regSearch = /[px|em]{1}/;
      marginLeft = typeof marginLeft === "string" ? parseInt(marginLeft.replace(regSearch, ""), 10) : marginLeft;
      marginTop = typeof marginTop === "string" ?  parseInt(marginTop.replace(regSearch, ""), 10) : marginTop;

      const speedY = ((e.y - marginTop) - (this.canvas.clientHeight/2))/(this.canvas.clientHeight/2), 
            speedX = ((e.x - marginLeft) - (this.canvas.clientWidth/2))/(this.canvas.clientWidth/2);
      
      //inverse rotation
      this.camera.rotation.y = speedX * -1;
      this.camera.rotation.x = speedY * -1;
    },
    createAnime,
    createGeometry,
    createPreloader: function ( options ) {
        
        return new Promise( ( res, rej ) => {
                
                options.name = "preloader";
                this.setupMesh( options, this.scenes.length - 1 );
                res( options.hasOwnProperty( "message" ) && options.message !== undefined ? options.message: defaultOptions.preloader.message );
        } );
    },
    createFont: function ( fontJSON, title = "hi" ) {
        new THREE.FontLoader().load( fontJSON, ( font ) => {
            this.fonts[0] = font;
            const options = {
                animation: "zoom_normal",
                color: new THREE.Color(),
                font,
                title: title,
                type: "font",
                name: "title",
                material: "basic",
                size: 1
                
            };
            
            this.setupMesh( options, this.scenes.length - 1 );
        } );
    },
    createMaterial,
    decideTimelineOrder( animation, mesh, options ) {
        
        //takes the mesh and adds a animation timeline to the root object
        if ( animation instanceof Array && animation.length > 0 ) {
            for ( var i = 0; i <= animation.length - 1; i++ ) {
                console.log( animation[i] );
                mesh.animeTimeline.add( animation[i] );
                mesh.animeTimeline.children[i].play();
            }
            
        } else if ( animation instanceof Function ) {
            //mesh.animationManager.push( animation );
        } else {
                mesh.animeTimeline.add( animation );
        }
        
        return mesh;
    },
    getCanvas: function ( id = "world" ) {
        //if canvas doesn't exist we will create one//
        const canvas = document.querySelector( id+" canvas" );
        if (canvas === null || canvas === undefined) {
            let newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("id", id);
            document.body.appendChild(newCanvas);
            return newCanvas;
        } else {
            return canvas;
        }
    },
    fitOnScreen: function ( mesh, w, h, n = 2 ) {
        const data = calculateCameraView( mesh.position.z, this.camera );

        if ( mesh.geometry.parameters.hasOwnProperty( "width" ) && mesh.geometry.parameters.hasOwnProperty( "height" ) ) {
            const width = w ||  mesh.geometry.parameters.width;
            const height = h || mesh.geometry.parameters.height;

            if( width > data.width || height > data.height ) {
                mesh.scale.set( 1 / n, 1 / n, 1 );
                w = width / n;
                h = height / n;
                n++;
                return this.fitOnScreen( mesh, w, h, n );
            }

        } else {
            console.warn( "this object doesn't have width or height properties. check if using correct image file type or image properties" );
        }

        return;
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
            camera.name = "cam_" + this.cameras.length.toString();
            this.cameras.push(camera);
        } else {
            camera.name = "main";
            this.cameras.push(camera);
        }

        return camera;
    },
    handleMultiGeometries: function ( g, m, isLine ) {
        let mesh;
        if ( isLine ) {
            mesh = new THREE.Line( g, m );
        } else {
            mesh = new THREE.Mesh( g, m );
        }
        return mesh;
    },
    optionParser: function ( str, options = {}, type ) {
        //parsers option string into viable data type for running code
        const animationOrder = [ "animationType", "animationDuration", "animationEasing", "animationDelay", "loop", "animationDirection", "animationElasticity", "asymmetry" ];
        
        switch( type ) {
            case "animation":
                str.slice().split( " " ).forEach( ( val, i, arr ) => {
                        let word = val.trim();
                        
                            if( val.search( /^\d{1}/ ) ) {
                                if( /(ease){1}/.test( word ) ) {

                                    options[ animationOrder[i] ] = word.slice().split("-").reduce( ( acc, curVal, n ) => n === 0 ? acc + curVal : acc + curVal.replace(/^(\w)/, ( match, p1 ) => p1.toUpperCase() ), "");

                                } else if ( word === "true" ) {
                                    options[ animationOrder[i] ] = true
                                } else if ( word === "asymmetry" ) {
                                    //allows for some to be grouped together and some to run on their own
                                    options [ "animationAsymmetry" ] = true;
                                } else {
                                    options[ animationOrder[i] ] = word;
                                }

                            } else {
                                if( /s$/.test( word ) ) {
                                    options[ animationOrder[i] ] = parseInt( word.match(/[0-9]*/)[0], 10 ) * 1000;
                                } else {
                                    options[ animationOrder[i] ] = parseInt( word.match(/[0-9]*/)[0], 10 );
                                } 

                            }
                        
                
                    } );
                return options;
        }
    },
    setupAnimationForMesh: function ( mesh, options ) {
        //set up animation for this mesh
                let animationOptions = {
                    animationType: options.animationType,
                    animationDelay: options.animationDelay,
                    animationDirection: options.animationDirection,
                    animationDuration: options.animationDuration,
                    animationEasing: options.animationEasing,
                    animationElasticity: options.animationElasticity,
                    animationKeyframes: options.animationKeyframes,
                    animationAsymmetry: options.animationAsymmetry,
                    animationOffset: options.animationOffset,
                    animationGrid: options.animationGrid,
                    positionRelativeTo: options.positionRelativeTo,
                    loop: true,
                };
                //START TIMELINE FOR ANIMATION and ANIMATION MANAGER FOR VERTICE ANIMATIONS
        
                //for testing purposes we keep the whole timeline of the mesh on a loop so we can see all the animations repeat in sequence
                mesh.animeTimeline = anime.timeline( { 
                    autoplay: true, 
                    loop: true } );
        
        
                if ( options.hasOwnProperty( "animation" ) && options.animation.length > 0 && options.animation !== undefined && typeof options.animation === "string" ) {

                    if ( /\,/.test( options.animation ) ) {
             
                        const seperateAnimations = options.animation.slice().split(",");
                        for ( let x = 0 ; x <= seperateAnimations.length - 1; x++ ) {
                        
                            let opts = this.optionParser( seperateAnimations[ x ].trim() , animationOptions, "animation" );
                            if ( opts !== undefined ) {
                               mesh = this.decideTimelineOrder( this.createAnime( mesh, opts ), mesh, opts );
                            }
                        }
                    } else {
                        let opts = this.optionParser( options.animation , animationOptions, "animation" );
                        if ( opts !== undefined ) {
                               mesh = this.decideTimelineOrder( this.createAnime( mesh, opts ), mesh, opts );
                        }
                    }
                    
                } else {
                    
                    mesh = this.decideTimelineOrder( this.createAnime( mesh, animationOptions ), mesh, animationOptions );
                }
                
                mesh.animeTimeline.play();
                return mesh;
    },
    setupMesh: function ( options, sI ) {
        let m, mesh;
        //@params sI - the index of the scene
        /*
        @params m - stands for material 
        const isTypeLoader = options.type.search(/[\.obj]{1}/);
        const isMaterialURL = options.material.search(/(\.mtl){1}/);
        */
        
                m = this.createMaterial( options );
                if ( options.count !== undefined && options.count > 1 ) {
                let group = new THREE.Group();
                for ( let i = 0; i <= options.count - 1; i++ ) {
                    let g = this.createGeometry( options );
                    if ( g.type === "Mesh" || g.type === "Group" ) {
                        mesh = g;
                    } else {
                        m = this.createMaterial(options);
                        if ( g instanceof Array && g.length > 0 ) {

                            mesh = new THREE.Group();
                            for ( let x = 0; x <= g.length - 1; x++ ) {

                                mesh.add( this.handleMultiGeometries( g[x], m, options.material === "line" ? true : false ) );
                            }
                        } else {
                            mesh = new THREE.Mesh( g, m );
                        }
                    }
                    //create a grid to place each object correctly so no objects touch or collide 
                    mesh.position.set( Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1 ) ),
                        Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1 ) ),
                        Math.random() * ( options.count * 10 ) + ( options.count * 10 /2 * ( 0 - 1) ) );
                    
                    if ( options.hasOwnProperty( "shadow" ) && options.shadow ) {
                        mesh.receiveShadow = true;
                        mesh.castShadow = true;
                    }
                    group.add( mesh );
                }
                group.name = options.name !== undefined ? options.name : "bundle";
                this.scenes[sI].add( this.setupAnimationForMesh( group, options ) );
            } else {
                let g = this.createGeometry( options );
                if( g.type === "Mesh" || g.type === "Group" ) {
                    mesh = g;
                } else {
                    mesh = new THREE.Mesh( g, m );
                }
                if ( options.hasOwnProperty( "shadow" ) && options.shadow ) {
                    mesh.receiveShadow = true;
                    mesh.castShadow = true;
                }
                mesh.name = options.name !== undefined ? options.name : "";
                
                if ( options.animation !== undefined || options.animationType !== undefined ) {
                    
                    this.scenes[sI].add( this.setupAnimationForMesh( mesh, options ) );
                } else {
                    
                    this.scenes[sI].add( mesh );
                }
                
            }

                

            return;
    },
    setupScene: function( options = {}, audioControllers = {} ) {
        //wraps into a promise for preloader to wait on data to be completed
        return new Promise ( ( res, rej ) => { 
            this.scenes.push( new THREE.Scene() );
            this.scenes[ this.scenes.length - 1 ].name = this.scenes.length === 1 ? "menu" : "main";
            this.scenes[ this.scenes.length - 1 ].fog = this.fog;
            let light = new THREE.DirectionalLight( 0xffffff, 10 );
            //light.position.set( 0, 10000, 0 );
            if ( this.options.hasOwnProperty( "enableShadows" ) && this.options.enableShadows ) {
                light.castShadow = true;
                //debug shadow camera
                const shadowCamera = new THREE.CameraHelper( light.shadow.camera );
                this.scenes[ this.scenes.length -1 ].add( shadowCamera );
            }
            this.scenes[ this.scenes.length - 1 ].add( light );
            this.scenes[ this.scenes.length - 1 ].add( new THREE.PointLight( 0x00ff00, 1, 100 ) );
            if (options instanceof Array) {
                options.forEach( ( o ) => {
                    this.setupMesh( o, this.scenes.length - 1 );
                });
                //sends an animation type for scene transition
                res( defaultOptions.sceneTransition );
            } else if ( Object.keys(options).length > 0 && options.constructor === Object ) {
                this.setupMesh( options, this.scenes.length - 1 );
                res( defaultOptions.sceneTransition );
            } else {
                return;
            }
        } );
        
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
        //sets ups the scenes fog and if there are no defined properties it will use defaults
        let fog;
        const opt = options.fog !== undefined ? options.fog : {};
        const camOpt = options.camera !== undefined ? options.camera : {};
        const color = opt.color !== undefined ? colorInterpreter( opt.color )  :  new THREE.Color();
        const density = opt.density !== undefined ? opt.density : .0010;
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
        let title;
        const delay = 1000;
        
        if ( this.options.hasOwnProperty("menu") && this.options.menu !== undefined ) {
            //menu options start
            this.canvas.removeEventListener("click", this.initWorld, false);
            title = this.scenes[ this.scenes.length - 1 ].getObjectByName( "title" );
            if ( title !== undefined ) {
                const camData = calculateCameraView( title.position.z, this.camera );
                if ( title.hasOwnProperty("geometry") && title.geometry.parameters !== undefined && title.geometry.parameters.height !== undefined ) {
                    title.scale.set( 1 * ( camData.width / title.geometry.parameters.width ), 1 * ( camData.width / title.geometry.parameters.height ), 1 );
                }
                title.anime = this.createAnime( title, this.options.menu );
            }
        }
       
        const preloaderPromise = this.createPreloader( this.options.preloader );
        
        if ( this.options.hasOwnProperty( "sounds") && this.options.sounds !== undefined ) {
            
            const audioPromise = initializeAudio( this.sounds );
    
            preloaderPromise.then( message => {
                progressEmitter.emit( "worldmessage", { message } );
                audioPromise.then( controllers => {
                        this.audioControllers = controllers;
                        const scenePromise = this.setupScene( this.worldObjects, controllers );
                        scenePromise.then( animationType => { 
                            let preloader = this.scene.getObjectByName( "preloader" );
                            //clears the timeline for a new batch of animations
                            preloader.animeTimeline = anime.timeline( {} );
                            preloader.animeTimeline.add( this.createAnime( preloader, { animationType } ) );
                            window.setTimeout( () => {
                                progressEmitter.emit( "worldmessage", { message: "" } );
                                this.scene = this.scenes[ this.scenes.length - 1 ];
                            }, delay );
                        } )
                    } )
                } )
    
        } else {
                preloaderPromise.then( message => {
                    progressEmitter.emit( "worldmessage", { message } );
                    const scenePromise = this.setupScene( this.worldObjects );
                    
                    scenePromise.then( animationType => {
                        let preloader = this.scene.getObjectByName( "preloader" );
                        window.setTimeout( () => {
                           //clears the timeline for a new batch of animations
                            preloader.animeTimeline = anime.timeline( {} );
                            preloader.animeTimeline.add( this.createAnime( preloader, { animationType } ) );
                            progressEmitter.emit( "worldmessage", { message: "" } );
                            this.scene = this.scenes[ this.scenes.length - 1 ];
                            console.log( this.scene );
                        }, delay );
                    } )
                } )            
            
        }

    },
    start: function () {
        
        this.setupScene( {} );
        this.scene = this.scenes[ 0 ];
        //start event listeners
        this.canvas.addEventListener( "mousemove", this.doMouseMove,  false );
        window.addEventListener( "resize" , ( e ) => {
            this.onWindowResize();
        }, false );
        //run animation cycle for all scenes
        window.requestAnimationFrame( this.runScene );
        if ( this.options.hasOwnProperty( "menu" ) && this.options.menu !== undefined ) {
            this.canvas.addEventListener("click", this.initWorld );
            const menu = this.options.menu;
            let checkFormat = /\w+(?!\/){1}(?=\.jpg|\.png|\.gif){1}/;
            const isImgLink = checkFormat.test( menu.title );
            
            if (isImgLink) {
                new THREE.TextureLoader().load( menu.title, (tex) => {
                    
                    const options = {
                        type: "plane",
                        name: "title",
                        material: "basic",
                        animationType: "zoom_normal",
                        animationDuration: 5000,
                        animationDelay: 1000,
                        animationDirection: "alternate",
                        transparent: true,
                        loop: true,
                        color: new THREE.Color(),
                        size: [ tex.image.naturalWidth, tex.image.naturalHeight, 0 ],
                        texture: tex
                    };
                    
                    this.setupMesh( options, this.scenes.length - 1 );
                    //calculate title mesh so if img is too large it will fit inside the camera viewW
                    let title = this.scenes[ this.scenes.length - 1 ].getObjectByName( "title" );
                    this.fitOnScreen( title );
                });
            } else {
                console.log("turn into a 3D font");
                //will create a font in 3D space based on font family
                this.createFont( this.mainFont, menu.title );
                
            }
        } else {
            this.initWorld();
        }
       
    },
    doMouseMove: function ( e ) {
        this.cameraMovement( e );
    },
    onWindowResize: function () {

        this.camera.aspect = ( this.divWrapper.clientWidth !== undefined ? this.divWrapper.clientWidth : window.innerWidth) / (this.divWrapper.innerHeight !== undefined ? this.divWrapper.innerHeight : window.innerHeight );
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

    },
    runAnimations: function ( time ) {
        this.scene.children.forEach( obj => {
            if ( obj.geometry !== undefined ) {
                obj.geometry.verticesNeedUpdate = true;
                if ( obj.geometry.type === "PlaneGeometry" ) {
                    let exploreRow = true;
                    const slowdown = 1 / Math.pow( time, this.SLOWDOWN_POWER );
                    
                    if ( obj.animationManager === undefined ) {
                        obj.animationManager = {
                            speed: 10,
                            
                        };
                    }
                    
                    if ( exploreRow ) {
                        const index = 0 //pick a row
                        const isRow = true,
                              isUniform = true;
                        const rowOrCol =  true ? obj.geometry.parameters.widthSegments : obj.geometry.parameters.heightSements;
                        for ( let start = 0; start <= rowOrCol; start++ ) {
                            if( isRow ) {
                                //effect only a specific row
                                const newIndex = start + ( ( rowOrCol + 1 ) * index )
                                
                                if ( obj.animationManager.originalPosition === undefined ) {
                                    obj.animationManager.originalPosition = obj.position.clone();
                                }
                                obj.geometry.vertices[ newIndex ].z = ( Math.sin( time * ( isUniform ? 1 : start ) ) * 20 ) + obj.animationManager.originalPosition.z;
                            } else {
                                console.log( ( rowOrCol * start ) + index + start ) 
                            }
                            
                        }
                    }
                    
                    
                }
            }
        } );
    },
    runScene: function () {
        requestAnimationFrame( this.runScene );
        var time = this.clock.getDelta();
        var elaspedTime = this.clock.getElapsedTime();
        this.runAnimations( elaspedTime );

        this.renderer.render( this.scene, this.camera );
    }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;