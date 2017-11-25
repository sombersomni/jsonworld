
var config = {
	"bpm": 120,
	"genres": [ "progressive house", "house", "tech house" ],
	"sounds": [
		{
			"type": "drums",
			"url_path": "tracked_songs/tundra_drums.mp3",//name your paths uniquely for a better user experience
			"obj": "lego_v1",
		}, 
		{
			"name": "tundra synths",
			"type": "synth",
			"url_path": "tracked_songs/tundra_synth.mp3",
			"obj": "lego_v2",
		}
	],
};

//html DOM elements
var startButton = document.querySelector( "#start" ),
	progressEl = document.querySelector( "#progress" );


//Threejs variables
var audioContext, audioController, analyzer, canvas = document.getElementById( "visualizer" ), camera, clock,
    controls, fftSize = 2048, gui, scene,
    source, stats, renderer;

	initWorld();
	setupGUI();
	createStats();

	startButton.addEventListener( "click", handleClick );

//three js functions

function setupGUI () {
  gui = new dat.GUI();
  gui.add( camera.rotation, "x", 1, 10);
}

function createBox (w, h, d, s, material) {
  //w for width, h for height, d for dimension, s for segments, material for mesh material
  var geo = new THREE.BoxGeometry( w, h, d, s, s );
  var mesh = new THREE.Mesh( geo, material );
  return mesh;
}

function createStats() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.right = '0px';
  document.body.appendChild( stats.domElement );
}

function logoDisappear ( obj, time ) {
  //artistLogo animation
  if ( obj.material.opacity === 0 ) {
  	scene.remove( obj );
  } else {
  	obj.material.opacity -= 0.005;
 	obj.position.z += .05 * time;
  }

}
function draw () {
  //Threejs animations
  requestAnimationFrame( draw );
  var time = clock.getElapsedTime();
  var cube = scene.getObjectByName( "cube" );
  var artistLogo = scene.getObjectByName( "artist_logo" );
  //time data
  audioController[0].analyser.getByteTimeDomainData( audioController[0].dataArray );
  if ( time < 5 ) {
	console.log( audioController[0].dataArray );
  }

  logoDisappear( artistLogo, time );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  stats.update();
  renderer.render( scene, camera );
}

function initWorld () {
	  clock = new THREE.Clock();
	  var width = window.innerWidth,
	      height = window.innerHeight;
	  scene = new THREE.Scene();
	  scene.background = new THREE.Color( 0xff0022 );
	  //scene.fog = new THREE.FogExp2( 0x220000, .02 );
	  camera = new THREE.PerspectiveCamera( 100, width/height, 1, 1000 );
	  camera.position.z = 100;
	  renderer = new THREE.WebGLRenderer( { canvas: canvas } );
	  renderer.setPixelRatio( window.devicePixelRatio );
	  renderer.setSize( width, height );
	  
	  //logo
	  var logoTexture = new THREE.TextureLoader().load( "imgs/artist_logo.png", function ( texture ) {
	    return texture;
	  } );
	  var planeGeo = new THREE.PlaneGeometry( 100, 100, 4, 4 );
	  var legoMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true });
	  var logoMaterial = new THREE.MeshBasicMaterial( { transparent: true, map: logoTexture } );
	  var logo = new THREE.Mesh( planeGeo, logoMaterial );
	  logo.name = "artist_logo";
	  //test object
	  var cube = createBox( 10, 10, 10, 1, legoMaterial );
	  cube.name = "cube";
	  cube.position.z = 30;
	  //scene
	  scene.add( cube );
	  scene.add( logo );
	  //renderer
	  camera.lookAt( logo.position );
	  renderer.render( scene, camera );
}

//audio functions

function handleClick () {
	initSounds( this );
}

