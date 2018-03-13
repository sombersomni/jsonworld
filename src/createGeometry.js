import * as THREE from "three";

import proceduralTree from "./utils/proceduralTree";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const segments = options.segments !== undefined ? options.segments : 8,
        type = options.type !== undefined ? options.type : "default",
        size = options.size !== undefined ? options.size: 1,
        numCheck = typeof options.size === "number";
    //CHOICES
    switch( type ) {
        case "box":
            if ( numCheck ) {
                return new THREE.BoxGeometry( size, size, size );
            } else {
                return new THREE.BoxGeometry( size[0], size[1], size[2] );
            }
            break;
        case "cylinder" :
            if ( numCheck ) {
                return new THREE.CylinderGeometry( size, size, size, segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
            } else {
                return new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, options.isOpen ? true : false, 0, Math.PI * 2 );
            }
           break; 
        case "dodecahedron" :
            //creates dodecahedron geometry
            if ( numCheck ){
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
            if ( numCheck) {
                //uses a single number for sizing
                return new THREE.PlaneGeometry( size, size, segments );
            } else {
                //uses the first value which should be width
                return new THREE.PlaneGeometry( size[0], size[1], segments );
            }
            break;
        case "sphere":
            //creates a sphere geometry
            if ( numCheck ) {
                return new THREE.SphereGeometry( size, segments, segments );
            } else {
                return new THREE.SphereGeometry( size[0], segments, segments );
            }
            break;
        case "tree":

            return proceduralTree();
        default:
            return new THREE.BoxGeometry( 25, 25, 25 );
    }
}

