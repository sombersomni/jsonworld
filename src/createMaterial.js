import * as THREE from "three";

export default function (options = {} ) {
    const color = options.color !== undefined ? new THREE.Color( options.color ) : new THREE.Color( 0xffffff );
    const material = options.material !== undefined ? options.material : "wireframe";
    const map = options.texture !== undefined ? options.texture : null;
    switch( material ) {
        case "basic" :
            return new THREE.MeshBasicMaterial( {
                color,
                map,
                side: THREE.DoubleSide,
                transparent: true } );
        case "toon" :
            return new THREE.MeshToonMaterial( {
                color,
                emissive: new THREE.Color(0x333333),
                shading: THREE.SmoothShading,
            });
        case "normal" :
            return new THREE.MeshNormalMaterial( {
                color,
                flatShading: true,
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