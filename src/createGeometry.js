import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

//UTILS

import parametricHandlers from "./utils/parametricHandlers.js";
import proceduralTree from "./utils/proceduralTree";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const segments = options.segments !== undefined ? options.segments : defaultOptions.segments,
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
            
        case "octahedron": 
            
            return new THREE.OctahedronGeometry( size[ 0 ], 0 );
          
        case "icosahedron": 
            
            return new THREE.IcosahedronGeometry( size[ 0 ], 0 );
            
        case "lathe" :
            
            let points = [];
            
            let angleArr = this.typeChecker( options, "typeHandler", { typeHandler: defaultOptions.latheHandler } );
            
            console.log( angleArr, "angle array" );
            const angle = ( Math.PI * 2 / 180 );
                  length = 20;
            for ( var i = 0; i <= length - 1; i++ ) {
                points.push( new THREE.Vector2( ( Math.sin( i * ( angle / length ) ) * 10 + 5 ) * ( size[ 0 ] > 0 ? size[ 0 ] : 1 ) , ( ( i - ( length / 2 ) ) * 2 ) * size[ 1 ] ) );
            }
            return new THREE.LatheGeometry( points );
            
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
         
        case "sphere":
            //creates a sphere geometry
            return new THREE.SphereGeometry( size[0], segments, segments );
            
            break;

        default:
            return new THREE.BoxGeometry( size, size, size );
    }
}

