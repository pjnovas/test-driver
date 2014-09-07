
$.Game = $.Base.extend({

  tLoop:  null,
  paused:  false,

  start: function(){
    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();
    this.createManager();
  },

  createManager: function(){
    this.manager = new $.Manager();
  },

  initContexts: function(){
    var size = config.size
      , i = 0;

    function getContext(canvas, _size){
      canvas.width = _size.x;
      canvas.height = _size.y;
      canvas.style.zIndex = ++i;
      return canvas.getContext("2d");
    }

    this.worldCtx = getContext(this.cworld, size);
    this.viewCtx = getContext(this.cview, size);
  },

  loop: function(){
    this.manager.update();
    this.manager.draw(this.viewCtx, this.worldCtx);
  },

  play: function(){
    this.paused = false;
    Controls.enable();
    this.gameRun();
  },

  stop: function(){
    this.paused = true;
    Controls.disable();
    window.cancelAnimationFrame(this.tLoop);
  },

  gameRun: function(){
    if (!this.paused){
      if (Time.tick()) { this.loop(); }
      this.tLoop = window.requestAnimationFrame(this.boundGameRun);
    }
  },

});
