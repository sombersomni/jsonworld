//hash id

export default function ( meshID, id ) {
    
    return Math.ceil( id / meshID * 1000 );
}