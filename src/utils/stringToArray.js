export default function ( str ) {
    str += " "; //adds a space for the last number to register in pattern
    const pattern = /[0-9]{1}(?=\s)/g;
    const match = str.match( pattern );
    return match;
}