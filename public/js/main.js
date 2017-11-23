
var config = {
	tracked_songs: [ "tracked_songs/tundra_drums.mp3", "tracked_songs/tundra_synth.mp3" ] //name your paths uniquely for a better user experience
};

function seperateSoundName ( path ) {

	var pattern = /\w+(?!\/){1}(?=\.mp3|\.wav|\.ogg){1}/;
	var matchedString = path.match(pattern);
	var remappedArr = matchedString[0].split( "_" ).map( function ( each ) {
		return each.toLowerCase();
	} );
	var newString = remappedArr.join( " " );
	return newString;
}

function getAudioContext ( length ) {

	var arr = [];
	for ( var x = 0; x <= length; x++ ) {
		arr.push( new AudioContext() );
	}
	return arr;
}

function audioFetcher ( arr, n, pack, ctx, resolve, reject ) {

	var package = pack;
	var start = n;
	if( typeof arr === "object" && arr instanceof Array && ( arr.length - 1 ) >= n ){
		fetch( arr[n] ).then(function(response) {
			if( response.ok ){

				return response.arrayBuffer();
			} else {

				reject( { status: response.status, message: response.statusText } );
			}
		}).then(function(buffer) {
			var soundName = seperateSoundName( arr[n] );
			console.log( "downloading " + soundName );
			ctx[n].decodeAudioData(buffer, function(decodedData) {
			    console.log( soundName + " complete" );
			    var source = ctx[n].createBufferSource();
			    source.buffer = decodedData;
			    var gain = ctx[n].createGain();
			    source.connect( gain );
			    gain.connect( ctx[n].destination );
			    package.push( source );
			    n += 1;
			    audioFetcher( arr, n, package, ctx, resolve, reject );
			});
		});
	} else {

		console.log("fetch is done");
		resolve( package );
	}
}
var generateContext = new Promise ( function ( resolve, reject ) {
	try {

		var contextPack = getAudioContext( config.tracked_songs.length );
		if (contextPack instanceof Array && contextPack !== 0 ) {
			resolve( contextPack );
		} else {
			throw new Error( "this array is not valid" );
		}
	} catch( err ) {
		reject( err.message );
	}
} );

generateContext.then( function ( audioCtx ) {
	return new Promise( function( resolve, reject ) {
		audioFetcher( config.tracked_songs, 0, [], audioCtx, resolve, reject);
	} );
} ).then( function ( arrControlArr ) {
	console.log( arrControlArr );
	/* control each seperate sound here 
		everything is perfectly in sync

		arrControlArr[0].start();
		arrControlArr[1].start();
	*/
} ).catch( function ( err ) {
	console.log( err );
} );

