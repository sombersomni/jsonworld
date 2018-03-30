//World Component
import React, { Component } from "react";
import * as THREE from "three";
let spotify = require('spotify');

import progressEmitter from "../events/progressEmitter.js";
import Progress from "./Progress.js";
import WorldController from "../WorldController.js";

class World extends Component {
	constructor ( props ) {
		super( props );
        
        let books = [];
        for ( let i = 0; i <= 40; i++ ) {
            const book = {
                "name" : "book" + i.toString(),
                "type" : "box",
                "size" : [ 75 , 100, 10 ],
                "position": [ 100 * i * ( i % 2 === 0 ? -1 : 1 ) , 0, -50 ],
                "color" : "white",
                "material" : "basic",
                "shadow" : true,
                "transition" : "color 2s",
                "texture" : [ "imgs/front_cover.jpg", "imgs/back_cover.jpg"  ]
            };
            
            books.push( book );
        }

		this.world = new WorldController( Object.assign( {}, { worldObjects: books } ) );
        this.state = {
			message: "click the screen to start.",
            currentUUID: this.world.scene.uuid
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
        progressEmitter.on("world-message", ( e ) => {
            this.setState( { message: e.message } );
        } );
            
            const id = "c18142940c3248d18ea25bf28db22de5";
 
    spotify.lookup({ type: 'artist', query: 'mac' }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
        
        console.log( data );
});
        
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