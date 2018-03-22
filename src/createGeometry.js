import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

import proceduralTree from "./utils/proceduralTree";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const segments = options.segments !== undefined ? options.segments : defaultOptions.segments,
          thetaStart = this.convertToRadians( options.angleStart !== undefined ? options.angleStart : 0 ),
          thetaLength = this.convertToRadians( options.arcAngle !== undefined ? options.arcAngle : 360 ),
          type = options.type !== undefined ? options.type : "default",
          openEnded = options.openEnd !== undefined ? options.openEnd : false;
    
    let size = options.size !== undefined ? options.size: defaultOptions.size,
        position = options.position !== undefined ? options.position: defaultOptions.objectPosition;
    
    
    if ( typeof size === "string" ) {
        size = this.optionParser( size );;
    }
    
    if ( typeof position === "string" ) {
        position = this.optionParser( position );
    }
    
    //bool checks
    const arrCheck = size instanceof Array;
    
    //CHOICES
    switch( type ) {
        case "box" :
            
            return !arrCheck ? new THREE.BoxGeometry( size, size, size ) : new THREE.BoxGeometry( size[ 0 ], size[ 1 ], size[ 2 ] );
        case "circle" :
            
            return !arrCheck ? new THREE.CircleGeometry( size / 2, ( options.segments !== undefined ? options.segments : 32 ), thetaStart, thetaLength ) : new THREE.CircleGeometry( size[ 0 ] / 2, ( options.segments !== undefined ? options.segments : 32 ), thetaStart, thetaLength );
            
        case "cone" :
            
            return !arrCheck ? new THREE.ConeGeometry( size, size, segments, segments, openEnded, thetaStart, thetaLength ) : new THREE.ConeGeometry( size[ 0 ], size[ 1 ], segments, segments, openEnded, thetaStart, thetaLength );
            
        case "cylinder" :
            
            return !arrCheck ? new THREE.CylinderGeometry( size / 2, size / 2, size, segments, segments, openEnded, thetaStart, thetaLength ) : new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, openEnded, thetaStart, thetaLength );
            
        case "dodecahedron" :
            //creates dodecahedron geometry
            return !arrCheck ? new THREE.DodecahedronGeometry( size / 2 ) : new THREE.DodecahedronGeometry( size[0] / 2 );
    
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
            if ( !arrCheck) {
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

