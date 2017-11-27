

/*
//Threejs variables
var canvas = document.getElementById( "visualizer" ), camera, clock,
    controls, gui, scene,
    source, stats, renderer;

	initWorld();

	startButton.addEventListener( "click", handleClick );

//three js functions

function createBox (w, h, d, s, material) {
  //w for width, h for height, d for dimension, s for segments, material for mesh material
  var geo = new THREE.BoxGeometry( w, h, d, s, s );
  var mesh = new THREE.Mesh( geo, material );
  return mesh;
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
  
  logoDisappear( artistLogo, time );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
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

*/

