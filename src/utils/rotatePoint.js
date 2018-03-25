export default function ( x, y, angle ){
    
    let rotatedPoint = {};
    rotatedPoint.x = x * Math.cos( angle ) - y * Math.sin( angle );
    rotatedPoint.y = x * Math.sin( angle ) + y * Math.cos( angle );
    return rotatedPoint;
}