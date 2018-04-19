import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

//UTILS

import parametricHandlers from "./utils/parametricHandlers.js";
import proceduralTree from "./utils/proceduralTree.js";
import rotatePoint from "./utils/rotatePoint.js";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const extrude = options.extrude !== undefined && options.hasOwnProperty( "extrude" ) ? options.extrude : undefined,
          path = options.path !== undefined && options.hasOwnProperty( "path" ) && options.path instanceof Array ? options.path.map( vector => new THREE.Vector2( vector.x, vector.y ) ) : undefined,
          segments = options.segments !== undefined ? options.segments : defaultOptions.segments,
          thetaStart = this.convertToRadians( options.angleStart !== undefined ? options.angleStart : 0 ),
          thetaLength = this.convertToRadians( options.arcAngle !== undefined ? options.arcAngle : 360 ),
          type = options.type !== undefined ? options.type : "default",
          openEnded = options.openEnd !== undefined ? options.openEnd : false;
    
    const size =  this.typeChecker( options, "size", defaultOptions ),
        position = this.typeChecker( options, "position", defaultOptions );
    
    //CHOICES
    switch( type ) {
        case "box" :
            
            return new THREE.BoxGeometry( size[ 0 ], size[ 1 ], size[ 2 ] );
        case "circle" :
            
            return new THREE.CircleGeometry( size[ 0 ] / 2, ( options.segments !== undefined ? options.segments : 32 ), thetaStart, thetaLength );
            
        case "cone" :
            
            return new THREE.ConeGeometry( size[ 0 ], size[ 1 ], segments, segments, openEnded, thetaStart, thetaLength );
            
        case "cylinder" :
            
            return new THREE.CylinderGeometry( size[0] / 2, size[0] / 2, size[1], segments, segments, openEnded, thetaStart, thetaLength );
            
        case "dodecahedron" :
            //creates dodecahedron geometry
            return new THREE.DodecahedronGeometry( size[0] / 2 );
    
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
            
        case "heart" :

            const origin = { x : position[ 0 ], y: position[ 1 ] };
            const height = 50;
            const controlOffset = height/ 5;
            const angle = ( Math.PI / 180 ) * ( -1 * 45 );
            let heartShape = new THREE.Shape();

            const rotatedPoint = rotatePoint( 0, 1, angle );
            rotatedPoint.x *= height;
            rotatedPoint.y *= height;
            heartShape.moveTo( origin.x, origin.y );
            heartShape.quadraticCurveTo( rotatedPoint.x - controlOffset,  rotatedPoint.y / 4, rotatedPoint.x, rotatedPoint.y );
            heartShape.quadraticCurveTo( rotatedPoint.x, rotatedPoint.y + controlOffset * 2, rotatedPoint.x / 2 + origin.x, origin.y + height + controlOffset );
            heartShape.quadraticCurveTo( origin.x, origin.y + height + controlOffset, origin.x, origin.y + height );
            heartShape.quadraticCurveTo( origin.x, origin.y + height + controlOffset, ( rotatedPoint.x / 2 + origin.x ) * -1, origin.y + height + controlOffset );
            heartShape.quadraticCurveTo( rotatedPoint.x * -1, rotatedPoint.y + controlOffset * 2, rotatedPoint.x * -1, rotatedPoint.y );
            heartShape.quadraticCurveTo( ( rotatedPoint.x - controlOffset ) * -1,  rotatedPoint.y / 4, origin.x, origin.y );
            
            if ( extrude !== undefined ) {
                
                return new THREE.ExtrudeGeometry( heartShape, extrude );
            } else {
                
                return new THREE.ShapeGeometry( heartShape );
            }

            return new THREE.ShapeGeometry( heartShape );
            
        case "octahedron": 
            
            return new THREE.OctahedronGeometry( size[ 0 ], 0 );
          
        case "icosahedron": 
            
            return new THREE.IcosahedronGeometry( size[ 0 ], 0 );
            
        case "lathe" :
            
            if ( path !== undefined && path.every( vector => vector instanceof THREE.Vector2 ) ) {
                
                return new THREE.LatheGeometry( path );
                
            } else {
                
                let points = [];
            
                let angleArr = this.typeChecker( options, "typeHandler", { typeHandler: defaultOptions.latheHandler } );

                const ang = ( Math.PI / 180 ) * angleArr[0];
                      length = 20;
                for ( var i = 0; i <= length - 1; i++ ) {
                    points.push( new THREE.Vector2( ( Math.sin( i * ( ang / length ) ) * 10 + 5 ) * ( size[ 0 ] > 0 ? size[ 0 ] : 1 ) , ( ( i - ( length / 2 ) ) * 2 ) * size[ 1 ] ) );
                }
                return new THREE.LatheGeometry( points );
                
            }
            
        case "parametric" :
            let parametric;
            
            if ( options.hasOwnProperty( "typeHandler" ) && options.typeHandler !== undefined && ( typeof options.typeHandler === "string" || options.typeHandler instanceof Function ) ) {
                
                parametric = options.parametricHandler;
            } else {
                
                console.warn( "parametric type needs to be either a function or string. using defalut" );
                parametric = defaultOptions.parametricHandler;
            }

            //creates an object based on uv mapping. U is the x cordinate, v is the y axis on
                 return new THREE.ParametricGeometry( ( u, v ) => parametric instanceof Function ? parametric( u, v, size[ 0 ] ) : parametricHandlers[ parametric ]( u, v, size[ 0 ] ), 8, 8 );
            
        case "plane" :
            //creates plane geometry
            return new THREE.PlaneGeometry( size[0], size[1], segments, segments );
         
        case "shape" :
            

            
        case "sphere":
            //creates a sphere geometry
            return new THREE.SphereGeometry( size[0], segments, segments );
            
            break;

        default:
            return new THREE.BoxGeometry( size, size, size );
    }
}