function initSounds ( startButton ) {

	startButton.removeEventListener( "click", handleClick );
	startButton.setAttribute( "class", "hide" );
	var generateContext = new Promise ( function ( resolve, reject ) {
		try {

			var contextPack = getAudioContext( config.sounds.length );
			if (contextPack instanceof Array && contextPack !== 0 ) {
				resolve( contextPack );
			} else {
				throw new Error( "this is not a valid array" );
			}
		} catch( err ) {
			reject( err.message );
		}
	} );

	generateContext.then( function ( audioCtx ) {
		return new Promise( function( resolve, reject ) {
			//grabs a 2D array of sound name and sound url path pairs
			var arr = getSoundURLName( config );
			//passes the resolve and reject to keep things operating properly
			//takes an 2d array, index to start from, empty array for starting, and an array of audio contexts
			audioFetcher( arr, 0, [], audioCtx, resolve, reject);
		} );
	} ).then( function ( audioControlArr ) {
		/* control each seperate sound here 
			everything is perfectly in sync
		*/
		audioController = audioControlArr;
		audioController[0].source.start();
		audioController[1].source.start();
		draw();
		
	} ).catch( function ( err ) {
		console.log( err );
	} );

}
//takes the url path and makes a label name based on filename
function seperateSoundName ( path ) {

	var pattern = /\w+(?!\/){1}(?=\.mp3|\.wav|\.ogg){1}/;
	var matchedString = path.match(pattern);
	var remappedArr = matchedString[0].split( "_" ).map( function ( each ) {
		return each.toLowerCase();
	} );
	var newString = remappedArr.join( " " );
	return newString;
}

//grabs each audio context and packs it into an array
function getAudioContext ( length ) {

	var arr = [];
	for ( var x = 0; x < length; x++ ) {
		arr.push( new AudioContext() );
	}
	return arr;
}

//packs the url and name from config json into the 2D array
function getSoundURLName ( config ) {
	var packageArr = [];
	if( config.hasOwnProperty( "sounds" ) ) {
		if( config.sounds instanceof Array && config.sounds.length > 0 ) {
			for ( var x = 0; x < config.sounds.length; x++ ){
				var newObj = config.sounds[x];
				// asign url path for index 0 and sound name for index 1
				packageArr.push( [ newObj.url_path, newObj.name ]);
			}
		}
	} else {
		console.log( "sounds doesn't exist. You need to create the array of sounds you will offer user" );
	}

	return packageArr;
}

//main fetch api used to download audio in order
function audioFetcher ( arr, n, pack, ctx, resolve, reject ) {

	var package = pack,
	start = n,
	urlIndex = 0,
	nameIndex = 1;

	if( typeof arr === "object" && arr instanceof Array && ( arr.length - 1 ) >= n ){
		fetch( arr[n][urlIndex] ).then(function(response) {
			if( response.ok ){

				return response.arrayBuffer();
			} else {
				//stops the promise from even continuing
				reject( { status: response.status, message: response.statusText } );
			}
		}).then(function(buffer) {

			// lets save this buffer informaton for later in localStorage
			console.log( buffer );
			var soundName = arr[n][nameIndex] !== undefined ? arr[n][nameIndex] : seperateSoundName( arr[n][urlIndex] );
			progressEl.innerHTML = "downloading " + soundName;
			ctx[n].decodeAudioData(buffer, function(decodedData) {
				progressEl.innerHTML = soundName + " complete";
				//setup sound processing
			    var analyser = ctx[n].createAnalyser(),
			    	gain = ctx[n].createGain(),
			    	source = ctx[n].createBufferSource();
				analyser.fftSize = fftSize;
				var bufferLength = analyser.fftSize;
				var dataArray = new Uint8Array(bufferLength);
			    source.buffer = decodedData;
			    source.connect( gain );
			    gain.connect( ctx[n].destination );
			    //making an object for each audio resource
			    var obj = {
			    	name: soundName,
			    	audioCtx: ctx[n],
			    	gainController: gain,
			    	analyser: analyser,
			    	dataArray: dataArray,
			    	source: source
			    };

			    package.push( obj );
			    n += 1;
			    audioFetcher( arr, n, package, ctx, resolve, reject );
			});
		});
	} else {

		progressEl.innerHTML = "sounds starting...";
		resolve( package );
	}
}

