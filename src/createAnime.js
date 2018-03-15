import anime from "animejs";
import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

function packAnimations( mesh, options ) {
    const { asymmetry, keyframes, animProp,  canPack, animTarget, rule, elasticity, duration, offset, delay } = options;
    
    if ( mesh instanceof THREE.Group && asymmetry ) {

                let pack = [];
                for ( var n = 0; n <= mesh.children.length -1; n++ ) {
                    let obj = mesh.children[n];
                    if ( canPack ) {
                        pack.push({
                            targets: obj[ animTarget ],
                            [ animProp ] : keyframes || rule,
                            elasticity,
                            offset: "-="+( offset * n ),
                        });
                    }
                    
                
                    
                }
                return pack;
            } else {
                return {
                targets: mesh[ animTarget ],
                [ animProp ] : keyframes || rule,
                elasticity,
                offset,
                duration,
                delay,
                
                } ;
        }
}
function parseKeyframes( str ) {
    return str.slice().trim().split(" ").map( value => ( { value } ) );
}

function determineTarget( type, mesh ) {
    switch( type ) {
        case "scaleX":
            if ( mesh.type !== "Group" && mesh instanceof Group ) {
                return {
                    animTarget: "scale",
                    animProp: "x",
                }
            } else {
                return undefined;
            }
            break;
        case "x":
            return {
                animTarget: "position",
                animProp: "x"
            }
        case "y":
            return {
                animTarget: "position",
                animProp: "y"
            }
        case "z":
            return {
                animTarget: "position",
                animProp: "z"
            }
        default:
            return;
    }
}
export default function ( mesh, options = {} ) {
    let keyframes, animTarget, animProp, animator, canPack = true;
 
    let asymmetry = options.animationAsymmetry !== undefined && options.hasOwnProperty( "animationAsymmetry" ) ? options.animationAsymmetry : false ,
          type = options.animationType !== undefined && options.hasOwnProperty( "animationType" ) ? options.animationType : defaultOptions.animationType,
          //defaults are handled before they get to this function
          direction = options.animationDirection !== undefined && options.hasOwnProperty( "animationDirection" ) ? options.animationDirection : defaultOptions.animationDirection,
          duration = options.animationDuration !== undefined && options.hasOwnProperty( "animationDuration" ) ? options.animationDuration : defaultOptions.animationDuration ,
          delay = options.animationDelay !== undefined && options.hasOwnProperty( "animationDelay" ) ? options.animationDelay : defaultOptions.animationDelay,
          easing = options.animationEasing !== undefined && options.hasOwnProperty( "animationEasing" ) ? options.animationEasing : defaultOptions.animationEasing,
          elasticity = options.animationElasticity !== undefined && options.hasOwnProperty( "animationElasticity" ) ? options.animationElasticity : defaultOptions.animationElasticity,
          loop = options.loop !== undefined && options.hasOwnProperty( "loop" ) ? options.loop : defaultOptions.loop,
          offset = options.animationOffset !== undefined && options.hasOwnProperty( "animationOffset" ) ? options.animationOffset : defaultOptions.animationOffset,
          speed = 2;
    
    
    type.trim();
    type.toLowerCase();
    
    
    if ( options.animationKeyframes !== undefined && options.hasOwnProperty( "animationKeyframes" ) ) {
        
        if ( options.animationKeyframes[ type ] !== undefined ) {
            if ( typeof options.animationKeyframes[ type ] === "string" ) {
                keyframes = parseKeyframes( options.animationKeyframes[ type ] );
            } else if ( options.animationKeyframes[ type ] instanceof Array ) {
                let arr = options.animationKeyframes[ type ];
                keyframes = arr.map( ( frame, i, allFrames ) => {
                       if ( frame instanceof Object ) {
                           type = "custom";
                           const name = Object.keys( frame )[0];
                           const decision = determineTarget( name, mesh );
                           if ( decision !== undefined ) {
                               animTarget = decision.animTarget;
                               animProp = decision.animProp;
                               return { value: frame[ animProp ] } 
                           } 
                       } else {
                           return [{ value: frame }];
                       }
                } ); 

            } else {
                keyframes = undefined;
            }
        } else {
            if ( /custom/.test( type ) ) {
                canPack = false; 
                
            } else {
                keyframes = undefined;
            }
        }
    }
    
    console.log( keyframes, "Got keyframes" );
    
    let newOptions = {
            animTarget,
            animProp,
            canPack,
            rule: undefined,
            asymmetry,
            keyframes,
            type,
            direction,
            duration,
            delay,
            easing,
            elasticity,
            loop,
            offset,
            speed
    };
    
    
    
    switch( type ) {
        case "atom":
            return function ( time ) {
                //creates a simple animation that looks like an atom
                let mesh = this;
                const count = 2,
                    radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2;
                if ( mesh.children.length >= count ) {

                } else {
                    for ( let i = 0; i <= count - 1; i++ ) {
                        let g = new THREE.Geometry();
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
        case "custom" : 
            
            return packAnimations( mesh, newOptions );
            
            break;
        case "erratic" :
            return function ( time ) {
                let mesh = this;
                const growthRate = 1.25,
                    length = mesh.geometry.vertices.length,
                    radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2,
                    rand = Math.round( Math.random() * length - 1 );
                //every 5 seconds execute
                if( Math.round( time ) % 1 === 0 ) {
                    mesh.geometry.currentVectorIndex = rand;
                    mesh.geometry.currentVector = mesh.geometry.vertices[ mesh.geometry.currentVectorIndex ];
                }
                if( mesh.geometry.currentVectorIndex && mesh.geometry.currentVector ) {
                    const cIndex = mesh.geometry.currentVectorIndex;
                    const x = mesh.geometry.currentVector.x,
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
        case "fade" :
            return {
                targets: mesh.material,
                opacity: 0,
                duration,
                delay,
                loop: 1
            }
        case "linear" :
            const distance = 50;
            return packAnimations( mesh, Object.assign({}, newOptions, { rule : distance, animProp: "x", animTarget: "position" } ) );
        case "shapeshift" :
            return function ( time ) {
                let mesh = this;
                for ( let i = 0; i < mesh.geometry.vertices.length; i++ ) {
                    mesh.geometry.vertices[i].y += Math.sin( time + i ) * 1/20;
                    mesh.geometry.vertices[i].x += Math.cos( time + i ) * 1/20;
                    mesh.geometry.vertices[i].z += Math.sin( time + i ) * 1/20;
                }
                mesh.geometry.verticesNeedUpdate = true;
            }
        case "spin_basic" :

            return packAnimations( mesh, Object.assign({}, newOptions, { rule : defaultOptions.rotationAngle, animProp: "y", animTarget: "rotation" } ) );
            
        case "spin_random" :
            return anime( {
                targets: mesh.rotation,
                y: Math.PI * 2,
                elasticity: 100 / speed,
                duration: 5000 / speed,
                loop: 1,
                complete: function( anim ) {
                    const axis = "xyz";
                    const random = Math.round( Math.random() * 3 - 1 );
                    anim.animations[0].property = axis.charAt( random );
                    anim.restart();
                }
            } );
        case "zoom_beat" :
            return {
                targets: mesh.position,
                z: keyframes !== undefined ? keyframes: mesh.position.z - 100,
                elasticity,
                duration,
                direction : "alternate"
            };
        case "zoom_normal" :
            return function ( time ) {
                let mesh = this;
                const distance = 20;
                if ( mesh.prevPosition === undefined ) {
                    mesh.prevPosition = {};
                    mesh.prevPosition.z = mesh.position.z;
                }
                mesh.position.z = ( distance * Math.sin( time * ( speed / 10 ) ) ) + mesh.prevPosition.z;
            }
        default:
            return;
    }
}