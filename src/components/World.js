//World Component
import React, { Component } from "react";
import * as THREE from "three";

import progressEmitter from "../events/progressEmitter.js";
import Progress from "./Progress.js";
import WorldController from "../WorldController.js";

class World extends Component {
	constructor ( props ) {
		super( props );

		this.world = new WorldController( this.props.config );
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
		this.world.start();
            
        setTimeout( () => { 
            this.world.find( "book" ).then( book => { 
                console.log( book );
                //book.update( { color : "red" } );
            } );
            // returns a copied instance of what the book is at that moment. Read only
            //such as the color, id, name, x, y, z, width, height, etc
            //includes any other properties you give it outside the basics like author and year
            
            //notice the ids are the same as the item was simply updated, rather than replaced
            //however, for advanced changes the id may not stay the same
            
            
        }, 2000 );
            
            setTimeout( () => { 
            this.world.find( "ball" ).then( ball => { 
                console.log( ball );
                //book.update( { color : "red" } );
            } );
            // returns a copied instance of what the book is at that moment. Read only
            //such as the color, id, name, x, y, z, width, height, etc
            //includes any other properties you give it outside the basics like author and year
            
            //notice the ids are the same as the item was simply updated, rather than replaced
            //however, for advanced changes the id may not stay the same
            
            
        }, 10000 );
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