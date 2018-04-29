// server
var compression = require( "compression" ),
	express = require( "express" ),
	path = require( "path" ),
    request = require( "request" );
var app = express(),
	port = 3020;

var client_id = 'c18142940c3248d18ea25bf28db22de5'; // Your client id
var client_secret = '7356696f88eb41acad30cf4ef1e6c929'; // Your secret

//your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};


const promise = new Promise( ( resolve, reject ) => {
    request.post( authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        // use the access token to access the Spotify Web API
        var token = body.access_token;
        var options = {
          url: 'https://api.spotify.com/v1/artists/3Sz7ZnJQBIHsXLUSo0OQtM/albums',
          headers: {
            'Authorization': 'Bearer ' + token
          },
          json: true
        };
        request.get(options, function(error, response, body) {
            
            resolve( body );
            
            if ( error ) {
                reject( error );
            }
        });
      }
    });
})


app.use( compression() );
app.use( express.static( path.join( __dirname, "../public" ) ) );
console.log(__dirname);

app.get("/albums", function( req, res ) {
    promise.then( data => {
        res.json( data );
    });
} );
app.get("/", function ( req, res ) {
	    res.render( "public" );
} );

app.listen( port, function () {
	console.log( "server is running on port" + port );
} );