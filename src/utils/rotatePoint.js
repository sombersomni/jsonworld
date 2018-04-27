export default function ( x, y, angle ){
    
    return {
        x: x * Math.cos( angle ) - y * Math.sin( angle ),
        y: x * Math.sin( angle ) + y * Math.cos( angle )
    };
}