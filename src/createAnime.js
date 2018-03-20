import anime from "animejs";
import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

function convertKeyframesToRadians( keyframes ) {
    console.log( keyframes, "radians" );
    return keyframes.map( frame => {
        return { value: frame.value * ( Math.PI * 2 / 180 ) }
    } );
}


function parseKeyframes( str ) {
    return str.slice().trim().split(" ").map( value => ( { value } ) );
}

function determineTarget( type, mesh ) {
    
    try {
        switch( type ) {
            case "opacity" :
                
                return {
                    animTarget: "material",
                    animProp: "opacity"
                    
                };
            case "rotationX" :
                return {
                    animTarget: "rotation",
                    animProp: "x",
                };

            case "rotationY" :
                return {
                    animTarget: "rotation",
                    animProp: "y",
                };
            case "rotationZ" :
                return {
                    animTarget: "rotation",
                    animProp: "z",
                };
            case "scaleX" :
                return {
                    animTarget: "scale",
                    animProp: "x",
                };

            case "scaleY" :
                return {
                    animTarget: "scale",
                    animProp: "y",
                };

            case "scaleZ" :
                return {
                    animTarget: "scale",
                    animProp: "z",
                };
            case "x" :
                return {
                    animTarget: "position",
                    animProp: "x"
                }
            case "y" :
                return {
                    animTarget: "position",
                    animProp: "y"
                }
            case "z" :
                return {
                    animTarget: "position",
                    animProp: "z"
                }
            default:
                
                throw new Error( "you need to pick the correct property name or your spelling is off" );
                return;
        }
    } catch( err ) {
        
        console.warn( err );
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
          moveRelativeTo = options.moveRelativeTo !== undefined && options.hasOwnProperty( "moveRelativeTo" ) ? options.moveRelativeTo : defaultOptions.moveRelativeTo,
          speed = 2;
    
    type.trim();
    type.toLowerCase();
    
    //seperate keyframes and make it compatible for use in anime timeline
    if ( options.animationKeyframes !== undefined && options.hasOwnProperty( "animationKeyframes" ) ) {
        
        try {
          if ( options.animationKeyframes[ type ] !== undefined ) {
                if ( typeof options.animationKeyframes[ type ] === "string" ) {
                    keyframes = parseKeyframes( options.animationKeyframes[ type ] );
                } else if ( options.animationKeyframes[ type ] instanceof Array ) {
                    let arr = options.animationKeyframes[ type ];
                    keyframes = arr.map( ( frame, i, allFrames ) => {
                           if ( frame instanceof Object ) {
                               type = "custom";     
                               let eachProp = [];
                               Object.keys( frame ).forEach( ( key ) => {
                                   /* 
                                        we go through each property in the animation
                                   frame object in order to assign multiple changes in one keyframe

                                   */

                                   const decision = determineTarget( key , mesh );

                                      if ( decision !== undefined ) {
                                           animTarget = decision.animTarget;

                                           let value = frame[ key ];
                                          
                                          if ( Number.isNaN( value ) ) {
                                              throw new TypeError( defaultOptions.errors.FRAMEVALUE );
                                          }
                                          
                                           eachProp.push( { 
                                               animProp: decision.animProp,
                                               value
                                           } );

                                       } 
                               } );

                                   return eachProp;

                           } else {
                               
                                          if ( Number.isNaN( frame ) ) {
                                              throw new TypeError( defaultOptions.errors.FRAMEVALUE );
                                          }
                                           
                               return [ { animProp: decision.animProp, value: frame } ];
                           }
                    } ); 

                } else {
                    keyframes = undefined;
                }
            } else {
                console.log( type );
                if ( /^[\_]{1}/.test( type ) ) {
                    canPack = false; 

                } else {
                    console.log( keyframes );
                    keyframes = undefined;
                }
            }  
        } catch( err ) {
            console.log( err );
        }
        
    }
    
    let newOptions = {
            animTarget,
            canPack,
            complete: ( info ) => { },
            finished: ( info ) => { },
            run: ( info ) => { },
            began: ( info ) => { },
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
            moveRelativeTo,
            speed
    };
    
    console.log( newOptions );
    
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
            
            console.log( newOptions, "custom anim" );
            return this.packAnimations( mesh, Object.assign( {}, newOptions ) );
        case "erratic" :
            return ( time, id ) => {
                let mesh = this.scene.getObjectById( id );
                const growthRate = 1.25,
                    length = mesh.geometry.vertices.length,
                    radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2 || 10,
                    rand = Math.round( Math.random() * length );
                //every second execute lerp coordinate change
                if( Math.round( time ) % 1 === 0 ) {
                    mesh.geometry.currentVectorIndex = rand;
                    mesh.geometry.currentVector = mesh.geometry.vertices[ mesh.geometry.currentVectorIndex ];
                }
                if( mesh.geometry.currentVectorIndex && mesh.geometry.currentVector ) {
                    const cIndex = mesh.geometry.currentVectorIndex;
                    const x = mesh.geometry.currentVector.x,
                        y = mesh.geometry.currentVector.y,
                        z = mesh.geometry.currentVector.z;
                    if( Math.abs( x ) < radius * 3 && Math.abs( y ) < radius * 3 && Math.abs( z ) < radius * 3 ) {
                        mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x * growthRate, y * growthRate, z * growthRate ), Math.random() );
                    } else {
                        mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x / growthRate, y / growthRate, z / growthRate ), Math.random() );
                    }
                }
                mesh.rotation.y += .01;
                mesh.geometry.verticesNeedUpdate = true;
            }
            case "test" :
            return () => console.log( this );
        case "fade-in" :
            
            newOptions.animTarget = "material";
            newOptions.keyframes = { animProp: "opacity", value: 1 };
            return this.packAnimations( mesh, newOptions );
    
        case "fade-out" :
            
            newOptions.animTarget = "material";
            newOptions.keyframes = { animProp: "opacity", value: 0 };
            return this.packAnimations( mesh, newOptions );
    
        case "linear" :
            
            newOptions.animTarget = "position";
            newOptions.keyframes = { animProp: "x", value: 400 };
            return this.packAnimations( mesh, newOptions );
            
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
        case "spin-basic" :
            
            newOptions.animTarget = "rotation";
            newOptions.keyframes = { animProp: "y", value: ( Math.PI * 2 / 180 ) * defaultOptions.rotationAngle };
            
            return this.packAnimations( mesh, Object.assign( {}, newOptions ) );
            
        case "wavy":
            
            return function ( time ) {
                    let obj = this;
                    if ( exploreRow ) {
                        const isRow = true;
                        const isUniform = true;
                        const waveRadius = 20;
                        for ( let index = 0; index <= obj.geometry.parameters.heightSegments ; index++ ){
                           const rowOrCol =  isRow ? obj.geometry.parameters.widthSegments : obj.geometry.parameters.heightSements;
                    
                            for ( let start = 0; start <= rowOrCol; start++ ) {
                                if( isRow ) {
                                    //effect only a specific row
                                    const newIndex = start + ( ( rowOrCol + 1 ) * index )

                                    if ( obj.animationManager.originalPosition === undefined ) {
                                        obj.animationManager.originalPosition = obj.position.clone();
                                    }
                                    obj.geometry.vertices[ newIndex ].z = ( Math.sin( ( ( time + index / obj.geometry.parameters.heightSegments + ( isUniform ? 1 : start  ) ) * obj.animationManager.speed ) ) * waveRadius ) + obj.animationManager.originalPosition.z;
                                } else {
                                    console.log( ( rowOrCol * start ) + index + start ) 
                                }

                            } 
                        }
                            
                        
                    }
            }

        case "zoom-beat" :
            
            newOptions.animTarget = "position";
            newOptions.keyframes = keyframes !== undefined ? keyframes: { animProp: "z", value: mesh.position.z + 100 };
            return this.packAnimations( mesh, Object.assign( {}, newOptions ) );
            
        case "zoom-normal" :
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