//World Component
import React, { Component } from "react";
import * as THREE from "three";

let axios = require( "axios" );
let path = require( "path" );
import progressEmitter from "../events/progressEmitter.js";
import Progress from "./Progress.js";
import WorldController from "../WorldController.js";

class World extends Component {
	constructor ( props ) {
		super( props );
        
        this.world = undefined;
        this.state = {
			message: "click the screen to start."
		};
	}
	createLinks ( links ) {
		var pattern = /(bandcamp|instagram|soundcloud|spotify|twitter|tumblr|youtube){1}/;
		var domLinks = [];
		for ( let i = 0; i < links.length; i++ ) {
			var match = links[i].match( pattern );
			domLinks.push( <a href = { links[i] } key ={ match[0] } ><span className ="fa-stack fa-lg">
			  <i className = "fa fa-square-o fa-stack-2x"></i>
			  <i className ={ "fa fa-" + match[0] + " fa-stack-1x" }></i>
			</span> </a> );
		}
		return ( <div className="links"> domLinks </div> );
	}
	componentDidMount () {
        progressEmitter.on( "world-message", ( e ) => {
            this.setState( { message: e.message } );
        } );
        
        //axios.get( "./albums" ). then( response => {
            /*
            let albums = [];
            for ( let i = 0; i <= 5; i++ ) {
                const eachAlbum = response.data.items[ i ];
                const album = {
                    "name" : eachAlbum.name,
                    "type" : "box",
                    "size" : [ eachAlbum.images[ 1 ].width , eachAlbum.images[ 1 ].height, 10 ],
                    "position": [ eachAlbum.images[ 1 ].width * i * 2 * ( i % 2 == 0 ? -1 : 1 ), 0, -1000 ],
                    "color" : "white",
                    "material" : "lambert",
                    "group" : "albums",
                    "shadow" : true,
                    "animation" : "rotation 2s",
                    "animationKeyframes" : {
                        "rotation" : [ { rotateY: 100 } ]
                    },
                    "texture" : [ eachAlbum.images[ 1 ].url ]
                };

                albums.push( album );
            }
            */
           
            const square = {
                "type": "circle",
                "name" : "circle",
                "color" : "blue",
                "size" : 200,
                "fold" : [ 40, 20, 0 ],
                "foldRadius" : [ 50, 100, 0 ],
                "position" : [ 0, 0, 200 ]
            }
            
            const squareTwo = {
                "type": "plane",
                "name" : "square",
                "color" : "pink",
                "size" : 100,
                "position" : [ 0, 200, 200 ]
            }
            
            const floor = {
                "type" : "plane",
                "name" : "floor",
                "size" : [ 10000, 10000 ],
                "material" : "phong",
                "color" : "yellow",
                "position" : "0 -500 1000",
                "rotation" : [ 90, 0, 0 ]
            }
            
            const bender = {
                "name" : "bender",
                "type" : "cylinder",
                "size" : [ 5, 70, 0 ],
                "position" : [ 0, 0, 0 ],
                "relativeTo" : "knee",
                "placement" : "top"
                
            }
            const benderTwo = {
                "name" : "bender2",
                "type" : "cylinder",
                "size" : [ 5, 100, 0 ],
                "position" : [ 0, -35 - 50, 0 ],
                "relativeTo" : "knee",
                "placement" : "top"
                
            }
            const knee = {
                "name" : "knee",
                "type" : "dodecahedron",
                "position" : [ 0, -35, 0 ],
                "size" : 10
            }
            
            const bodySize = 80;
            const bodyWidth = 75;
            const offset = 5;
            
            
            //build feathers using for loops
            let feathers = {
                name : "feathers",
                color : "red",
                position: "0 0 450",
                children : [],
            }
            const featherWidth = 10;
            const featherAngle = 10;
            const max = 100;
            let sum = 0;
            for ( var n = 0; n < 1; n++ ) {
                           
                
                const powered = ( Math.floor( n / 2 ) + 1 ) * 10;
                const featherLength = featherWidth + powered >= max ? max : powered;
                if ( n % 2 === 0 ) {
                    sum += featherLength / 2;
                }
                const angle =  Math.PI * ( n / 10 );
              const feather = {
                    name: "feather",
                    type: "shape",
                    fold: [ 180, 0, 0 ],
                    material : "lambert",
                    position: [ ( n % 2 ) * ( ( featherWidth / 2 ) - featherWidth / 2 ) - featherWidth / 4, Math.sin( angle ) * sum, -20 * Math.floor( n / 2 ) / 5 ],
                    layout: "basic",
                    layoutLimit: [ 5, 100, 1 ],
                    margin: [ 0, 0, 0 ],
                    path : function () {
                        let arr = [], flippedArr = [];
                        for ( let x = 0; x <= 20; x++ ) {
                            if ( x <= 10 ) {
                               arr.push( { type: "quad", x: x, y: Math.sin( ( ( Math.PI / 2 ) * ( x / 9 ) ) + Math.PI / 2 ) * -3, z : 0 } );  
                            } else if ( x > 10 && x <= 19 ) {
                                arr.push( { x: 10 - ( ( x - 10 ) ), y : ( x - 10 ) * 2, z : 0  } );
                            } else {
                                arr.push( { x: 0 , y: 30, z: 0 } );
                            }
                        }
                        
                        for ( let r = arr.length - 2; r >= 0; r-- ) {
                            
                            flippedArr.push( { type: arr[ r ].type, x: arr[ r ].x * -1, y: arr[ r ].y, z: 0 } );
                        }
                        
                        return arr.concat( flippedArr );
                    }(),
                  rotation: [ -1 * angle * 180 /  Math.PI, n % 2 === 0 ? featherAngle : -featherAngle, n % 2 === 0 ? featherAngle : -featherAngle ]
                }  
                console.log( angle, "here is the angle" );
                feathers.children.push( feather );
            }
            
            const foot = {
                "name" : "foot",
                position: [ 0, -150, 0 ],
                "children" : [
                    {
                        "name" : "ankle",
                        "type" : "cylinder",
                        "size" : [ 5, 18, 10 ]
                    }
                ]
            }
            const legOffset = 10;
            const legSpace = bodySize / 2.5;
            const leg = {
                "name" : "leg",
                "position" : [ legOffset, legSpace, legSpace ],
                "children" : [
                    bender, 
                    knee, 
                    benderTwo, 
                    foot
                ]
            }
            
            const legTwo = {
                "name" : "leg2",
                "position" : [ legOffset, 0, -1 * legSpace ],
                "children" : [
                    bender, 
                    knee, 
                    benderTwo, 
                    foot
                ]
            }
            
            const neck = {
                "name" : "neck",
                "type" : "tube",
                "side" : "front",
                "size" : 40,
                "bottom" : 20,
                "top" : 50,
                "scale" : 1,
                "position" : "0 0 0",
                "segments" : 10,
                "typeHandler" : ( t ) => {
                    //t gives a number from 0 to 1 to distribute points
                    let yVal, xVal;
                    const radius = 15;
                    if ( t < 0.25 ) {
                        yVal = - 10 * Math.sin( t * 4 * Math.PI );
                        xVal = ( Math.sin( t * Math.PI * 2 ) * ( radius * 2 ) ) - radius;
                    }  else {
                        yVal = 100 * ( t - 0.25 );
                        xVal = Math.sin( t * Math.PI * 2 ) * radius;
                    }
                    return { x: xVal, y :  yVal, z: 0 };
                },
                "rotation" : [ 0, 180, 0 ]
            }
            
            const head = {
                "name" : "head",
                "type" : "sphere",
                "size" : 20,
                "position" : [ 0, 75, 0 ],
                "relativeTo" : "neck",
                
            }
            
            const noggin = {
                "name" : "noggin",
                "children" : [
                    head,
                    neck
                ]
            }
            
             const body = {
                name : "body",
                color: "pink",
                position: [ 50, 0, 0 ],
                children  : [
                    {
                       name : "chest",
                       type : "sphere",
                       size : bodySize
                    },
                    {
                        name : "butt",
                        type : "cylinder",
                        size: [ bodySize - offset, bodyWidth, 0 ],
                        rotation : [ 0, 0, 90 ],
                        position: [ bodyWidth / 2, 0, 0 ],
                        bottom: 25
                    },
                    leg,
                    legTwo
                ]
            }
            const flamingo = {
                "name" : "flamingo",
                "material" : "toon",
                "color" : "blue",
                "side" : "front",
                "openEnded" : "true",
                "children" : [
                    body,
                    noggin,
                ]
                        
            };
            
            const wall = {
                "type" : "plane",
                "name" : "wall",
                "size" : [ 10000, 10000 ],
                "material" : "phong",
                "color" : "red",
                "position" : "0 0 -10000"
            }

this.world = new WorldController( Object.assign( {}, { debug : true }, { worldObjects: [ floor, flamingo, square, squareTwo ] } ) );
            
            this.world.start();
            
            
            window.setTimeout( () => {
                
                console.log( this.world );
            }, 10000 );
       // } );
            
	}
	componentWillReceiveProps( nextProps ) {
		console.log( nextProps );
	
	}
	render () {
		const { config } = this.props;
		return (
			<div>
					{ config.hasOwnProperty( "menu" ) && config.menu.links !== undefined ? this.createLinks( config.menu.links ) : null }
				<canvas></canvas>
                <Progress message = { this.state.message } />
				
			</div>
		);
	}
}

export default World;