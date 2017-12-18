import * as THREE from "three";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    var segments = options.segments ? options.segments : 2,
        type = options.type !== undefined ? options.type : "default";
    var size;
    if ( typeof options.size === "number" ) {
        //uses a single number for sizing
        size = options.size;
    } else if ( options.size instanceof Array ) {
        console.log( "this is an array for size" );
        size = [ options.size[0], options.size[1], options.size[2] ];
    }
    else {
        console.log( "size options are not valid for " + options.type );
        return;
    }
    //CHOICES
    switch( type ) {
        case "box":
            if( typeof options.size === "number" ) {
                return new THREE.BoxGeometry( size, size, size );
            } else {
                return new THREE.BoxGeometry( size[0], size[1], size[2] );
            }
        case "cylinder" :
            return new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
        case "dodecahedron" :
            //creates dodecahedron geometry.
            return new THREE.DodecahedronGeometry( size );
        case "plane" :
            //creates plane geometry
            if ( typeof options.size === "number" ) {
                //uses a single number for sizing
                var size = options.size;
                return new THREE.PlaneGeometry( size, size, segments );
            } else {
                //uses the first value which should be width
                return new THREE.PlaneGeometry( size[0], size[1], segments );
            }
        case "sphere":
            return new THREE.SphereGeometry( size ? size : 1 );
        default:
    }
}