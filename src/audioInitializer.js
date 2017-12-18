function audioFetcher ( sound ) {
        //a promise wrapper that takes care of fetching audio data
        return new Promise( ( res, rej ) => {
            const name = sound.name !== undefined ? sound.name : seperateSoundName( sound.url );
            let id;
            if ( sound.id !== undefined ) {
                id = sound.id;
            } else {
                rej( { message: "objects can't map to sounds without id. Check your configuration file" } );
            }
            fetch( sound.url ).then( response => {
                if( response.ok ){
                    //if response works, returns a array of sound information
                    return response.arrayBuffer();
                } else {
                    //stops the promise from even continuing
                    rej( { message: name + " failed to download" } );
                }
            } ).then( buffer => {
                //create the audio context here and start decoding buffer
                const ctx = new AudioContext();
                ctx.decodeAudioData( buffer, data => {
                    // assign the controller with each attribute
                    let audio = createController( ctx, id, name, sound.sampleSize, data );
                    res( audio );
                } );
            } );
        } );
}
function createController ( ctx, id, name, fftSize, data ) {
        // packs a controller object with it's specific data
        const analyser = ctx.createAnalyser();
        const gain = ctx.createGain();
        const source = ctx.createBufferSource();
        source.buffer = data;
        analyser.fftSize = fftSize;
        let timeData = new Uint8Array( analyser.fftSize );
        let frequencyData = new Uint8Array( analyser.frequencyBinCount )
        source.connect( gain );
        gain.connect( ctx.destination );

        let audioController = {
            analyser,
            ctx,
            frequencyData,
            gain,
            id,
            name,
            source,
            timeData,
        }

        return audioController;
}
function initializeAudio ( options = {} ) {
        //loops through promises and waits til all sounds are loaded
        var sounds = options !== undefined ? options : [];
        const promiseArr = [];
        if( sounds.length !== 0 ) {
            for ( let x = 0; x < sounds.length; x++ ) {
                const p = audioFetcher( sounds[x] );
                promiseArr.push( p );
            }
        } else {
            console.warn( "there are no sounds to download. check your configuration" );
        }
        return Promise.all( promiseArr );
}
function seperateSoundName ( path ) {
        //if for some reason the name isn't in config, grabs it out the url path
        var pattern = /\w+(?!\/){1}(?=\.mp3|\.wav|\.ogg){1}/;
        var patternTwo = /[\s_\-]/;
        var matchedString = path.match(pattern);
        console.log(matchedString);
        var newString = matchedString[0].replace(patternTwo, " ").toLowerCase();
        console.log( newString );
        return newString;

}

export default initializeAudio;