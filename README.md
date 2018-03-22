# JSONWORLD
a web experience


## What is it?
jsonworld is for anyone who wants to create 3D interactive javascript experiences. It makes the process easier by taking the bulk of the javascript coding out of your hands. You don't need to be javascript savy to use this module, but you need some basic knowledge.

At it's core, jsonworld is an abstraction of the 3D tool [**THREEJS**](https://threejs.org) and the animation tool [**ANIMEJS**](https://animejs.com). It's function is to take a json **( Javascript Object Notation )** full of options and spit out a 3D world based on what you choose. Below is an example of a jsonworld project.

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
        worldObjects : [ tree, cylinder ]
    };

    window.onload = () => {
        let world = JSONWorld(config);
        world.start(config);
    }

```

## Starting A New Project

To start a new jsonworld, you need to create a html ***canvas*** element

```html

<canvas id="world"></canvas>

```

Use an id in order to seperate this canvas element from any other that might be in your html. The default id jsonworld uses is **"world"**, but we can changed the id name in our configuration json file. If a canvas element isn't created, jsonworld will make one for you!

Now we need to write the javascript to get the jsonworld running. Below is all it takes to start:

```javascript
import JSONWorld from "jsonworld";

window.onload = () => {
    
    let world = new JSONWorld({});
    world.start();
    
    console.log( world );
                       
}
```
And wallah! If you refresh your page, you should see a perfect dodecahedron rotating in the middle of the screen. **This is your preloader**. It won't load because we don't have anything in our world to process.  Also, it comes with a light source and mouse movement straight out the package. We created a 3D world with barely any code. But Let's actually add more and make our project shine.

## Building an Object

It's cool to see a 3D object, but it's not all that impressive. The syntax for describing your object is very similar to CSS3, with some minor tweaks. Let's explore creating an *object* in your **worldObjects** and add some attributes.

### Basic Object Attributes

```json

{
    "worldObjects" : [
        {
            "name" : "mgs-crate",
            "type" : "box", 
            "size" : "50 50 50",
            "position" : "100 0 0",
            "color" : "white", 
            "count" : 5, 
            "shadow" : true
        }
    ]
}

```
Basic Attributes | Description
------------ | -------------
name | helps identify the object so you can keep track of it. If you don't give it a name, no name will be assigned to it.
type | declares what type of object you want to make
size | gives the object a size by "width height depth". You can also use an array [ 10, 100, 10 ]. in the above example, jsonworld uses the width as the radius for the sphere. The program will makes its best guess for when you choose a size.
position | sets the position of the object by it's axis "x y z". You can also use an array [ 10, 10, 10 ]. By default, positioning is set based on the world's origin which is ( 0, 0, 0 ).
color | sets a color for the object. Takes CSS syntax ( "rgb(1, 1, 1 )" ) , literal syntax as you can see above or hexidecimals ( #FFFFFF which is white ).
count | creates clones of root object type. Although you can put as large number of objects on the screen at a time, I recommened between 1 to 1000 at a time for best performance
shadow | controls if this object can receive and cast shadows onto the world

As you can see, we have 5 boxes lined up along the center of the screen, but something is wrong. There is no depth! They look 2D. Although we turned the shadows on above, **_3D Objects_ require you to use a property called _material_** in order for the world to effect the object. Similar to human skin, you can think of *Material* as the skin of a world object. This will allow us to change the object's asthetic to differentiate all the others that may populate the screen. 

## Material Attributes

Here is where the **THREEJS** lingo comes in. THREEJS Materials control the appearance of an object. Here are your material options below: 

Material Type| Description
------------ | -------------
[basic](https://threejs.org/docs/#api/materials/MeshBasicMaterial)| applys a color to the objects skin but **WILL NOT CAST SHADOW**. You can also add textures
[normal](https://threejs.org/docs/#api/materials/MeshNormalMaterial)| applys a preset color for each face, useful for debug when you're creating objects
[standard](https://threejs.org/docs/#api/materials/MeshStandardMaterial) | applys a color, shading, light emission from object and accepts images for textures. **Best for most situations**
[phong](https://threejs.org/docs/#api/materials/MeshPhongMaterial) | similar to standard, but more for creating shiny surfaces like glass or ceramic
[lambert](https://threejs.org/docs/#api/materials/MeshLambertMaterial) | similar to phong, but more for creating dull surfaces like wood or rubber
wireframe | shows each triangle ( face ) that makes up your whole image shape. Great for debugging
[line](https://threejs.org/docs/#api/materials/LineBasicMaterial) | only for when you draw lines into 3D space.
[toon](https://threejs.org/docs/#api/materials/MeshToonMaterial) | similar to standard, but makes your object look more like a cartoon or cel-shaded
custom | if you know how to write advanced shader scripts or find some to import, you can use this type to give your object an even more unique look.

Let's add our material. We will move to javascript so we can focus on evolving our boxes into a *Metal Gear Solid Crate*. We want a dull texture for our skin, so we will use the *lambert* material:

```javascript
    
    const MGSCrate = {
        name: "mgs-crate",
        type: "box",
        size: "50 50 50",
        position : "100 0 0",
        color : "white", 
        count : 5, 
        shadow : true,
        "material" : "lambert",
        "texture" : "crate.png",
        
    }
    
```

**Material** brings out the shadows and highlights of the objects skin, but the newly added **Texture** wraps an image around the object to give it a little more realistic feel.


## Positioning Objects

Positioning objects in world space may seem difficult at first, but as you add more and more objects into the world, it will become easier for you to understand. Luckily, jsonworld uses similar concepts to *CSS3's positioning syntax* such as "margin" and "border". This helps keep it easier for people who are likely making the move from 2D to 3D, and simply want to make their designs come to life. 

Imagine your screen is a giant graph where up and down is the *y axis* and left and rigth is the *x axis*. The only new axis we're adding is the z-axis, back and forth. The world * camera * is set to 200 on the z and 200 on the y, while staying center on the x. This keeps things in view since all objects by default will start a ( 0, 0 , 0 ). If you create a bunch of objects all at once without considering where they will be, you can end up stacking objects on top of each other. JSONWORLD will try to prevent this by automatically checking where it can place an object without colliding into each other. But you want to probably handle where things go on the screen yourself.

```javascript
    //continuing from texture inside MSGCrate object
 const MSGCrate = {
    /* code */
    texture : "crate.png",
    margin : "100 50 0",
    "layout" : "basic",
    "layoutLimit" : "25 25 25"
    
                   
}





```


Some options are left to default at jsonworld's core in order to avoid over complicating things for you, but that doesn't mean you're limited. 
