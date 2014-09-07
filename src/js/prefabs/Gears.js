

$.Gears = $.Collection.extend({

  speedDef: 0.2,
  colorDefs: [235, 200, 170, 140, 110, 80],
  colorActive: [100,255,100],

  start: function(){
    this.entities = [];

    this.pos = { x: 875, y: 500 };

    this.initGears();
  },

  initGears: function(){

    var radDef = 120;

    for (var i=0; i<this.engine.max.gear; i++){
      var c = this.colorDefs[i];
      var color = [c,c,c];

      var r0 = radDef - (i*20);
      var r1 = r0 - 20;
      var r2 = r0 + 10;

      this.entities.push(new $.Gear({
        pos: this.pos,
        outerRadius: r2,
        innerRadius: r1,
        midRadius: r0,
        holeRadius: 10,
        numTeeth: Math.round(r2/2),
        theta: 0,
        speed: 0,
        lightColor: color,
        darkColor: color,
        clockwise: false
      }));
    }

  },

  update: function(){
    var current = this.gearBox.gear;
    var clutch = Controls.actions.clutch;
    var rpm = this.engine.rpm/1000;

    this.entities.forEach(function(gear, i){
      var def = this.colorDefs[i];
      gear.lightColor = gear.darkColor = [def, def, def];

      if (!clutch && current && current === i+1){
        gear.lightColor = gear.darkColor = this.colorActive;
      }

      gear.speed = this.speedDef*(i+1)*rpm;
    }, this);

    $.Gears._super.update.apply(this);
  }

});
