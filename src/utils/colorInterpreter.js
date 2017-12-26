import * as THREE from "three";
import stringToArray from "./stringToArray.js";

export default function ( color ) {
    if ( typeof color === "string" ) {
        let c = color.toLowerCase();
        if ( /^[a-z]+/.test( c ) ) {
            return new THREE.Color( c );
        } else if ( /^[#]{1}/.test( c ) ) {
            let hex = c.slice( 1 );
            let a = hex.match( /\w{2}/g );
            const arr = a.map( ( e ) => Number.parseInt( e, 16 ) / 255 );
            const r = Number( Math.round( arr[0] + 'e2') + 'e-2' );
            const g = Number( Math.round( arr[1] + 'e2') + 'e-2' );
            const b = Number( Math.round( arr[2] + 'e2') + 'e-2' );
            return new THREE.Color( r, g, b );
        } else {
            const cArr = stringToArray( c );
            return new THREE.Color( cArr[0], cArr[1], cArr[2] );
        }
    } else return new THREE.Color( color );
}