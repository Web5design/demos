AsteroidsApp = function(veroldApp) {

  this.veroldApp = veroldApp;  
  this.mainScene;
  this.camera;

  this.ship;

  this.modelIDs = {
    'asteroid' : '514d18e34ad09902000005a9',
    'projectile' : '51421b770b4e5d0200000376',
    'ship': '514219f50b4e5d0200000353'
  };

  this.modelTemplates = {};

  this.assetIDs = {
    'asteroidMaterial': '51421a6f1c3aa5cc1e001b62'
  };

  this.assetTemplates = {};

  this.conversionScale = 3.55;

  this.resizeView();

  $(window).resize($.proxy(this.resizeView,this));
  
}

AsteroidsApp.prototype.startup = function() {

  var that = this;

	this.veroldApp.loadScene( null, {
    
    success_hierarchy: function( scene ) {

      // that.inputHandler = that.veroldApp.getInputHandler();
      that.renderer = that.veroldApp.getRenderer();
      // that.picker = that.veroldApp.getPicker();
      
      //Bind to input events to control the camera
      // that.veroldApp.on("keyDown", that.onKeyPress, that);
      // that.veroldApp.on("mouseUp", that.onMouseUp, that);
      // that.veroldApp.on("fixedUpdate", that.fixedUpdate, that );
      that.veroldApp.on("update", that.update, that );

      //Store a pointer to the scene
      that.mainScene = scene;
      scene.set({"payload.environment.skyboxOn" : false });
      var renderer = that.veroldApp.getRenderer();
      renderer.setClearColorHex(0x000000, 0);
      
      // var models = that.mainScene.getAllObjects( { "filter" :{ "model" : true }});

      that.getObjectTemplateByName('ship');
      that.getObjectTemplateByName('asteroid');
      // that.getAssetTemplateByName('asteroidMaterial');
      that.getObjectTemplateByName('projectile');

      // that.ship = models[ _.keys( models )[0] ];
      // var model = that.ship.threeData;

      //Create the camera
      that.camera = new THREE.OrthographicCamera(that.orthLeft,that.orthRight,that.orthTop,that.orthBottom, 0.1, 10000 );
      that.camera.up.set( 0, 1, 0 );
      that.camera.position.set( 0, 0, 20);

      // var lookAt = new THREE.Vector3();
      // lookAt.add( model.center );
      // lookAt.multiply( model.scale );
      // lookAt.applyQuaternion( model.quaternion );
      // lookAt.add( model.position );

      // that.camera.lookAt( lookAt );
      
      //Tell the engine to use this camera when rendering the scene.
      that.veroldApp.setActiveCamera( that.camera );

      window.asteroids.get('ui').hideLoadingProgress();

      window.asteroids.get('events').trigger('game:veroldAppStartupComplete');

    },

    progress: function(sceneObj) {
      var percent = Math.floor((sceneObj.loadingProgress.loaded_hierarchy / sceneObj.loadingProgress.total_hierarchy)*100);
      window.asteroids.get('ui').setLoadingProgress(percent); 
    }

  });
	
}

AsteroidsApp.prototype.shutdown = function() {
	
  // this.veroldApp.off("keyDown", this.onKeyPress, this);
  // this.veroldApp.off("mouseUp", this.onMouseUp, this);

  this.veroldApp.off("update", this.update, this );
}

AsteroidsApp.prototype.update = function( delta ) {

}

AsteroidsApp.prototype.fixedUpdate = function( delta ) {

}

// AsteroidsApp.prototype.onMouseUp = function( event ) {
//   
//   if ( event.button == this.inputHandler.mouseButtons[ "left" ] && 
//     !this.inputHandler.mouseDragStatePrevious[ event.button ] ) {
//     
//     var mouseX = event.sceneX / this.veroldApp.getRenderWidth();
//     var mouseY = event.sceneY / this.veroldApp.getRenderHeight();
//     var pickData = this.picker.pick( this.mainScene.threeData, this.camera, mouseX, mouseY );
//     if ( pickData ) {
//       //Bind 'pick' event to an asset or just let user do this how they want?
//       if ( pickData.meshID == "51125eb50a4925020000000f") {
//         //Do stuff
//       }
//     }
//   }
// }
// 
// AsteroidsApp.prototype.onKeyPress = function( event ) {
// 	
// 	var keyCodes = this.inputHandler.keyCodes;
//   if ( event.keyCode === keyCodes['B'] ) {
//     var that = this;
//     this.boundingBoxesOn = !this.boundingBoxesOn;
//     var scene = veroldApp.getActiveScene();
//     
//     scene.traverse( function( obj ) {
//       if ( obj.isBB ) {
//         obj.visible = that.boundingBoxesOn;
//       }
//     });
//   
//   }
//     
// }

/* Custom Asteroids functions */

AsteroidsApp.prototype.resizeView = function() {
  var width = $(window).width(), height = $(window).height();
  this.orthTop = 14;
  this.orthBottom = -this.orthTop;
  this.orthRight = this.orthTop * (width/height);
  this.orthLeft = -this.orthRight;

  if(!!this.camera) {
    this.camera.top = this.orthTop;
    this.camera.right = this.orthRight;
    this.camera.bottom = this.orthBottom;
    this.camera.left = this.orthLeft;

    this.camera.updateProjectionMatrix();
  }
};

AsteroidsApp.prototype.getOrthBounds = function() {
  return {
    top: this.orthTop,
    left: this.orthLeft,
    bottom: this.orthBottom,
    right: this.orthRight
  }
};

AsteroidsApp.prototype.getPhysicsTo3DSpaceConverson = function() {
  return this.conversionScale;
};

AsteroidsApp.prototype.cloneObjectFromTemplate = function(name,callback) {
  var that = this;
  var template = this.getObjectTemplateByName(name);
  template.clone({
    success_hierarchy: function(clone) {
      that.mainScene.addChildObject(clone);
      callback(clone);
    }
  })
};

AsteroidsApp.prototype.getObjectTemplateByName = function(name) {

  // if template already retrieved, return it
  if(name in this.modelTemplates) return this.modelTemplates[name];

  var templateID = this.modelIDs[name],
      template = this.mainScene.getObject(templateID);

  this.mainScene.removeChildObject(template);

  this.modelTemplates[name] = template;

  return template;
};

AsteroidsApp.prototype.cloneAssetFromTemplate = function(name, callback) {
  var that = this;
  var template = this.getAssetTemplateByName(name);
  template.clone({
    success_hierarchy: function(clone) {
      callback(clone);
    }
  })
};

AsteroidsApp.prototype.getAssetTemplateByName = function(name) {
  if(name in this.assetTemplates) return this.assetTemplates[name];
  var assetReg = this.veroldApp.getAssetRegistry();
  var templateID = this.assetIDs[name];
  var template = assetReg.getAsset(templateID);

  this.assetTemplates[name] = template;

  return template;
};
