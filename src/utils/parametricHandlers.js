import * as THREE from "three";
function klein (u, v) {
                u *= Math.PI;
                v *= 2 * Math.PI;
                u = u * 2;
                var x, y, z;
                if (u < Math.PI) {
                    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
                    z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
                } else {
                    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
                    z = -8 * Math.sin(u);
                }
                y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);
                console.log( x, y, z );
                return new THREE.Vector3(x, y, z);
};
            
function radialWave(u, v) {
                if ( Math.floor( u ) % 1 === 0 ) {
                    console.log( u, v );
                    
                } 
                var r = 50;
                var x = u * r;
                var z = Math.sin( v / 2 ) * 2 * r;
                var y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 2.8;
                return new THREE.Vector3(x, y, z);
};

const parametricHandlers = {
    klein, radialWave
    
};

export default parametricHandlers;