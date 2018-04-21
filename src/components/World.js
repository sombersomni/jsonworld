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
        
        axios.get( "./albums" ). then( response => {
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
                "size" : [ 5, 100, 0 ],
                "position" : [ 0, 0, 0 ],
                "relativeTo" : "knee",
                "placement" : "top"
                
            }
            const benderTwo = {
                "name" : "bender",
                "type" : "cylinder",
                "size" : [ 5, 100, 0 ],
                "position" : [ 0, -100, 0 ],
                "relativeTo" : "knee",
                "placement" : "top"
                
            }
            const knee = {
                "name" : "knee",
                "type" : "dodecahedron",
                "position" : [ 0, -50, 0 ],
                "size" : 10
            }
            const box = {
                name : "box",
                type : "box",
                color : "green",
                material : "standard",
                bottom : 50,
                position : [ 0, 0, 0 ]
                
            }
            
            const bodySize = 50;
            const body = {
                name : "body",
                children  : [
                    {
                       name : "chest",
                       type : "dodecahedron",
                       size : bodySize
                    },
                    {
                        name : "butt",
                        type : "cylinder",
                        size: [ bodySize, 30, 0 ],
                        rotation : [ 0, 0, 90 ],
                        position: [ bodySize, 0, 0 ],
                        bottom: 20
                    }
                ]
            }
            
            const foot = {
                "name" : "foot",
                position: [ 0, -150, 0 ],
                "children" : [
                    {
                        "name" : "angle",
                        "type" : "cylinder",
                        "size" : [ 5, 18, 10 ]
                    }
                ]
            }
            const leg = {
                "name" : "leg",
                "position" : [ 100, 0, 0 ],
                "children" : [
                    bender, 
                    knee, 
                    benderTwo, 
                    foot
                ]
            }
            
            const head = {
                "name" : "head",
                "type" : "sphere",
                "size" : 14,
                "position" : [ 0, 75, 0 ],
                "relativeTo" : "neck"
            }
            
            const neck = {
                "name" : "neck",
                "type" : "tube",
                "side" : "front",
                "scale" : 1,
                "typeHandler" : ( t ) => {
                    //t gives a number from 0 to 1 to distribute points
                    let yVal, xVal;
                    const radius = 15
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
            
            const flamingo = {
                "name" : "flamingo",
                "material" : "toon",
                "color" : "blue",
                "children" : [
                    body,
                    head,
                    neck,
                    leg
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

this.world = new WorldController( Object.assign( {}, { worldObjects: [ floor, wall, box, flamingo ] } ) );
            
            this.world.start();
            
            
            window.setTimeout( () => {
                
                console.log( this.world );
            }, 10000 );
        } );
            
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