import * as THREE from "three";
import anime from "animejs";

function WorldController (options) {
    this.preloader = options.preloader;
    //packages for storing
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
    initPreloader: function ( options ) {
        var g = this.createGeometry( options );
        var m = this.createMaterial( options.material, options.color );
        var mesh = new THREE.Mesh( g, m );
        this.setupMesh(g, m);
        mesh.name = "root";
        var wrapper = new THREE.Group();
        mesh.anime = this.createAnime( mesh, options.animation );
        wrapper.add( mesh );
        wrapper.name = "preloader";
        this.scene.add( wrapper );
    },
    createAnime: function ( mesh, options = {} ) {
        var type = options.type !== undefined ? options.type : "spin_basic",
            speed = options.speed !== undefined ? options.speed : 1;
        switch( type ) {
            case "atom":
                return function ( time ) {
                    //creates a simple animation that looks like an atom
                    var mesh = this;
                    var count = 2,
                        radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2;
                    if ( mesh.children.length >= count ) {

                    } else {
                        for ( var i = 0; i <= count - 1; i++ ) {
                            var g = new THREE.Geometry();
                            g.vertices = mesh.geometry.vertices;
                            //console.log( g );
                            // console.log( mesh );
                            /*
                            var clone =
                            clone.position.set( radius * 2, 0, 0 );
                            clone.scale.set( .25, .25, .25 );
                            mesh.add( clone );
                            */
                            //console.log( mesh );
                        }
                    }
                }
            case "erratic" :
                return function ( time ) {
                    var mesh = this;
                    var growthRate = 1.25,
                        length = mesh.geometry.vertices.length,
                        radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2,
                        rand = Math.round( Math.random() * length - 1 );
                    //every 5 seconds execute
                    if( Math.round( time ) % 1 === 0 ) {
                        mesh.geometry.currentVectorIndex = rand;
                        mesh.geometry.currentVector = mesh.geometry.vertices[ mesh.geometry.currentVectorIndex ];
                    }
                    if( mesh.geometry.currentVectorIndex && mesh.geometry.currentVector ) {
                        var cIndex = mesh.geometry.currentVectorIndex;
                        var x = mesh.geometry.currentVector.x,
                            y = mesh.geometry.currentVector.y,
                            z = mesh.geometry.currentVector.z;
                        if( Math.abs( x ) < radius * 2 && Math.abs( y ) < radius * 2 && Math.abs( z ) < radius * 2 ) {
                            mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x * growthRate, y * growthRate, z * growthRate ), Math.random() );
                        } else {
                            mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x / growthRate, y / growthRate, z / growthRate ), Math.random() );
                        }
                    }
                    mesh.rotation.y += .01;
                    mesh.geometry.verticesNeedUpdate = true;
                }
            case "shapeshift":
                return function ( time ) {
                    var meshes = this;
                    for ( var i = 0; i < mesh.geometry.vertices.length; i++ ) {
                        mesh.geometry.vertices[i].y += Math.sin( time + i ) * 1/20;
                        mesh.geometry.vertices[i].x += Math.cos( time + i ) * 1/20;
                        mesh.geometry.vertices[i].z += Math.sin( time + i ) * 1/20;
                    }
                    mesh.geometry.verticesNeedUpdate = true;
                }
            case "spin_basic":
                return anime( {
                    targets: mesh.rotation,
                    y: Math.PI * 2,
                    elasticity: 100,
                    duration: 5000 / speed,
                    loop: true
                } );
            case "spin_random":
                return anime( {
                    targets: mesh.rotation,
                    y: Math.PI * 2,
                    elasticity: 100,
                    duration: 5000 / speed,
                    loop: 1,
                    complete: function( anim ) {
                        // anim.restart();
                        var axis = "xyz";
                        var random = Math.round( Math.random() * 3 - 1 );
                        anim.animations[0].property = axis.charAt( random );
                        anim.restart();
                    }
                } );
            default:
        }
    },
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
                return new THREE.MeshNormalMaterial( { flatShading: true, side: THREE.DoubleSide } );
            case "wireframe" :
                return new THREE.MeshNormalMaterial( { transparent: true, wireframe: true } );
            default:
                return new THREE.MeshBasicMaterial( { color } );

        }
    },
    getCanvas: function ( id = "world" ) {
        //if canvas doesn't exist we will create one//
        var canvas = document.querySelector( "canvas" );
        if( canvas === null || canvas === undefined ) {
            var newCanvas = document.createElement( "canvas" );
            newCanvas.setAttribute( "id", id );
            document.body.appendChild( newCanvas );
            return newCanvas;
        } else {
            return canvas;
        }
    },
    setupCamera: function ( options = {} ) {
        //camera setup * need to add cinematic option later
        var opt = options.camera || options;
        var camera;
        var width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        var aspectRatio = width/ height,
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
        var opt = options.renderer || options;
        var renderer = new THREE.WebGLRenderer( { canvas : this.canvas } );
        var color = opt.color !== undefined ? opt.color : 0x0022CC,
            width = opt.width !== undefined ? opt.width : window.innerWidth,
            height = opt.height !== undefined ? opt.height : window.innerHeight;
        renderer.setSize( width, height );
        renderer.setPixelRatio( window.devicePixelRatio );
        //bg color
        renderer.setClearColor( color );
        return renderer;
    },
    start: function () {
        this.scene.name = "menu";
        var menuScene = this.scene;
        this.scenes.push( menuScene );
        this.initPreloader( this.preloader );
        requestAnimationFrame( this.runScene );

    },
    runAnimations: function ( time ) {
        this.scene.children.forEach( ( obj ) => {
            if( obj.type.toLowerCase() === "group" ) {
                obj.children.forEach( ( m ) => {
                    if( typeof m.anime === "function" ) {
                        m.anime( time, m.name );
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
        this.camera.aspect = window.innerWidth/ window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.render( this.scene, this.camera );
    }
};
Object.assign( WorldController.prototype, framework );

export default WorldController;