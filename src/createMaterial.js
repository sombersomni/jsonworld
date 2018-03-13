import * as THREE from "three";

import colorInterpreter from "./utils/colorInterpreter.js";

export default function ( options = {} ) {
    const color = options.color !== undefined ? colorInterpreter( options.color ) : new THREE.Color();
    const material = options.hasOwnProperty( "material" ) && options.material !== undefined ? options.material : "default";
    const map = options.texture !== undefined ? options.texture : null;
    const emissive = options.emissiveColor !== undefined ? options.emissiveColor : new THREE.Color();
    switch( material ) {
        case "basic" :
            return new THREE.MeshBasicMaterial( {
                color,
                map,
                side: THREE.DoubleSide,
                transparent: true } );
        case "line" :
            return new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );
        case "toon" :
            return new THREE.MeshToonMaterial( {
                color,
                flatShading: true
            });
        case "normal" :
            return new THREE.MeshNormalMaterial( {
                flatShading: true,
                side: THREE.DoubleSide,
                transparent: true } );
        case "standard" :
            return new THREE.MeshStandardMaterial( {
                color,
                roughness: 0,
                metalness: 0,
                side: THREE.DoubleSide,
                transparent: true } );
        case "wireframe" :
            return new THREE.MeshNormalMaterial( {
                transparent: true,
                wireframe: true } );
        default:
            return new THREE.MeshBasicMaterial( { color } );

    }
}