import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

import proceduralTree from "./utils/proceduralTree";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const segments = options.segments !== undefined ? options.segments : defaultOptions.segments,
        type = options.type !== undefined ? options.type : "default";
    let size = options.size !== undefined ? options.size: defaultOptions.size,
        position = options.position !== undefined ? options.position: defaultOptions.objectPosition;
    
    
    //console.log( size, position );
    
    if ( typeof size === "string" ) {
        console.log( "is working" );
        size = this.optionParser( size, options, "size" );
        console.log( size );
    }
    
    if ( typeof position === "string" ) {
        position = this.optionParser( position, options, "position" );
        console.log( position );
    }
    
    //bool checks
    const arrCheck = size instanceof Array;
    
    //CHOICES
    switch( type ) {
        case "box":
            console.log( !arrCheck );
            if ( !arrCheck ) {
                return new THREE.BoxGeometry( size, size, size );
            } else {
                return new THREE.BoxGeometry( size[0], size[1], size[2] );
            }
            break;
        case "cylinder" :
            if ( !arrCheck ) {
                return new THREE.CylinderGeometry( size, size, size, segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
            } else {
                return new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
            }
           break; 
        case "dodecahedron" :
            //creates dodecahedron geometry
            if ( !arrCheck ){
                return new THREE.DodecahedronGeometry( size );  
            } else {
                return new THREE.DodecahedronGeometry( size[0] );
            }
           break; 
        case "font" :
            let shapes = options.font.generateShapes( options.title , 100, 4 );
            let shapeGeo = new THREE.ShapeGeometry( shapes );
            shapeGeo.computeBoundingBox();
            const xMid = - 0.5 * ( shapeGeo.boundingBox.max.x - shapeGeo.boundingBox.min.x );
            shapeGeo.translate( xMid, 0, 0 );
            if ( options.material !== undefined && options.material === "line" ) {
                let holeShapes = [];
                for ( let i = 0; i < shapes.length; i ++ ) {
                    let shape = shapes[ i ];
                    if ( shape.holes && shape.holes.length > 0 ) {
                        for ( let j = 0; j < shape.holes.length; j ++ ) {
                            let hole = shape.holes[ j ];
                            holeShapes.push( hole );
                        }
                    }
                }
                shapes.push.apply( shapes, holeShapes );
                let geometries = [];
                for ( let i = 0; i < shapes.length; i ++ ) {
                    let shape = shapes[ i ];
                    let points = shape.getPoints();
                    let geometry = new THREE.BufferGeometry().setFromPoints( points );
                    geometries.push( geometry );
                }

                return geometries;

            } else {
                let geometry = new THREE.BufferGeometry();
                return geometry.fromGeometry( shapeGeo );
            }
            break;
        case "plane" :
            //creates plane geometry
            if ( !arrheck) {
                //uses a single number for sizing
                return new THREE.PlaneGeometry( size, size, segments, segments);
            } else {
                //uses the first value which should be width
                return new THREE.PlaneGeometry( size[0], size[1], segments, segments );
            }
            break;
        case "icosahedron": 
            if( !arrCheck ) {
                return new THREE.IcosahedronGeometry( size, 0 );
            } else {
                
                return new THREE.IcosahedronGeometry( size[0], 0 );
            }
        case "sphere":
            //creates a sphere geometry
            if ( !arrCheck ) {
                return new THREE.SphereGeometry( size, segments, segments );
            } else {
                return new THREE.SphereGeometry( size[0], segments, segments );
            }
            break;
        case "tree":

            return proceduralTree();
        default:
            return new THREE.BoxGeometry( size, size, size );
    }
}

