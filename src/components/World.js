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
                position: "0 0 150",
                children : [],
            }
            
                const feather = {
                    "type": "circle",
                    "name" : "feather",
                    "color" : "blue",
                    "count" : 10,
                    "layout": "radial",
                    "layoutLimit" : [ 10, 2, 10 ],
                    "margin" : [ -80, 0, 0 ],
                    "size" : 100,
                    "fold" : [ 45, 20, 0 ],
                    "foldRadius" : [ 30, 0, 0 ],
                    "foldPower" : [ 1, 1, 1 ]
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

this.world = new WorldController( Object.assign( {}, { debug : true }, { worldObjects: [ floor, flamingo, feather ] } ) );
            
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