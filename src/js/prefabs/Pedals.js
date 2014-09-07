
$.Pedals = $.Collection.extend({

  size: { x: 70, y: 120 },

  start: function(){
    this.entities = [];
    this.init();
  },

  init: function(){
    var gap = 150;
    var size = this.size;
    this.pos = { x: -50, y: 400 };
    
    this.clutch = new $.Rect({
      pos: { x: this.pos.x + gap, y: this.pos.y },
      size: size,
      fill: [50,50,50],
      stroke: {
        color: [200,200,200],
        size: 2
      }
    });

    this.entities.push(this.clutch);

    this.brake = new $.Rect({
      pos: { x: this.pos.x + gap*2, y: this.pos.y },
      size: size,
      fill: [50,50,50],
      stroke: {
        color: [200,200,200],
        size: 2
      }
    });

    this.entities.push(this.brake);

    this.gas = new $.Rect({
      pos: { x: this.pos.x + gap*3, y: this.pos.y },
      size: size,
      fill: [50,50,50],
      stroke: {
        color: [200,200,200],
        size: 2
      }
    });

    this.entities.push(this.gas);
  },

  update: function(){
    var off = [50,50,50];

    this.clutch.fill = (Controls.actions.clutch ? [0,0,200] : off);
    this.brake.fill = (Controls.actions.brake ? [200,0,0] : off);
    this.gas.fill = (Controls.actions.gas ? [0,200,0] : off);
  }

});