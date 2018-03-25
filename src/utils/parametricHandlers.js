import * as THREE from "three";

function klein (u, v, size = 0 ) {
    
    u *= Math.PI;
    v *= 2 * Math.PI;
    u = u * 2;
    
    let x, y, z;
    if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
        z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
    } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
    }
    y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);
    
    return new THREE.Vector3( x * size , y * size, z * size );
    
};
            
function radialWave(u, v, size = 0 ) {
    
    const r = 50;
    const x = u * r;
    const z = ( Math.sin( v / 2 ) * 2 * r );
    const y = ( ( Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI) ) * 2.8 );
    return new THREE.Vector3( x * size, y * size, z * size );
};

const parametricHandlers = {
    klein, radialWave
    
};

export default parametricHandlers;