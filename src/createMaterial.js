import * as THREE from "three";
import defaultOptions from "./json/defaults.json";

const chooseSide = ( side ) => {
    
    switch( side ) {
            
        case "front":
            return THREE.FrontSide
        case "back":
            return THREE.BackSide
        default:
            return THREE.DoubleSide
    }
}

export default function ( options = {} ) {
    
    const color = options.color !== undefined ? this.optionParser( options.color, undefined, "color" ) : new THREE.Color(),
          emissive = options.emissiveColor !== undefined ? options.emissiveColor : new THREE.Color( defaultOptions.emissiveColor ),
          emissiveIntensity = options.emissiveIntensity !== undefined ? options.emissiveIntensity : .1,
          overdraw = options.overdraw !== undefined ? options.overdraw : defaultOptions.overdraw,
          roughness = options.roughness !== undefined ? options.roughness : defaultOptions.roughness,
          shininess = options.roughness !== undefined ? options.overdraw : defaultOptions.shininess,
          side = options.side !== undefined && typeof options.side === "string"  ? options.side : "front",
          transparent = options.transparent !== undefined ? options.transparent : false,
          wireframeLinewidth = options.wireframeLinewidth !== undefined ? options.wireframeLinewidth: defaultOptions.wireframeLinewidth,
          wireframeLinecap = options.wireframeLinecap !== undefined ? options.wireframeLinecap : defaultOptions.wireframeLinecap,
          wireframeLinejoin = options.wireframeLinejoin !== undefined ? options.wireframeLinejoin : defaultOptions.wireframeLinejoin;
    
    let material = options.hasOwnProperty( "material" ) && options.material !== undefined ? options.material : "default",
        map = options.texture !== undefined && options.texture instanceof THREE.Texture ? options.texture : null;

    //set texture settings
    if ( map !== null ) {
        if ( typeof options.textureWrapping === "string" && options.textureWrapping === "repeat" ) {

            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;

        } else if ( typeof options.textureWrapping === "string" && options.textureWrapping === "mirror" ) {

            map.wrapS = THREE.MirroredRepeatWrapping;
            map.wrapT = THREE.MirroredRepeatWrapping;
        } else {
            
            map.wrapS = THREE.ClampToEdgeWrapping;
            map.wrapT = THREE.ClampToEdgeWrapping;
        }
        
        //map.repeat.set( 64, 8 );
    }
    
    
    const matOpts = {
        color,
        emissive,
        emissiveIntensity : 0.0025,
        map,
        overdraw,
        side : chooseSide( side ),
        transparent
    };
    
    if( this.options.hasOwnProperty( "debug" ) && this.options.debug ) {
        material = "wireframe";
    }
    
    switch( material ) {
        case "basic" :
            return new THREE.MeshBasicMaterial( Object.assign( {}, matOpts  ) );
        case "line" :
            return new THREE.LineBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        } );
        case "lambert": 
            return new THREE.MeshLambertMaterial( Object.assign( {}, matOpts ) );
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
            return new THREE.MeshBasicMaterial( {
                transparent: true,
                wireframe: true, 
                color,
                wireframeLinewidth,
                wireframeLinejoin,
                wireframeLinecap } );
        default:
            return new THREE.MeshBasicMaterial( { color } );

    }
}