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
import hashID from "./utils/hashID.js";
import rotatePoint from "./utils/rotatePoint.js";
import calculateFoldVector from "./utils/calculatefoldVector.js";

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
    this.sceneLoaded = new Promise( () => {} );
    //packages for storing
    this.audioControllers = [];
    this.animationManager = {
        all : []
    };
    this.objManager = {
        all : []
    };
    this.cameras = [];
    this.fonts = [];
    this.scenes = [];
    this.hashed = [];
    this.counter = 0;
    //sets
    
    this.isWorldLoaded = false;

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
    computeObjectRadius : function ( geometry ) {
        //gets the radius from the bounding sphere to reflect the objects collision area
        const center = new THREE.Vector3( 0, 0, 0 );
        geometry.computeBoundingSphere();
        
            if ( geometry.boundingSphere !== undefined ) {
                return geometry.boundingSphere;
            } else if ( geometry.parameters.radius !== undefined ) {
                return { radius : geometry.parameters.radius, center };
            } else if ( geometry.parameters.radiusTop && geometry.parameters.radiusBottom ) {
                return { radius : Math.max( geometry.parameters.radiusTop, geometry.parameters.radiusBottom ), center };
            } else if ( geometry.parameters.width ) {
                return { radius : geometry.parameters.width / 2 , center };
            } else {
                console.warn( "can't compute radius for object" );
                
                return { radius : defaultOptions.radius, center };
            }
    },
    convertToRadians : value => ( Math.PI / 180 ) * value,
    createAnime,
    createGeometry,
    createPreloader: function ( id, options = {} ) {
        
        return new Promise( ( res, rej ) => {
                
                options.name = "preloader";
            
                this.setupMesh( options, id );
                res( options.hasOwnProperty( "message" ) && options.message !== undefined ? options.message: defaultOptions.preloader.message );
        } );
    },
    createFont: function ( id, fontJSON, title = "hi" ) {
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
            
            this.setupMesh( options, id );
        } );
    },
    createMaterial,
    createTransition : function ( id, mesh, options = {} ) {
        //takes the transition type and keeps track of any 
        let clone = this.objManager.all[ hashID( mesh.id , id ) ];
        // transition options parse over options for animation instead of adding duplicate attributes for transition
        const type = options.animationType !== undefined ? options.animationType : "default";
        switch( type ) {
                
            case "color":
                const color = options.color instanceof THREE.Color ? options.color : this.typeChecker( options, "color", defaultOptions ); 
                
                clone.transitions.color = anime( this.createAnime( mesh, Object.assign( {}, options, { animationKeyframes : { color: [ { r: color.r, g: color.g, b: color.b } ] } } ) ) );
                
                break;
                
            case "position":
                
                const position = this.typeChecker( options, "position", defaultOptions );
                console.log( clone, " in the position transition" );
                clone.transitions.position = anime( this.createAnime( mesh, Object.assign( {}, options, { animationKeyframes : { position : [ { x : position[ 0 ] , y: position[ 1 ], z: position[ 2 ] } ] } } ) ) );
                
                break;
                
            case "scale":
                
                const scale = this.typeChecker( options, "scale", defaultOptions );
                console.log( clone, " in the position transition" );
                clone.transitions.scale = anime( this.createAnime( mesh, Object.assign( {}, options, { animationKeyframes : { scale : [ { scaleX : scale[ 0 ] , scaleY: scale[ 1 ], scaleZ: scale[ 2 ] } ] } } ) ) );
                
                console.log( clone.transitions, "chosen" );
                
                break;
            default:
                
                console.log( "going to default" );
                return;
        }
    },
    decideTimelineOrder : function (id, animation, mesh, options = {} ) {
        
        console.log( animation, "animation inside deciscion" );
        try {
            if ( mesh.id !== undefined ) {
                console.log( id , mesh, "id and mesh id" );
                const hash = hashID( mesh.id,  id );
                console.log( hash );
                let obj = this.objManager.all[ hash ];
                console.log( obj, "this is the obj manager clone" );
                //takes the mesh and adds a animation timeline to the root object
                if ( animation instanceof Array ) {
                    for ( var i = 0; i <= animation.length - 1; i++ ) {
                        
                        obj.animeTimeline.add( animation[i] );
                    }

                } else if ( animation instanceof Function ) {

                    this.animationManager.all[ hashID( mesh.id, id ) ] = animation;
                    
                } else {
        
                       this.objManager.all[ hashID( mesh.id, id ) ].animeTimeline.add( animation );
                    console.log( obj, "after attachment" );
                     
                }
                
                if ( obj.animeTimeline.children !== undefined ) {
                    console.log( "has children" );
                    obj.animeTimeline.children[ 0 ].play();
                }
                
            } else throw new Error( "you need a mesh id to create animation timelines " );
        } catch( err ) {
            
            console.warn( err.message );
        }
        
    },
    getCanvas: function ( id = "world" ) {
        //if canvas doesn't exist we will create one//
        const canvas = document.querySelector( id );
        if (canvas === null || canvas === undefined) {
            let newCanvas = document.createElement("canvas");
            newCanvas.setAttribute("id", id);
            document.body.appendChild(newCanvas);
            return newCanvas;
        } else {
            return canvas;
        }
    },
    gridMeshPosition: function ( mesh, options, index ) {
        //MODIFIERS
        
        const marginModifier = 0;
        
        //CONSTANTS
        const type = options.layout !== undefined && typeof options.layout === "string" ? options.layout : defaultOptions.layoutType;
         
        
        //VARIABLES
            const layoutLimit = this.typeChecker( options, "layoutLimit", defaultOptions ),
                margin = this.typeChecker( options, "margin", defaultOptions ),
                padding = this.typeChecker( options, "padding", defaultOptions );
    
            if ( mesh.type === "Mesh" ) {

                    let angle, newX = 0, newY = 0, newZ = 0, xIndex;
                    
                    const { center, radius } = this.computeObjectRadius( mesh.geometry );
                
                    switch( type ) {

                            case "basic":
                                    xIndex = index % layoutLimit[0];
                                    //calculate grid for multiple instances of an object
                                    //griding is based mainly on bouding sphere radius

                                    newX = xIndex === 0 ? 0 : ( ( xIndex + 1 ) % 2 === 0 ? -1 : 1 ) * ( Math.floor( ( xIndex +  1 ) / 2 ) * radius + ( margin[0] * Math.floor( ( xIndex +  1 ) / 2 ) ) );
                                          
                                    newY = ( Math.floor( index % ( layoutLimit[0] * layoutLimit[1] ) / layoutLimit[0] ) * radius + ( margin[1] * Math.floor( ( xIndex +  1 ) / 2 ) ) );
                            
                                    newZ = ( -1 * ( Math.floor( index / ( layoutLimit[0] * layoutLimit[1] ) ) * radius ) + ( margin[2] * Math.floor( ( xIndex +  1 ) / 2 ) ) );
                                        
                                    break;
                            
                            case "radial":
                            
                                    newX = radius * Math.floor( index / layoutLimit[0] ) * Math.cos( Math.PI * 2 * ( ( index % layoutLimit[0] ) / layoutLimit[0] ) );
                                    newZ = radius * Math.floor( index / layoutLimit[0] ) * Math.sin( Math.PI * 2 * ( ( index % layoutLimit[0] ) / layoutLimit[0] ) );
                            
                                    break;
                            
                            case "curve":
                            
                                    xIndex = index % layoutLimit[0];
                            
                                    newX = xIndex === 0 ? 0 : ( ( xIndex + 1 ) % 2 === 0 ? -1 : 1 ) * ( Math.floor( ( xIndex +  1 ) / 2 ) * radius + ( margin[0] * Math.floor( ( xIndex +  1 ) / 2 ) ) );
                            
                                    angle = ( Math.PI / 2 ) * ( xIndex / layoutLimit[0] );
                            
                                    newZ = -1 * layoutLimit[2] * Math.sin( angle ) + ( margin[2] * ( xIndex / layoutLimit[0] ) ) + ( Math.floor( index / layoutLimit[0] ) );
                            
                                    newY = Math.floor( index / layoutLimit[0] ) * radius;
                                    
                                    mesh.rotation.y += angle;
                                    break;
                            default:
                                return mesh;
                            
                            
                    }
                
                    mesh.position.set( newX , newY, newZ );
                   
            }
        
        
        return mesh;
    },
    exploreGroupTree : function ( endIndex, arr, scene, i = 0, obj ) {
        //takes the arr of children levels to dig through
        if( i <= endIndex ) {
            if ( i === 0 ) {
                obj = scene.getObjectByName( arr[ 0 ] );
                i++;
                return this.exploreGroupTree( endIndex, arr, scene, i, obj );
            } else {
                let newObj = obj.getObjectByName( arr[ i ] );
                i++;
                return this.exploreGroupTree( endIndex, arr, scene, i, newObj );
            }
                
        } else { 
                
            return obj;
        }
            
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
    foldGeometry: function ( g, modifier, calc, options, i = 0 ) { 
        
        const radius = calc.radius,
              center = calc.center;
        
        const fold = this.typeChecker( modifier[i], "modAngles", { modAngles: [ 0, 0, 0 ] } ),
              xAngle = fold[ 0 ] * ( Math.PI / 180 ),
              yAngle = fold[ 1 ] * ( Math.PI / 180 ),
              zAngle = fold[ 2 ] * ( Math.PI / 180 ),
              topScaleLimit = 16,
              foldPoint = modifier[i].modAt !== undefined && typeof modifier[i].modAt === "string" ? calculateFoldVector( modifier[i].modAt, radius, center ) : "center",
              type = modifier[i].modType !== undefined && typeof modifier[i].modType === "string" ? modifier[i].modType : "default";
             // foldRadius = this.typeChecker( options, "foldRadius", { foldRadius : [ radius / 4, radius / 4, radius / 4 ] } );;
        
        //takes the z angle for rotation of z and y points. Computed point is normalized
        
        for ( let n = 0; n <= g.vertices.length - 1; n++ ) {
                
              const heightRatio = g.vertices[n].y / radius,
                    widthRatio = g.vertices[n].x / radius;
            
                switch( type ) {
                        
                    case "angular" : 
                        
                        if ( g.vertices[n].y > foldPoint.y ) {
                            const rotatedPointZY = rotatePoint( g.vertices[n].z, g.vertices[n].y, xAngle );
                            g.vertices[n].z = rotatedPointZY.x;
                            g.vertices[n].y = rotatedPointZY.y;
                        }
                        
                        break;
                    case "inverse" :
                        
                        g.vertices[n].y *= Math.cos( yAngle * heightRatio );
                        break;
                    default:
                        
                }
            
                /*
                g.vertices[n].z *= foldRadius[1] * Math.sin( yAngle * ( g.vertices[n].x < 0 ? -1 * widthRatio : widthRatio ) );
                g.vertices[n].x /= foldRadius[1] < 1 ? 1 : Math.pow( 2, Math.floor( foldRadius[1] / 100 ) );
        
                */
                //scales top
                /*
                if ( g.vertices[n].y > center.y ) {
                   g.vertices[n].y *= Math.pow( g.vertices[n].y / radius * 2, 3 ) > topScaleLimit ? topScaleLimit : Math.pow( g.vertices[n].y / radius * 2, 3 ); 
                }
                */
        }
        
        if ( i <= modifier.length -1 ) {
            i++;
            return this.foldGeometry( g, modifier, calc, options, i );
        } else return g;
        
    },
    fitOnScreen: function ( mesh, w, h, n = 2 ) {
        //@params w for width
        //@params h for height
        const data = calculateCameraView( mesh.positon.z, this.camera );

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
    mapGroupTree : function ( options, group ) {
            
        if ( options.children !== undefined && options.children instanceof Array ) {
                
            if ( group !== undefined ) { 
                let grp = new THREE.Group();
                grp.name = options.name;
                group.add( grp );
            } else {
                group = new THREE.Group();
                group.name = options.name;            
            }
                
            options.children.forEach( child => {
                // run a recursive back track until we reach the last child with children attribute
                return this.mapGroupTree( child, group.children.length > 0 ? group.getObjectByName( options.name ) : group );
            } );
                
            return group;
                
        } 
    },
    moldGeometry: function ( g, options = {}, state = { calc: { } , calculated: false, folded : false, squeezed : false } ) {
        console.log( options, "mold geometry has started" );
        // the order of geometry manipulation is extremely important, if you move out of sequence it could mess up the resulting shape's appearance
        //@params g for geometry
        //@params opts for options
        if ( !state.calculated ) {
            
            state.calculated = true;
            const radiusComputed = this.computeObjectRadius( g );
            if ( /^(Box|Plane|Cylinder){1}/.test( g.type ) ) {

                state.calc.radius = g.parameters.height / 2;

            } else if ( /^(Circle|Sphere){1}/.test( g.type ) ) { 

                state.calc.radius = g.parameters.radius;
            } else {

                state.calc.radius = radiusComputed.radius;
            }

            state.calc.center = radiusComputed.center;
        }
        
        //filter them for each filter type and then run recursion for each array within their respective functions
        const foldMod = options.modifiers.filter( mod => mod.mod === "fold" ),
              squeezeMod = options.modifiers.filter( mod => mod.mod === "squeeze" );
        
        if ( squeezeMod.length > 0 && !state.squeezed ) {
            state.squeezed = true;
            console.log( foldMod, squeezeMod, "before squeezeGeometry runs" );
            return this.moldGeometry( this.squeezeGeometry( g, squeezeMod, state.calc, options ), options, Object.assign( {}, state, { squeezed : true } ) );
        }
        
        if ( foldMod.length > 0 && !state.folded ) {
            state.folded = true;
            return this.moldGeometry( this.foldGeometry( g, foldMod, state.calc, options ), options, Object.assign( {}, state, { folded: true } ) );
        }
    
        return g;
    },
    setupCamera: function ( options = {} ) {
        //camera setup * need to add cinematic option later
        const opt = options.camera || options;
        let camera;
        const width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        const aspectRatio = width / height,
            fov = opt.fov !== undefined ? opt.fov : defaultOptions.cameraFov,
            far = opt.far !== undefined ? opt.far : defaultOptions.cameraFar,
            type = opt.type !== undefined ? opt.type : defaultOptions.cameraType,
            near = opt.near !== undefined ? opt.near : defaultOptions.cameraNear; //cant put floats in defaultOptions so we will leave them here.

        console.log( options, type, "camera type" );
        switch ( type.toLowerCase() ) {
            case "perspective":
                camera = new THREE.PerspectiveCamera( fov, aspectRatio, near, far );
                break;
            case "orthographic":
                camera = new THREE.OrthographicCamera( width / -1.5, width / 1.5, height / 1.5, height / -1.5, near, far);
                break;
            default:
                console.warn("this camera type is not acceptable");

        }
        
        camera.position.set( 0, 0, 500 );

        if (this.cameras.length > 0) {
            camera.name = "cam_" + this.cameras.length.toString();
            this.cameras.push(camera);
        } else {
            camera.name = "main";
            this.cameras.push(camera);
        }

        return camera;
    },
    squeezeGeometry: function ( g, modifier, calc, options, i = 0 ) {
        // treeats the geometry almost like its super elastic
        
        console.log( options, "inside squeeze Geometry" );
        const radius = calc.radius,
              center = calc.center;
        
        const squeeze = modifier[i].modAngles,
              type = modifier[i].modType !== undefined && typeof modifier[i].modType === "string" ? modifier[i].modType : "default" ;
        
        for ( let n = 0; n <= g.vertices.length - 1 ; n++ ) {
            
            const angle = 10 * Math.PI / 180,
                  heightRatio = g.vertices[n].y / radius,
                  widthRatio = g.vertices[n].x / radius;
            
            switch( type ) {
                    
                case "indent" :
                    
                    g.vertices[n].z *= Math.cos( ( angle ) * heightRatio );
                    break;
                default:
                    const newRadiusZ = ( ( radius / 2 ) * Math.sin( angle ) );
                    g.vertices[n].z *= newRadiusZ * Math.cos( Math.PI / 2 * heightRatio );
                    if( g.vertices[n].y ) {
                        g.vertices[n].y *= Math.cos( ( angle ) * heightRatio );
                    }
                    
            }
        }
        
        if ( i < modifier.length - 1 ) {
            
            i++;
            return this.squeezeGeometry( g, modifier, calc, options, i );
        } else return g;
    },
    optionParser: function ( target, options, type = "default" ) {
        //parsers option string into viable data type for running code
        const animationOrder = [ "animationType", "animationDuration", "animationEasing", "animationDelay", "loop", "animationDirection", "animationElasticity", "asymmetry" ];
        
        try {
            if ( typeof type === "string" ) { 
                
                switch( type ) {

                    case "animation":
                        target.slice().split( " " ).forEach( ( val, i, arr ) => {
                                let word = val.trim();

                                    if( word.search( /^\d{1}/ ) ) {
                                        if( /(ease){1}/.test( word ) ) {

                                            options = Object.assign( {}, options, { [ animationOrder[i] ] : word.slice().split("-").reduce( ( acc, curVal, n ) => n === 0 ? acc + curVal : acc + curVal.replace(/^(\w)/, ( match, p1 ) => p1.toUpperCase() ), "") } );

                                        } else if ( word === "true" ) {
                                            options = Object.assign( {}, options, { [ animationOrder[i] ] : true } );
                                        } else if ( word === "asymmetry" ) {
                                            //allows for some to be grouped together and some to run on their own
                                            options = Object.assign( {}, options, { [ "animationAsymmetry" ] : true } );
                                        } else {
                                            options = Object.assign( {}, options, { [ animationOrder[i] ] : word } );
                                        }

                                    } else {
                                        if( /s$/.test( word ) ) {
                                            options = Object.assign( {}, options, { [ animationOrder[i] ] : parseInt( word.match(/[0-9]*/)[0], 10 ) * 1000 } );
                                        } else {
                                            options = Object.assign( {}, options, { [ animationOrder[i] ] : parseInt( word.match(/[0-9]*/)[0], 10 ) } );
                                        } 

                                    }


                            } );
                        return options;

                    case "color" : 

                        return colorInterpreter( target );
                        
                    case "typeHandler" :
                        break;

                    default:
                        
                        return target.slice().split( /\s+/ ).map( each => parseInt( each, 10 ) ).filter( each => !Number.isNaN( each ) );

                }
            } else throw new TypeError( "you need to use a string" );
        } catch ( err ) {
            
            console.warn( err.message );
            progressEmitter.emit( "world-message", err );
        }
        
    },
    packAnimations: function ( mesh, options ) {
        const { animTarget, asymmetry, began, canPack, complete, delay, duration, elasticity, finished, keyframes, loop, run, offset, positionRelativeTo } = options;

        console.log( animTarget, "in pack animations" );
        let animation = {
            duration,
            elasticity,
            loop,
            offset,
        } ;
        
        let modifier;

        //modifies the value being passed originally for the keyframe
        //returns a function to pass the value through

        let modifierOptions = {
            positionRelativeTo

        }
        
        if ( keyframes instanceof Array ) {
            keyframes.forEach( f => {
                /* if you have multiple props that fit your target type you can use
                them within a singe keyframe */
                if ( f instanceof Array ) {
                    //made an array outside the push loop so the keyframes won't overwrite each other
                    f.forEach( each => {
                       // assign each keyframe for each property

                        if ( animation[ each.animProp ] === undefined) {
                            animation[ each.animProp ] = [];
                            modifier = this.setupModifier( mesh, each.animProp, animTarget, modifierOptions );   
                        }
                        
                        animation[ each.animProp ].push( { value: modifier( each.value ) } );
                    } );
                } else {

                    animation[ f.animProp ] = [];
                    modifier = this.setupModifier( mesh, f.animProp, animTarget, modifierOptions );  
                    animation[ f.animProp ].push( { value: modifier( f.value ) } );
                }

            } );
        } else if ( keyframes instanceof Object ) {
            modifier = this.setupModifier( mesh, keyframes.animProp, animTarget, modifierOptions );  
            animation[ keyframes.animProp ] = [ { value: modifier( keyframes.value ) } ];
        } else {
            throw new Error( "keyframes must be either objects, or an array of objects with its set properties" );
        }

        if ( mesh.type === "Group" && asymmetry ) {
            
                    let pack = [];
                    for ( var n = 0; n <= mesh.children.length -1; n++ ) {
                        let obj = mesh.children[n];

                            if ( canPack ) {
                                
                                let newAnimation;
                                if ( animTarget === "color" ) {
                                    newAnimation = Object.assign( {}, animation, { targets: mesh[ "material" ][ animTarget ], offset: n * offset } );
                                } else {
                                    newAnimation = Object.assign( {}, animation, { targets: mesh[ animTarget ], offset: n * offset } );

                                }
                                pack.push( newAnimation );
                            }


                    }
                    return pack;
        } else {
            let newAnimation;
            if ( animTarget === "color" ) {
                newAnimation = Object.assign( {}, animation, { targets: mesh[ "material" ][ animTarget ] } );
            } else {
                newAnimation = Object.assign( {}, animation, { targets: mesh[ animTarget ] } );
                
            }
            return newAnimation;
        }
    },
    setupAnimationForMesh: function ( id, mesh, options ) {
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
        
                console.log( "set up for animation has begun" );
                if ( options.hasOwnProperty( "animation" ) && options.animation !== undefined && typeof options.animation === "string" ) {

                    if ( /\,/.test( options.animation ) ) {
             
                        const seperateAnimations = options.animation.slice().split(",");
                        for ( let x = 0 ; x <= seperateAnimations.length - 1; x++ ) {
                        
                            const opts = this.optionParser( seperateAnimations[ x ].trim() , animationOptions, "animation" );
                            if ( opts !== undefined ) {
                               this.decideTimelineOrder( id, this.createAnime( mesh, opts ), mesh, opts );
                            }
                        }
                    } else {
                        const opts = this.optionParser( options.animation , animationOptions, "animation" );
                        console.log( opts, "animation parsed" );
                        if ( opts !== undefined ) {
                               this.decideTimelineOrder( id, this.createAnime( mesh, opts ), mesh, opts );
                        }
                    }
                    
                } else {
                    
                    this.decideTimelineOrder( id, this.createAnime( mesh, animationOptions ), mesh, animationOptions );
                }
                
                return mesh;
    },
    setupMesh: function ( options, sI, group = new THREE.Group(), i = 0 , levels = [], groupNames = new Set() ) {
        let m, mesh, geoModifiers, upgradeMesh, multiMaterials = [];
        //@params sI - the index of the scene
        /*
        @params m - stands for material 
        const isTypeLoader = options.type.search(/[\.obj]{1}/);
        const isMaterialURL = options.material.search(/(\.mtl){1}/);
        */
        
        
        
        try{
                // @param g stands for geometry
                // @param sI is the current scene index
            
                //sorts modifiers before distributing them for use
                if ( options.modifiers !== undefined && options.modifiers instanceof Array && options.modifiers.length > 0 ) {
                    
                    geoModifiers = options.modifiers.filter( mod => mod.type === "geometry" );
                    console.log( geoModifiers, "you have generated a modifier" );
                    
                }
            
                if ( options.children !== undefined && options.children instanceof Array ) {
                    let grp;
                    
                    const groupName = options.group !== undefined && !groupNames.has( options.group ) ? options.group : options.name;

                    if ( i === 0 && groupNames.size === 0 ) {
                        //replaces levels with a new array for each treed group created
                       levels = [];
                       grp = this.mapGroupTree( options );
                       this.scenes[sI].add( grp );
                        
                    }
                    
                    if ( !groupNames.has( groupName ) ) {
                        levels[i] = groupName;
                        groupNames.add( groupName );
                    }
                    
                        i++;
                        options.children.forEach( ( child, x ) => {

                            //keeps an array where each index reflects what level an object is within an object
                            //if index is 0, it is the root objects. The higher it gets, the deeper the tree goes


                            this.setupMesh( Object.assign( {}, options, { children : undefined, position : [], rotation: [], scale : [], count : 0 }, child, { group: groupName } ) , sI, group, i, levels , groupNames );

                        } );

                        //recalls the group so that all the newly added meshes can undergo the parent transforms
                        let newGrp = this.scenes[sI].getObjectByName( groupName );
                        this.setObjectTransforms( newGrp, options );

                        return;
                } else {
                    let g;
                   
                    /* creates the geometry with its vertices and settings and then modifies it if 
                    */
                    const geometry = this.createGeometry( options );
                    
                    if ( geoModifiers !== undefined ) {
                        g = this.moldGeometry( geometry, Object.assign( {}, options, { modifiers: geoModifiers } ) );
                    } else g = geometry;
                    
         
                   
            
                    if ( options.texture instanceof Array ) {
                        //if you get an array of textuers back, then we can pack them here
                        console.log( options, "before setupMesh begins" );
                        for ( let f = 0; f <= g.faces.length - 1; f++ ) {
                            multiMaterials.push( this.createMaterial( Object.assign( {}, options, { texture : options.texture[ f % options.texture.length ] } ) ) );
                        }
                        
                        m = multiMaterials;

                    } else {

                        m = this.createMaterial( options );
                    }

                    mesh = options.children !== undefined && options.children instanceof Array ? group : new THREE.Mesh( g, m );

                    if ( options.hasOwnProperty( "shadow" ) && options.shadow == true ) {

                        mesh.receiveShadow = true;
                        mesh.castShadow = true;
                    }

                    //accepts a gradient that is either linear or radial
                    if ( /gradient/.test( options.color ) ) {

                        if ( mesh.geometry !== undefined && mesh.geometry.faces !== undefined ) {
                            mesh.material.needsUpdate = true;
                            const faceIndices = [ "a", "b", "c" ];
                            for ( let a = 0; a <= mesh.geometry.faces.length - 1; a++ ) {


                                mesh.material.vertexColors = THREE.VertexColors;

                                let f = mesh.geometry.faces[ a ];
                                for ( var i = 0; i <= faceIndices.length - 1; i++ ) {
                                    let vertexIndex = f[ faceIndices[ i ] ];
                                    const p = mesh.geometry.vertices[vertexIndex];
                                    console.log( vertexIndex );
                                    let color = new THREE.Color( 0xffffff );
                                    console.log( p );
                                    mesh.geometry.faces[a].vertexColors[i] = color.setRGB( a / mesh.geometry.faces.length, 1, 1 );

                                }
                            }

                        }

                    } 

                    mesh.name = options.name !== undefined ? options.name : "";

                    /*
                    if ( this.options.debug === true ) {
                        const debugVerts = new THREE.Group();
                        mesh.geometry.vertices.forEach( ( v, i ) => {


                            const material = this.createMaterial( { color : new THREE.Color( i / mesh.geometry.vertices.length, 1, 1 ) } );
                            const geo = this.createGeometry( { type: "sphere", size: 0.5, segments: 8 } );
                            let debugMesh = new THREE.Mesh( geo, material );
                            //copies the position of this vertice
                            debugMesh.position.set( v.x, v.y, v.z );
                            debugVerts.add( debugMesh );

                        } );

                        mesh.add( debugVerts );
                    }
                    */

                    if ( options.animation !== undefined || options.animationType !== undefined ) {

                        upgradeMesh = this.setupAnimationForMesh( sI, this.setObjectTransforms( mesh, options ), options );
                    } else {
                        upgradeMesh =  this.setObjectTransforms( mesh, options );

                    }

                    this.setupWorldClone( sI, upgradeMesh, options );

                    if ( options.count !== undefined && options.count > 1 && i < options.count ) {

                        if ( group.name.length === 0 ) {
                            group.name = options.name + "s"; //turns it to a pluralname 
                        }
                        
                        upgradeMesh.name = options.name + i.toString();
                        group.add( this.gridMeshPosition( upgradeMesh, options, i ) );
                        i++;
                        console.log( group );
                        this.setupMesh( options, sI, group, i, levels );

                    }
                    
                    if( options.group !== undefined && typeof options.group === "string" ) {
                        let grp;
                    
                                console.log( levels, "levels", options.group );
                               //dig through tree
                                const endIndex = levels.findIndex( ( str ) => str === options.group );
                                let prevGrp = this.exploreGroupTree( endIndex, levels, this.scenes[sI] );
                        
                                console.log( prevGrp, "previous group near ending" );
                                prevGrp.add( upgradeMesh );

                    } else {

                        if ( group.children.length > 0 ) {
                            
                            this.scenes[sI].add( group );
                        } else {
                            this.scenes[sI].add( upgradeMesh ); 
                        }
                    }
                
                }
            
                
                /*
                if ( options.hasOwnProperty( "transition" ) && options.transition !== undefined && typeof options.transition === "string" ) {
                    
                    if ( /\,/.test( options.transition ) ) {
                        
                        const seperateTransitions = options.transition.slice().split(",");
                        for ( let x = 0 ; x <= seperateTransitions.length - 1; x++ ) {
                            
                            const opts = this.optionParser( seperateTransitions[ x ].trim() , options, "animation" );
                            if ( opts !== undefined ) {
                                this.createTransition( sI, newMesh, Object.assign( {}, opts, { autoplay: true, loop: 1 } ) );
                            }
                        }
                    } else {
                        
                        const opts = this.optionParser( options.transition , options, "animation" );
                        if ( opts !== undefined ) {
                            this.createTransition( sI, newMesh, Object.assign( {}, opts, { autoplay: true, loop: 1 } ) );
                        }
                    }
                }
                
            } */

            return;
            
        } catch ( err ) {
            console.error( err.message );
        }
        
            
    },
    setObjectTransforms : function( mesh, options = {} ) {
        
            [ "position", "rotation", "scale" ].forEach( type  => {
                
                const transform = this.typeChecker( options, type, defaultOptions );
                console.log( mesh, transform, `you have performed a ${ type } transform` );
                mesh[ type ][ "set" ]( type === "rotation" ? this.convertToRadians( transform[ 0 ] ) : transform[ 0 ], type === "rotation" ? this.convertToRadians( transform[ 1 ] ) : transform[ 1 ], type === "rotation" ? this.convertToRadians( transform[ 2 ] ) : transform[ 2 ] );
                
            } );

        return mesh;
    },
    setupModifier: function( mesh, animProp, target, options ) {
        switch( target ) {
            case "position":
                
                if ( options.positionRelativeTo === "self" ) {
                    //the object moves based on its own position
                    return ( value ) => value + mesh.position[ animProp ];
                } else {
                    return ( value ) => value + this.scene.position[ animProp ];
                }
            default:
                return ( value ) => value;
        }
    },
    setupScene: function( options = {}, audioControllers = {} ) {
        //wraps into a promise for preloader to wait on data to be completed
        let scene = new THREE.Scene();
        this.scenes[ scene.id ] = scene;
        const intensity = defaultOptions.sunIntensity,
              sunColor = defaultOptions.sunColor;
        return new Promise ( ( res, rej ) => { 
            this.scenes[ scene.id ].name = this.scenes.length === 1 ? "preloader" : "main";
            this.scenes[ scene.id ].fog = this.fog;
            //adds arrowhelper and other debugs
            if ( this.options.hasOwnProperty( "debug") && this.options.debug ) {
                const origin = new THREE.Vector3( 1, 0, 0 );
                const length = 200;
                const xAxisHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ).normalize(), origin, length, 0xff0000 );
                const yAxisHelper = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ).normalize(), origin, length, 0x00ff00 );
                const zAxisHelper = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, -1 ).normalize(), origin, length, 0x0000ff );

                this.scenes[ scene.id ].add( xAxisHelper );
                this.scenes[ scene.id ].add( yAxisHelper );
                this.scenes[ scene.id ].add( zAxisHelper );
                
            }
            //creates the sun light for the whole world
            const sunlight = new THREE.DirectionalLight( sunColor, intensity );
            sunlight.name = "sunlight";
            sunlight.position.set( 0, 100000,  100000 );
            
            if ( this.options.hasOwnProperty( "enableShadows" ) && this.options.enableShadows ) {
                sunlight.castShadow = true;
                sunlight.shadow.mapSize.width = 512;
                sunlight.shadow.mapSize.height = 512;
                sunlight.shadow.camera.far = defaultOptions.cameraFar;
                sunlight.shadow.camera.near = defaultOptions.cameraNear;
                //debug shadow camera
                const shadowCamera = new THREE.CameraHelper( sunlight.shadow.camera );
                this.scenes[ scene.id ].add( shadowCamera );
            }
            
            sunlight.lookAt( new THREE.Vector3() );
            this.scenes[ scene.id ].add( sunlight );

            if (options instanceof Array) {
                options.forEach( ( o ) => {
                    if ( Object.keys( o ).length > 0 ) {
                        if ( o.hasOwnProperty( "texture" ) && typeof o.texture === "string" && /[jpg|png|gif]{1}$/.test( o.texture ) ) {
                            
                            new THREE.TextureLoader().load( o.texture, ( texture ) => {
                                
                                o = Object.assign( {}, o, { size: o.size !== undefined ? o.size : [ texture.image.naturalWidth / 2, texture.image.naturalHeight / 2, 0 ],
                                                          texture } );
                                this.setupMesh( o, scene.id ); 
                            } );
                            
                        } 
                        else if ( o.hasOwnProperty( "texture" ) && o.texture instanceof Array ) {
                            let promisePack = [];
                            
                            o.texture.forEach( url => {
                                promisePack.push( new Promise( ( res, rej ) => {
                                        
                                        new THREE.TextureLoader().load( url, tex => {
                                            
                                            res( tex )
                                    }, undefined, err => { 
                                    
                                    console.error( err.message ); 
                                    rej( err );
                                
                                    } ) } ) );
                            } );
                            
                            Promise.all( promisePack ).then( textures => { 
                                
                                console.log( textures, "after promise" );
                                this.setupMesh( Object.assign( {}, o, { texture: textures } ), scene.id ); 
                            } );
                        } 
                        
                        else {
                            
                            this.setupMesh( o, scene.id );
                        } 
                    }
                });
                //sends an animation type for scene transition
                res( { id : scene.id, animation: defaultOptions.sceneTransition } );
            } else if ( Object.keys(options).length > 0 && options.constructor === Object ) {
                
                if ( options.hasOwnProperty( "texture" ) && /[jpg|png|gif]{1}$/.test( options.texture) ) {
                    
                            new THREE.TextureLoader().load( options.texture, ( texture ) => {
                                
                                options = Object.assign( {}, options, { size: options.size !== undefined ? options.size : [ texture.image.naturalWidth / 2, texture.image.naturalHeight / 2, 0 ],
                                                          texture } );
                            } );
                            
                        }  else if ( options.hasOwnProperty( "texture" ) && options.texture instanceof Array ) {
                            let promisePack = [];
                            
                            options.texture.forEach( url => {
                                promisePack.push( new Promise( ( res, rej ) => {
                                        
                                        new THREE.TextureLoader().load( url, tex => {
                                            
                                            res( tex )
                                    }, undefined, err => { 
                                    
                                    console.error( err.message ); 
                                    rej( err );
                                
                                    } ) } ) );
                            } );
                            
                            Promise.all( promisePack ).then( textures => { 
                                
                                console.log( textures, "after promise all is complete" );
                                this.setupMesh( Object.assign( {}, options, { texture: textures } ), scene.id ); 
                            } );
            } else {
                            this.setupMesh( options, scene.id ); 
                        }
                res( { id : scene.id, animation: defaultOptions.sceneTransition }  );
            } else {
                return;
            }
        } );
        
    },
    setupRenderer: function ( options = {} ) {
        
        //sets up the renderer for the canvas element. By default it uses the WebGL Renderer with antialiasing off
    
        const renderer = new THREE.WebGLRenderer( { antialias : options.antialias !== undefined && options.antialias == true ? options.antialias : false, canvas: this.canvas} );
        const color = options.backgroundColor !== undefined ? options.backgroundColor : defaultOptions.backgroundColor,
            width = window.innerWidth,
            height = window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        //bg color
        renderer.setClearColor(color);
        
        if ( options.enableShadows !== undefined && options.enableShadows == true ) {
            renderer.shadowMap.enabled = true;
        }
        return renderer;
    },
    setupFog: function ( options = {} ) {
        //sets ups the scenes fog and if there are no defined properties it will use defaults
        let color;
        
        try {
            
            color = this.typeChecker( options, "color", defaultOptions );

            
            const density = options.fogDensity !== undefined ? options.fogDensity : defaultOptions.fogDensity;
            const type =  options.fogType !== undefined && typeof options.fogType === "string" ? options.fogType : defaultOptions.fogType;

            const camOpt = options.camera !== undefined ? options.camera : {};
            const far = camOpt.far !== undefined ? camOpt.far : defaultOptions.cameraFar;
            const near = camOpt.near !== undefined ? camOpt.near : defaultOptions.cameraNear;

            let fog;

            if ( type === "light" ) {
                fog = new THREE.Fog( color, near, far );
            } else if ( type === "heavy" ) {
                fog = new THREE.FogExp2( color, density );
            } else {
                throw new Error( "for Fog, you need to choose either 'heavy' or 'light' ");
            }
            
            return fog;
            
        } catch( err ) {
            
            console.warn( err.message );
            progressEmitter.emit( "world-message", err );
        }
        
    },
    setupWorldClone : function ( id, mesh, options = {} ) {
        
        if ( mesh.type === "Mesh" ) {
            
            let mat = mesh.material instanceof Array ? mesh.material[0] : mesh.material;
            console.log( mat.color, "material in world clone for " + mesh.name );
            console.log( mesh, id, "mesh.id and id in clone construction" );
            const newID = hashID( mesh.id, id );
            this.objManager.all[ newID ] =  {
                worldProps: {
                    health: 100,
                },
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
                id: newID,
                animeTimeline : anime.timeline( { autoplay: true, loop : true } ),
                originalOptions: options,
                transitions : {
                    opacity: undefined,
                    color: undefined,
                    position: undefined,
                    scale: undefined,
                    size: undefined,
                    width: undefined,
                    height: undefined,
                    depth: undefined,
                    rotation: undefined

                }
            };
        }
        
    },
    typeChecker : function ( options, type, defaults ) {
        //goes through each option attribute and returns an array with the information sorted for app use
        let arr = [];
        
        if ( options.hasOwnProperty( type ) && options[ type ] !== undefined ) {
            if ( options[ type ] instanceof Array ) {
                
                 arr = options[ type ];
                
            } else if ( typeof options[ type ] === "string" ) {
                
                arr = this.optionParser( options[ type ], options, type );
            
            } else if ( !Number.isNaN( options[ type ] ) ) {
                
                arr = [ options[ type ], options[ type ], options[ type ] ];
                
            } else {
                
                console.warn( "you are not using an acceptable data type for " + type );
            }
        
        } else {
            
            console.log( "using default options. type is "+ type );
        }
        
        if ( defaults[ type ] !== undefined && arr.length === 0 ) {
                return this.typeChecker( defaults, type, defaults );
        } else {
            
            if ( arr.length < 3 ) {
                
                for ( let x = 0; x <= 3 - arr.length - 1; x++ ) {
                    arr.push( arr[ 0 ] !== undefined ? arr[ 0 ] : 1 );
                }
            }
            
            return arr;
        
        }
        
        
    },
    initWorld : function ( id ) {
        //initializes world after clicking and removes event listener to prevent memory leaks
        let title;
        const delay = 4000;
        
        if ( this.options.hasOwnProperty("menu") && this.options.menu !== undefined ) {
            //menu options start
            this.canvas.removeEventListener("click", this.initWorld, false);
            title = this.scene.getObjectByName( "title" );
            if ( title !== undefined ) {
                const camData = calculateCameraView( title.position.z, this.camera );
                if ( title.hasOwnProperty("geometry") && title.geometry.parameters !== undefined && title.geometry.parameters.height !== undefined ) {
                    title.scale.set( 1 * ( camData.width / title.geometry.parameters.width ), 1 * ( camData.width / title.geometry.parameters.height ), 1 );
                }
                
                this.decideTimelineOrder( id, this.createAnime( mesh, options ), title, options );
            }
        }
       
        const preloaderPromise = this.createPreloader( this.scene.id, this.options.preloader !== undefined ? this.options.preloader : defaultOptions.preloader );
        
        if ( this.options.hasOwnProperty( "sounds") && this.options.sounds !== undefined ) {
            
            const audioPromise = initializeAudio( this.sounds );
    
            preloaderPromise.then( message => {
                progressEmitter.emit( "world-message", { message } );
                audioPromise.then( controllers => {
                        this.audioControllers = controllers;
                        this.sceneLoaded = this.setupScene( this.worldObjects, controllers );
                        this.sceneLoaded.then( completed => { 
                            
                            window.setTimeout( () => {
                                progressEmitter.emit( "world-message", { message: "" } );
                                this.scene = this.scenes[ completed.id ];
                            }, delay );
                        } )
                    } )
                } )
    
        } else {
                preloaderPromise.then( message => {
                    this.sceneLoaded = this.setupScene( this.worldObjects );
                    progressEmitter.emit( "world-message", { message } );
                    /* 
                        if the scene can't be made then the promise is never fulfilled and
                    the preloader will never stop 
                    
                    */
                    const preloader = this.scene.getObjectByName( "preloader" );
                    const options = Object.assign( {}, this.optionParser( "fade-out 1s ease-out-quart", this.options, "animation" ) );
                    
                    this.sceneLoaded.then( completed => {
                        console.log( completed, "when scene is completed" );
                        this.decideTimelineOrder( this.scene.id, this.createAnime( preloader, options ), preloader, options );
                        window.setTimeout( () => {
                            //need to delay based on animation settings
                            progressEmitter.emit( "world-message", { message: "" } );
                            this.scene = this.scenes[ completed.id ];
                            
                        }, options.animationDuration !== undefined ? options.animationDuration: delay );
                    } )
                } )            
            
        }

    },
    start: function () {
        
        this.setupScene( { worldObjects: {} } ).then( completed => {
            //makes sure the scene is fully loaded
            this.scene = this.scenes[ completed.id ];
            //start event listeners
            this.canvas.addEventListener( "mousemove", this.doMouseMove,  false );
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

                    try {
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

                            this.setupMesh( options, completed.id );
                            //calculate title mesh so if img is too large it will fit inside the camera viewW
                            let title = this.scenes[ completed.id ].getObjectByName( "title" );
                            this.fitOnScreen( title );
                        }, undefined, ( err ) =>  { throw new Error( "Couldn't load texture, check your img path" )  } );

                    } catch( err ) {
                        console.warn( err.message );
                    }
                } else {
                    console.log("turn into a 3D font");
                    //will create a font in 3D space based on font family
                    this.createFont( this.scene.id, this.mainFont, menu.title );

                }
            } else {
                this.initWorld( this.scene.id );
            }
        } );
        
        
       
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
            const name = obj.name.trim().toLowerCase();
     
            if ( obj.name === "board" ) {
                
                obj.rotation.y += 0.025;
                //obj.material.map.needsUpdate = true;
                //obj.material.map.offset.x += 0.01;
               // console.log( obj );
            }
            
            if ( /Light/.test( obj.type ) ) {
                //checks for light objects
                obj.target.position.clone( this.scene.position );
            }
        } );
    },
    runScene: function () {
        requestAnimationFrame( this.runScene );
        var time = this.clock.getDelta();
        var elaspedTime = this.clock.getElapsedTime();
        this.runAnimations( elaspedTime );

        this.renderer.render( this.scene, this.camera );
        
    },
    find: function ( query ) {
        //sceneLoaded his a promise that keeps recycling itself after each initiation
        //this makes sure everything is loaded before we mess with the object
            return this.sceneLoaded.then( completed => {
                //read only
                
                const mesh = this.scenes[ completed.id ].getObjectByName( query );
                const clone = this.objManager.all[ hashID( mesh.id, completed.id ) ];
                
                return {
                    mesh : mesh,
                    name: mesh.name,
                    id: mesh.id,
                    x: clone.x,
                    y: clone.y,
                    z: clone.z,
                    worldProps: clone.worldProps,
                    update: ( config ) => this.update.call( this, mesh, config )
                    
                }
                
                //this.objManager.all[ mesh.id * completed.id ] = item;


            } ).catch( err => { console.warn( err.message ) } );
        
    },
    update: function ( mesh, options = {} ) {
        
        try {
            
            if ( mesh.type === "Mesh" ) {

                    //@param m stands for mesh, it may change during update
                    let clone = this.objManager.all[ hashID( mesh.id, this.scene.id  ) ];
                    const playOnce = { autoplay: true, loop: 1 };
                    const originalMesh = mesh;

                    let m = mesh;
                
                // transitions are animations that aren't remembered by the timeline, they always play once
                
                if ( options.material !== undefined ) {
                        
                        if ( typeof options.material !== "string" ) throw new TypeError ( "material needs to be a string" );
                    
                            m.material.needsUpdate = true;

                            console.log( m );
                            let newMaterial = this.createMaterial( Object.assign( {}, { color: m.material[0].color.clone(), texture: m.material[0].map.clone(), material : options.material } ) );


                            m.material = newMaterial;
                    }
                
                        if ( ( options.hasOwnProperty( "transition" ) && options.transition !== undefined && typeof options.transition === "string" ) ) {

                            if ( /\,/.test( options.transition ) ) {

                                const seperateTransitions = options.transition.slice().split(",");
                                for ( let x = 0 ; x <= seperateTransitions.length - 1; x++ ) {

                                    const opts = this.optionParser( seperateTransitions[ x ].trim() , options, "animation" );
                                    if ( opts !== undefined ) {

                                       this.createTransition( this.scene.id, m, Object.assign( {}, opts, playOnce ) );
                                    }
                                }
                            } else {
                                const opts = this.optionParser( options.transition , options, "animation" );
                                console.log( opts, "options parsed" );
                                if ( opts !== undefined ) {
                                       this.createTransition( this.scene.id, m, Object.assign( {}, opts, playOnce ) );
                                }
                            }

                        } 


                    if ( options.color !== undefined ) {
                        const color = this.typeChecker( options, "color", defaultOptions );
                        //changes the color, but if transition is in place, color will smoothly change to next one
                        if ( clone.transitions.color !== undefined ) {
                            const type = "color";
                            const originalOptions = {
                                animationDuration: clone.transitions[ type ].duration,
                                animationDelay: clone.transitions[ type ].delay,
                                animationType: type,
                                loop: clone.transitions[ type ].loop,
                                animationDirection: clone.transitions[ type ].direction
                            }
                            this.createTransition( this.scene.id, m, Object.assign( {}, options, originalOptions ) );

                        } else {

                            m.material.color = color;
                        }
                    }

                    if ( options.texture !== undefined && typeof options.texture === "string" ) {

                        if ( options.texture !== "none" ) {
                                new THREE.TextureLoader().load( options.texture, texture => {
                                m.material.needsUpdate = true;
                                m.material.map = texture;
                            } );
                        } else {
                            m.material.needsUpdate = true;
                            m.material.map = undefined;
                        }

                        m.material.needsUpdate = false;
                    }

                        
                    
                    if ( options.position !== undefined ) {
                        
                        //equivalent to teleporting your object
                        
                        if ( clone.transitions.position !== undefined ) {
                            //changes the color, but if transition is in place, color will smoothly change to next one
                            const type = "position";
                            
                            console.log( type );
                            const originalOptions = {
                                animationDuration: clone.transitions[ type ].duration,
                                animationDelay: clone.transitions[ type ].delay,
                                animationType: type,
                                loop: clone.transitions[ type ].loop,
                                animationDirection: clone.transitions[ type ].direction,
                                
                            };
                            
                            this.createTransition( this.scene.id, m, Object.assign( {}, options, originalOptions ) );

                        }  else {
                            const position = this.typeChecker( options, "position", defaultOptions );
                            mesh.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                        }
                    }
                
                if ( options.size !== undefined || options.scale !== undefined ) {
                    if ( clone.transitions.scale !== undefined ) {
                            //changes the color, but if transition is in place, color will smoothly change to next one
                            const type = "scale";
                            
                            console.log( type );
                            const originalOptions = {
                                animationDuration: clone.transitions[ type ].duration,
                                animationDelay: clone.transitions[ type ].delay,
                                animationType: type,
                                loop: clone.transitions[ type ].loop,
                                animationDirection: clone.transitions[ type ].direction,
                                
                            };
                            
                            this.createTransition( this.scene.id, m, Object.assign( {}, options, originalOptions ) );

                        }  else {
                            const scale = this.typeChecker( options, "scale", defaultOptions );
                            mesh.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );
                        }
                }
                
                }
            }
            catch ( err ) {
        
                console.error( err.message );
            }
        
        }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;