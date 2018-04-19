//jsonworld framework
import colorInterpreter from "./utils/colorinterpreter.js";
import defaults from "./json/defaults.json";
import * as THREE from "three";


class World {
    
    constructor( options ) {
        
        this.options = options;
    }
    add( options ) {
        
    }
    
    update() {
        
    }
    
    find( name ) {
        
        
        
        return this;
    }
}

class Item extends World {
    
    constructor( item ){
        super( item );
        
    }
}

export default function ( config ) {
    
    //setup world
    const newConfig = assignOptions( config );
    
    
    
    let world =  new World( newConfig );
    
    runScene.bind( world );
    
    return world;
}

function assignOptions ( options ) {
    
   const color = options.color !== undefined && ( typeof options.color === "string" || options.color instanceof Array ) ? colorInterpreter( options.color ) : defaults.color;
    console.log( color );
    
    return Object.assign( {}, { color } );
}

function runScene() {
    
        requestAnimationFrame( this.runScene );
        var time = this.clock.getDelta();
        var elaspedTime = this.clock.getElapsedTime();
        this.runAnimations( elaspedTime );

        this.renderer.render( this.scene, this.camera );
        
}