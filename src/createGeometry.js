import * as THREE from "three";

import defaultOptions from "./json/defaults.json";

//UTILS

import parametricHandlers from "./utils/parametricHandlers.js";
import proceduralTree from "./utils/proceduralTree.js";
import rotatePoint from "./utils/rotatePoint.js";

function determineShape( path, i = 0, arr = [], shape = new THREE.Shape(), prev = new THREE.Vector2( 0, 0 ) ) {
    if( i <= path.length - 1 ) {
        let point = path[i];
    
        const cpOne = point.cp !== undefined && point.cp instanceof Array && point.cp.length === 1 ? point.cp[0] : prev,
              cpTwo = point.cp !== undefined && point.cp instanceof Array && point.cp.length === 2 ? point.cp[1] : point;

        if ( i !== 0 ) {
            switch( point.type ) {

            case "bezier" :
                shape.bezierCurveTo( cpOne.x, cpOne.y, cpTwo.x, cpTwo.y, point.x, point.y );
                i++;
                return determineShape( path, i, arr, shape, point );
                break;
            case "quad" :
                shape.quadraticCurveTo( cpOne.x, cpOne.y, point.x, point.y );
                i++;
                return determineShape( path, i, arr, shape, point );
            case "spline" :
                arr.push( new THREE.Vector2( point.x, point.y ) );
                if ( path[ i + 1 ] !== undefined && path[ i + 1 ].type !== undefined && path[ i + 1 ].type === "spline" ) {
                    i++;
                    return determineShape( path, i, arr, shape, prev );
                } else { 
                    shape.splineThru( arr );
                    i++;
                    return determineShape( path, i, [], shape, prev );
                }


            default:
                shape.lineTo( point.x, point.y );
                i++;
                return determineShape( path, i, arr, shape, point );
           }
        } else {
            
            shape.moveTo( point.x, point.y );
            i++;
            return determineShape( path, i, arr, shape, point );
        }
        
    } else {
        
        console.log( shape, "before function returns" );
        return shape;
    }
}
function chooseCurve( path, i = 0, arr = [], curvePath = new THREE.CurvePath() ) {
    
    let curve, cp, cpTwo;
    
    if ( i <= path.length - 1 ) {
        
        const current = path[ i ];
        const next = path[ i + 1 ] !== undefined && i === 0 ? path[ i + 1 ] : { x: 0, y: 0, z: 0 };
        
        const xOffset = 0,
              yOffset = 0,
              zOffset = 0;
        
        const type = current.type !== undefined ? current.type : "default";
        switch( type ) {
                
            case "quad" :
                
                if ( current.cp instanceof Array ) {
                    
                    cp = current.cp[ 0 ];
                    
                } else if ( current.cp instanceof Object ) {
                    
                    cp = current.cp;
                    
                } else {
                    
                    cp = { x: next.x + xOffset,
                           y: next.y + yOffset,
                           z: next.z + zOffset
                         };
                }
                
                console.log( cp, current, next , "filed out");
                curve = new THREE.QuadraticBezierCurve3( new THREE.Vector3( current.x, current.y, current.z ), new THREE.Vector3( next.x, next.y, next.z ), new THREE.Vector3( cp.x, cp.y, cp.z )  );

                curvePath.add( curve );
                i++;
                
                console.log( curvePath, curve );
                
                return chooseCurve( path, i, [], curvePath );
                
            case "spline" :

                arr.push( new THREE.Vector3( current.x, current.y, current.z ) );
                if ( next.type === "spline" ) {
                    i++;
                    
                    return chooseCurve( path, i, arr, curvePath );
                } else {
                    curvePath.add( new THREE.CatmullRomCurve3( arr ) );
                    
                    i++;
                    return chooseCurve( path, i, [], curvePath );
                }
                break;
                
            case "bezier" :
                
                if ( current.cp instanceof Array ) {
                    const cpOne = current.cp[0],
                          cpTwo = current.cp[1];
                    
                    curve = new THREE.CubicBezierCurve3( new THREE.Vector3( current.x, current.y, current.z ), new THREE.Vector3( next.x, next.y, next.z ), new THREE.Vector3( cpOne.x, cpOne.y, cpOne.z ), new THREE.Vector3( cpTwo.x, cpTwo.y, cpTwo.z )  );
                    
                } else {
                    curve = new THREE.CubicBezierCurve3( new THREE.Vector3( current.x, current.y, current.z ), new THREE.Vector3( next.x, next.y, next.z ), new THREE.Vector3( current.x, current.y, current.z ), new THREE.Vector3( next.x, next.y, next.z )  );
                }
                
                
                curvePath.add( curve );
                
                i++;
                return chooseCurve( path, i, [], curvePath );

            default :
                
                curve = new THREE.LineCurve3( new THREE.Vector3( current.x, current.y, current.z ) );
                
                curvePath.add( curve );
                i++;
                
                return chooseCurve( path, i, [], curvePath );
                
        }
        
    } else {
        
        /*
        if ( curvePath.curves.length <= 1 ) {
            //if there is only one curve point, curvePath will use the world orgin
            curvePath.add( new THREE.LineCurve3( 0, 0, 0 ) );
        }
        */
        return curvePath;
    }
    
}

