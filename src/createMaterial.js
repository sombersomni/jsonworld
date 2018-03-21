import * as THREE from "three";
import defaultOptions from "./json/defaults.json";

export default function ( options = {} ) {
    const color = options.color !== undefined ? this.optionParser( options.color, options, "color" ) : new THREE.Color(),
          emissive = options.emissiveColor !== undefined ? options.emissiveColor : new THREE.Color( defaultOptions.emissiveColor ),
          emissiveIntensity = options.emissiveIntensity !== undefined ? options.emissiveIntensity : .1,
          material = options.hasOwnProperty( "material" ) && options.material !== undefined ? options.material : "default",
          map = options.texture !== undefined ? options.texture : null, 
          overdraw = options.overdraw !== undefined ? options.overdraw : defaultOptions.overdraw,
          roughness = options.roughness !== undefined ? options.roughness: defaultOptions.roughness,
          shininess = options.roughness !== undefined ? options.overdraw: defaultOptions.shininess,
          side = options.side !== undefined ? options.side : THREE.DoubleSide,
          transparent = options.transparent !== undefined ? options.transparent : false;
    
    const matOpts = {
        color,
        emissive,
        emissiveIntensity : .05,
        map,
        overdraw,
        side,
        transparent
    }
    switch( material ) {
        case "basic" :
            return new THREE.MeshBasicMaterial( Object.assign( {}, matOpts  ) );
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
        case "phong":
            return new THREE.MeshPhongMaterial( Object.assign( {}, matOpts ) );
        case "standard" :
            return new THREE.MeshStandardMaterial( Object.assign( {}, matOpts, { metalness: shininess / 100, roughness : roughness / 100 } ) );
        case "wireframe" :
            return new THREE.MeshNormalMaterial( {
                transparent: true,
                wireframe: true } );
        default:
            return new THREE.MeshBasicMaterial( { color } );

    }
}