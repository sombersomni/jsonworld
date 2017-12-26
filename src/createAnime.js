import anime from "animejs";
import * as THREE from "three";

export default function (mesh, type ) {
    const t = type !== undefined ? type : "spin_basic",
        speed = 10;
    switch( t ) {
        case "atom":
            return function ( time ) {
                //creates a simple animation that looks like an atom
                let mesh = this;
                const count = 2,
                    radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2;
                if ( mesh.children.length >= count ) {

                } else {
                    for ( let i = 0; i <= count - 1; i++ ) {
                        let g = new THREE.Geometry();
                        g.vertices = mesh.geometry.vertices;
                        //console.log( g );
                        // console.log( mesh );
                        /*
                        var clone =
                        clone.position.set( radius * 2, 0, 0 );
                        clone.scale.set( .25, .25, .25 );
                        mesh.add( clone );
                        */
                        //console.log( mesh );
                    }
                }
            }
        case "erratic" :
            return function ( time ) {
                let mesh = this;
                const growthRate = 1.25,
                    length = mesh.geometry.vertices.length,
                    radius = mesh.geometry.parameters.radius || mesh.geometry.parameters.width / 2,
                    rand = Math.round( Math.random() * length - 1 );
                //every 5 seconds execute
                if( Math.round( time ) % 1 === 0 ) {
                    mesh.geometry.currentVectorIndex = rand;
                    mesh.geometry.currentVector = mesh.geometry.vertices[ mesh.geometry.currentVectorIndex ];
                }
                if( mesh.geometry.currentVectorIndex && mesh.geometry.currentVector ) {
                    const cIndex = mesh.geometry.currentVectorIndex;
                    const x = mesh.geometry.currentVector.x,
                        y = mesh.geometry.currentVector.y,
                        z = mesh.geometry.currentVector.z;
                    if( Math.abs( x ) < radius * 2 && Math.abs( y ) < radius * 2 && Math.abs( z ) < radius * 2 ) {
                        mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x * growthRate, y * growthRate, z * growthRate ), Math.random() );
                    } else {
                        mesh.geometry.vertices[ cIndex ].lerp( new THREE.Vector3( x / growthRate, y / growthRate, z / growthRate ), Math.random() );
                    }
                }
                mesh.rotation.y += .01;
                mesh.geometry.verticesNeedUpdate = true;
            }
        case "fade" :
            return anime( {
                targets: mesh.material,
                opacity: 0,
                duration: 1000 / speed,
                loop: 1
            } );
        case "shapeshift" :
            return function ( time ) {
                let mesh = this;
                for ( let i = 0; i < mesh.geometry.vertices.length; i++ ) {
                    mesh.geometry.vertices[i].y += Math.sin( time + i ) * 1/20;
                    mesh.geometry.vertices[i].x += Math.cos( time + i ) * 1/20;
                    mesh.geometry.vertices[i].z += Math.sin( time + i ) * 1/20;
                }
                mesh.geometry.verticesNeedUpdate = true;
            }
        case "spin_basic" :
            return anime( {
                targets: mesh.rotation,
                y: Math.PI * 2,
                elasticity: 100,
                duration: 5000 / speed,
                loop: true
            } );
        case "spin_random" :
            return anime( {
                targets: mesh.rotation,
                y: Math.PI * 2,
                elasticity: 100 / speed,
                duration: 5000 / speed,
                loop: 1,
                complete: function( anim ) {
                    const axis = "xyz";
                    const random = Math.round( Math.random() * 3 - 1 );
                    anim.animations[0].property = axis.charAt( random );
                    anim.restart();
                }
            } );
        case "zoom_beat" :
            return anime( {
                targets: mesh.position,
                z: mesh.position.z - 20,
                elasticity: 100 / speed,
                direction: "alternate",
                duration: 1000 / speed,
                loop: true
            } );
        case "zoom_normal" :
            return function ( time ) {
                let mesh = this;
                const distance = 20;
                if ( mesh.prevPosition === undefined ) {
                    mesh.prevPosition = {};
                    mesh.prevPosition.z = mesh.position.z;
                }
                mesh.position.z = ( distance * Math.sin( time * ( speed / 10 ) ) ) + mesh.prevPosition.z;
            }
        default:
            return;
    }
}