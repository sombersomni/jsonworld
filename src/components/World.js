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
            const mods = [
                    {
                        type : "geometry",
                        mod: "squeeze",
                        modType: "pinch-down",
                        modAngles : [ 10, 0, 0 ]   
                    }
            ];
            
            const floor = {
                "type" : "plane",
                "name" : "floor",
                "side" : "back",
                "size" : [ 10000, 10000 ],
                "modifiers" : [ {
                        type: "geometry",
                        mod: "noise",
                        modType: "spikey",
                        modAngles : [ 0, 0, 0 ],
                        amplify: 40
                    } ],
                "material" : "phong",
                "color" : "yellow",
                "position" : "0 -500 1000",
                "rotation" : [ 90, 0, 0 ]
            }
            
            
            const bodySize = 80;
            const bodyWidth = 75;
            const offset = 5;
  
            const board = {
               type: "box",
                name: "board",
                color: "#ffffff",
                layout: "basic",
                size: "100 100 10",
                scale: [ 1, 1, 1 ],
                position: [ 0, 0, 300 ],
                texture: "imgs/crate.jpg",
                modifiers: mods,
                material: "standard",
                children : [ { type: "sphere", count: 10, size: 50, name: "ball", subtract: true },
                            { type: "box", size: 10, name: "box", position: "0, 0, 0", color: " red", children : [ { type: "tetrahedron", name: "tetra", position: [50, 0, 0] } ] } ], 
                segments: 16
            };
            
            const line = {
                type: "line",
                name: "connector",
                color: "#000000",
                position: [ 0, 0, 300 ],
                path: [ { x: 0, y:0, z: 0 }, { x: 400, y:300, z: 0 } ]
            }

this.world = new WorldController( Object.assign( {} , { worldObjects: [ floor, board, line ] } ) );
            
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