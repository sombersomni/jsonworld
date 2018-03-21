# JSONWORLD
a web experience


## What is it?
jsonworld is for anyone who wants to create 3D interactive javascript experiences. It makes the process easier by taking the bulk of the javascript coding out of your hands. You don't need to be javascript savy to use this module, but you need some basic knowledge.

At it's core, jsonworld is a abstraction of the 3D tool [***THREEJS***](https://threejs.org) and the animation tool [***ANIMEJS***](https://animejs.com). It's function is to take a json **( Javascript Object Notation )** file full of options and spit out a 3D world based on what you choose. 

```javascript

    import JSONWorld from "jsonworld";
    
    const tree = {
        "type" : "tree",
        "count" : 100,
        "position" : [ 0, 0, 0 ],
        "color" : "red"
    }

    const cylinder = {
        "type" : "cylinder",
        "count" : 20,
        "vertexAnimation" : "wavy",
        "animation" : "spin-basic 10s ease-in-sine 1s",
        "animationKeyframes": {
            "spin-basic" : "360 20 100 120"
        }
        
    }   
    
    let config = {
        worldObjects : [ tree ]
    };

    let world = JSONWorld(config);
    world.start(config);

```

## Starting A New Project

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

import JSONWorld from "jsonworld";
import config from "./config.json";


window.onload = () => {
    
    let world = new JSONWorld(config);
    world.start();
    
    console.log( world );
                       
}
```
And wallah! If you refresh your page, you should see a perfect cube sitting in the middle of the screen. Also, you can see it comes with a preloader and mouse movement straight out the package. We created a 3D world with barely any coding. But Let's actually add more and make our project shine.

## Building a world




