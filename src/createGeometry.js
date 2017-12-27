import * as THREE from "three";

export default function (options = {} ) {
    //goes through every geometry type plus custom ones
    const segments = options.segments !== undefined ? options.segments : 2,
        type = options.type !== undefined ? options.type : "default";
    let size;
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
        case "plane" :
            //creates plane geometry
            if ( typeof options.size === "number" ) {
                //uses a single number for sizing
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