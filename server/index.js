// server
var compression = require( "compression" ),
	express = require( "express" ),
	path = require( "path" );
var app = express(),
	port = 3000;

app.use( compression() );
app.use( express.static( path.join( __dirname, "../public" ) ) );
console.log(__dirname);
app.get("/", function ( req, res ) {
	res.render( "public" );
} );

app.listen( port, function () {
	console.log( "server is running on port" + port );
} );