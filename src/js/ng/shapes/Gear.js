
$.Gear = $.Entity.extend({

  pos: { x: 0, y: 0 },
  outerRadius: 90,
  innerRadius: 50,
  midRadius: 80,
  holeRadius: 10,
  numTeeth: 24,
  theta: 0,
  lightColor: '#B1CCFF',
  darkColor: '#3959CC',

  clockwise: false,
  speed: 1,

  start: function(){},

  update: function(){
    var move = this.speed * $.dt;
    this.theta += (this.clockwise ? -move: move);
  },

  draw: function(ctx){
    $.Renderer.gear(ctx, this);
  },

});
