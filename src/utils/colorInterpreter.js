import * as THREE from "three";
import stringToArray from "./stringToArray.js";

export default function (color ) {
    if ( typeof color === "string" ) {
        const pattern = /^[a-z]+/;
        console.log( pattern.test( color.toLowerCase() ) );
        if ( pattern.test( color.toLowerCase() ) ) {
            return new THREE.Color( color );
        } else {
            const cArr = stringToArray( color );
            return new THREE.Color( cArr[0], cArr[1], cArr[2] );
        }
    }
}