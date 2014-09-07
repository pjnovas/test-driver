
$.Manager = $.Base.extend({

  start: function(){

    this.engine = new $.Engine();

    this.gearBox = new $.GearBox({
      engine: this.engine
    });

    this.rpm = new $.RPM({
      engine: this.engine
    });

    this.speedometer = new $.Speedometer({
      engine: this.engine
    });

    this.pedals = new $.Pedals();

    this.gears = new $.Gears({
      engine: this.engine,
      gearBox: this.gearBox
    });
  },

  update: function(){
    this.engine.update();

    this.gearBox.update();
    this.rpm.update();
    this.speedometer.update();
    this.pedals.update();
    this.gears.update();
  },

  draw: function(viewCtx, worldCtx){
    var s = config.size;

    viewCtx.clearRect(0, 0, s.x, s.y);
    worldCtx.clearRect(0, 0, s.x, s.y);

    this.gearBox.draw(worldCtx);
    this.rpm.draw(worldCtx);
    this.speedometer.draw(worldCtx);
    this.pedals.draw(worldCtx);
    this.gears.draw(worldCtx);
  },

});