function createPath ( type = "default", path ) {
    
    switch( type ) {
        
        case "tube" : 
                
            const curve = chooseCurve( path );
            return curve;
        case "lathe" : 
            //returns a new array of THREE Vectors
            return path instanceof Array ? path.map( vector => new THREE.Vector2( vector.x, vector.y ) ) : new THREE.Vector2( path.x, path.y );
        default :
            return path;
    }
    
}

function changeSegmentSize ( geo, options ) {
    
    console.log( geo, "before switch in changeSegmentSize function" );
    switch( geo.type ) {
            
        case "BoxGeometry" :
            
            for ( let n = 0; n <= geo.vertices.length - 1; n++ ) {
                
                let vert = geo.vertices[n];
                console.log( vert.y, "x before change" );
                if ( vert.y >= geo.parameters.height / 2 ) {
                    
                    vert.x *= options.top / 100;
                    vert.z *= options.top / 100;
                }
                
                if ( vert.y <= -1 * geo.parameters.height / 2 ) {
                    
                    vert.x *= options.bottom/ 100;
                    vert.z *= options.bottom / 100;
                }
                
            }
            
            return geo;
            
        case "TubeGeometry" :
       
            for( let x = 0; x <= geo.vertices.length - 1; x++ ) {

                if ( x <= options.segments || x >= geo.vertices.length - options.segments - 1 ) {
                   geo.vertices[x].x *= 2;
                   geo.vertices[x].z *= 2; 
                }
               
            }
            
            
            return geo;
            
            
    }
}
export default function ( options = {} ) {
    let geometry;
    //goes through every geometry type plus custom ones
    const extrude = options.extrude !== undefined && options.hasOwnProperty( "extrude" ) ? options.extrude : undefined,
          segments = options.segments !== undefined ? options.segments : defaultOptions.segments,
          thetaStart = this.convertToRadians( options.angleStart !== undefined ? options.angleStart : 0 ),
          thetaLength = this.convertToRadians( options.arcAngle !== undefined ? options.arcAngle : 360 ),
          type = options.type !== undefined ? options.type : "default",
          top = options.top !== undefined ? options.top : 100,
          bottom = options.bottom !== undefined ? options.bottom : 100,
          path = options.path !== undefined && options.hasOwnProperty( "path" ) && options.path instanceof Array ? createPath( type, options.path ) : undefined,
          openEnded = options.openEnd !== undefined ? options.openEnd : false;
    
    const size =  this.typeChecker( options, "size", defaultOptions ),
        position = this.typeChecker( options, "position", defaultOptions );
    
    //CHOICES
    switch( type ) {
        case "box" :
            
            geometry = new THREE.BoxGeometry( size[ 0 ], size[ 1 ], size[ 2 ] );
            
           if ( top !== 100 || bottom !== 100 || ( options.verticalSegments !== undefined && typeof options.verticalSegments === "function" ) || ( options.horizontalSegments !== undefined && typeof options.horizontalSegments === "function" ) ) {
               return changeSegmentSize( geometry, Object.assign( {}, options, { top, bottom } ) );
           } else {
               return geometry;
           }
        case "circle" :
            
            return new THREE.CircleGeometry( size[ 0 ] / 2, ( options.segments !== undefined ? options.segments : 32 ), thetaStart, thetaLength );
            
        case "cone" :
            
            return new THREE.ConeGeometry( size[ 0 ], size[ 1 ], segments, segments, openEnded, thetaStart, thetaLength );
            
        case "tube" :
       
            if ( path !== undefined ) {
                
                geometry = new THREE.TubeGeometry( path, size[ 0 ] / 2, segments / 4, segments, openEnded );
                
            } else if ( options.hasOwnProperty( "typeHandler" ) && options.typeHandler !== undefined ) {

                class CustomCurve extends THREE.Curve {
                    
                    constructor() {
                        super();
                    }
                    
                    getPoint( t ) {
                        const points = options.typeHandler( t );
                        return new THREE.Vector3( points.x, points.y, points.z );
                    }
                }
                
                const curve = new CustomCurve();
                
                geometry = new THREE.TubeGeometry( curve, size[ 0 ] / 2, segments / 4, segments, openEnded );
                       
            } else {
                
                const newPath = createPath( "tube", [ { x: 0, y: size[ 1 ], z: 0 } ] );
                geometry = new THREE.TubeGeometry( newPath, size[ 0 ] / 2, segments / 4, segments, openEnded );
            }
            
            if ( top !== 100 || bottom !== 100 || ( options.verticalSegments !== undefined && typeof options.verticalSegments === "function" ) || ( options.horizontalSegments !== undefined && typeof options.horizontalSegments === "function" ) ) {
               return changeSegmentSize( geometry, Object.assign( {}, options, { segments, top, bottom } ) );
           } else {
               console.log( geometry );
               return geometry;
           }
            
        case "cylinder" :
            
            geometry = new THREE.CylinderGeometry( ( size[0] / 2 ) * ( top / 100 ), ( size[0] / 2 ) * ( bottom / 100 ), size[1], segments, segments, openEnded, thetaStart, thetaLength );
            
            if ( ( options.verticalSegments !== undefined && typeof options.verticalSegments === "function" ) || ( options.horizontalSegments !== undefined && typeof options.horizontalSegments === "function" ) ) {
               return changeSegmentSize( geometry, Object.assign( {}, options, { top, bottom } ) );
           } else {
               return geometry;
           }
            
        case "circle" :
            
            geometry = new THREE.CircleGeometry( size[ 0 ] / 2, segments, thetaStart, thetaLength );
            
            return geometry;
            
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

                const ang = ( Math.PI / 180 ) * angleArr[0],
                      length = size[ 1 ];
                
                for ( var i = 0; i <= length - 1; i++ ) {
                    points.push( new THREE.Vector2( ( Math.sin( i * ang ) ) * ( size[ 0 ] > 0 ? size[ 0 ] : 1 ) , ( ( i - ( length / 2 ) ) * 2 ) * size[ 1 ] ) );
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
            
            let customShape = determineShape( path );
            console.log( customShape, "shape created" );
            if ( extrude !== undefined ) {
                
                return new THREE.ExtrudeGeometry( customShape, extrude );
            } else {
                
                return new THREE.ShapeGeometry( customShape );
            }
            break;
            
        case "sphere":
            //creates a sphere geometry
            return new THREE.SphereGeometry( size[0] / 2, segments, segments );

        default:
            return new THREE.BoxGeometry( size, size, size );
    }
}

