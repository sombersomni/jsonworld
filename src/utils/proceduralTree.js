let THREE = require("three");

 function recordBeginAndEnd ( obj ) {
        let verts = obj.geometry.vertices;
        return { top: verts[ verts.length - 2 ], bottom: verts[ verts.length - 1 ] };
      }
const calculateNewPos = ( topVert, h, angle = 45 ) => {
        const axis = new THREE.Vector3( 0, 0, 1 );
        const axisTwo = new THREE.Vector3( 0, 1, 0 );
        const anchor = new THREE.Vector3( 0, 0 , 0 );
        const followPoint = new THREE.Vector3( 0, h / 2, 0 );
        const a = Math.PI / 180 * angle;
        followPoint.applyAxisAngle( axis, a );
        //position rotation around
        //followPoint.setY( topVert.y + h );
        return followPoint;
}

function makeBranch ( rootBranch, material ) {
          const segCalc = Math.round(  rootBranch.height / 20 ) >= 2 ? Math.round( rootBranch.height / 20 ) : 2;
          return new THREE.Mesh( new THREE.CylinderGeometry( rootBranch.radiusTop - ( ( rootBranch.radiusTop / 3 ) * 2 ), rootBranch.radiusBottom - ( ( rootBranch.radiusBottom / 4 ) * 2 ), rootBranch.height - ( rootBranch.height / 3 ), 8, segCalc ), ( material !== undefined ) ? material : new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ) );
         
}
function modifyBranch( obj ) {
        return obj;
}

export default function generateBranch( root ={}, cycleRecord = { branchCycles : 0 }  ) {
        let material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
        root = root.hasOwnProperty( "uuid" ) ? root : new THREE.Mesh( new THREE.CylinderGeometry( root.radiusTop !== undefined ? root.radiusTop : 8, root.radiusBottom !== undefined ? root.radiusBottom : 10, root.trunkHeight !== undefined ? root.trunkHeight : 100 , root.widthSegs !== undefined ? root.widthSegs : 8, root.heightSegs !== undefined ? root.heightSegs : 6 ), root.material !== undefined ? root.material : material );
        
        if( cycleRecord.branchCycles === 0 ) {
          root.name = "root";
          modifyBranch( root );
        }
        cycleRecord.rootID = cycleRecord.rootID === undefined ? root.uuid : cycleRecord.rootID;
        cycleRecord[ root.uuid ] = {};
        cycleRecord[ root.uuid ].cycles = 0;
   
        //we can change where certain branches branch out from
        const rootVerts = { x: 0, y: root.geometry.parameters.height / 2, z: 0 };
      
        const branches = new THREE.Group();
        branches.name = "branches";
        const branchNum = Math.round( Math.random() * 6 ) + 1;
        const rootBranch = root.geometry.parameters;
        const branchHeight =  rootBranch.height;

        let stump = new THREE.Mesh( new THREE.SphereGeometry( rootBranch.radiusTop ), material );
        stump.name = "stump";
        stump.position.set( rootVerts.x, rootVerts.y, rootVerts.z );
        root.add( stump );


          for ( let x = 1; x <= branchNum ; x++ ) {
            let newBranch;
            const spread = 15;
            const ang = ( Math.round( Math.random() * 18 + 1 ) * 5 ) * ( x % 2 === 0 ? -1 : 1 );
            let treeCenter = new THREE.Group();
            treeCenter.position.set( root.position.x, root.position.y, root.position.z );
            treeCenter.name = "container";
            root.add( treeCenter );
            
            let branch = modifyBranch( makeBranch( rootBranch, material ) );
            
            branch.name = "branch" + x.toString();
            const branchParams = branch.geometry.parameters;
            
            
            if ( branchHeight > 50 ) {
                //creates multiple branches
              cycleRecord.branchCycles ++;
              cycleRecord[ root.uuid ].cycles ++;
              newBranch = generateBranch( branch, cycleRecord );
            } else {
                //creates single branch
              cycleRecord[ root.uuid ].cycles ++;
              newBranch = branch;
              
            }
            
            const newPos = calculateNewPos( rootVerts, branchParams.height, ang );

            newBranch.rotation.set(0 , 0 , ang * Math.PI / 180 );
            newBranch.position.set( newPos.x, newPos.y + rootBranch.height / 2, newPos.z );

            //console.log( obj.children[1] );
            treeCenter.add( newBranch );
            treeCenter.rotation.set( 0, 45 * ( ( x - 1 ) % 4 == 0 ? (x / 4) * spread : 1 ) * x * Math.PI / 180, 0 );

            branches.add( treeCenter );
          }
        
        root.add( branches );
        return root;
      }