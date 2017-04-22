export let config = {
  project     : 'small_world',
  version     : '1.0.0',
  parent      : null,
  autoUpdate  : true,
  autoPreload : true,

  logger: {
    level     : 'trace',
    handler   : 'console',
    formatter : 'simple'
  },

  display : {
    renderer            : 'auto',
    width               : 800,
    height              : 600,
    minWidth            : null,
    maxWidth            : null,
    minHeight           : null,
    maxHeight           : null,
    forceOrientation    : null,
    scaleMode           : 'noscale',
    fullscreenScaleMode : 'noscale',
    backgroundColor     : '#1D97F9',
    resolution          : 1,
    antialias           : false,
    transparent         : false, 
    forceFXAA           : false,
    roundPixels         : false,
  },

  resources: {
    basePath       : '',
    maxConcurrency : 10,
  },

  storage: {
    namespace : null, // uses project name
  },

  keyboard: {
    allowEvents     : true,
    preventDefaults : true,
  },
  
  mouse: {
    allowEvents     : true,
    preventDefaults : true,
  },

  gamepads: {
    leftStickDeadzone  : 0.25,
    rightStickDeadzone : 0.25,
    allowEvents        : true,
    preventDefaults    : true,
  },

  sounds: {
    masterVolume: 1
  }
}