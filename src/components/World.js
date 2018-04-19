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
            
            const vaseSize = {
                
                w: 50,
                h: 200,
            }
            
            const vase = {
                type: "lathe",
                size: vaseSize,
                color: "blue",
                path: function () {
                    
                    let arr = [];
                    for ( let x = 0; x < vaseSize.h; x+= 2 ) {
                        
                        arr.push( { x : Math.sin( ( x / 40 )  + 1 ) * vaseSize.w, y : x }  );
                    }
                    
                    return arr;
                }()
            };
            
            const floor = {
                "type" : "plane",
                "name" : "floor",
                "size" : [ 10000, 10000 ],
                "material" : "phong",
                "color" : "yellow",
                "position" : "0 -500 1000",
                "rotation" : [ 90, 0, 0 ]
            }
            
            const wall = {
                "type" : "plane",
                "size" : [ 10000, 10000 ],
                "material" : "phong",
                "color" : "red",
                "position" : "0 0 -5000"
            }

this.world = new WorldController( Object.assign( {}, { worldObjects: [ floor, vase ].concat( albums ) } ) );
            
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