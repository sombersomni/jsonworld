# Bioluminescence
a web experience


jsonworld is for anyone who wants to create 3D interactive javascript experiences. It makes the process easier by taking the bulk of the javascript coding out of your hands. All you need is a knowledge of basic javascript and json objects. 

To start a new jsonworld, you need to create a canvas html element

```html

<canvas id="world"></canvas>

```

We need the id in order to seperate this canvas element from any other that might be in your html. The default id jsonworld uses is **"world"**, but we can classify an id to use in our configuration json file.

In our *config.json*, we our going to start building our world. Let's start with basic setup:

```json

{
    "worldObjects": [
        { 
            "type" : "box"
        }
    ]
}
```

We can put as many objects inside the *worldObjects* array as we want, but for now we only need one. The default settings built in handle the undefined properties. 

Now we need to write the javascript to get the jsonworld running. Below is all it takes to start:

```javascript

import jsonworld from "jsonworld";
import config from "./config.json";


window.onload = () => {
    
    let world = jsonworld(config);
    world.start();
    
    console.log( world );
                       
}
```

