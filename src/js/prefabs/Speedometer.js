
$.Speedometer = $.Collection.extend({

  speed: 0,

  start: function(){
    this.entities = [];
    this.init();
  },

  init: function(){
    this.pos = { x: 520, y: 200 };
    this.radius = 150;
    this.vDir = {x: this.radius-10, y: 0};
    this.vDir1 = {x: this.radius-15, y: 0};
    this.vDir2 = {x: this.radius-20, y: 0};
    this.vDir3 = {x: this.radius-35, y: 0};

    this.bg = new $.Circle({
      pos: $.V.clone(this.pos),
      radius: this.radius,
      fill: [25,25,25],
      stroke: {
        size: 3,
        color: [200,200,200]
      },
    });

    this.entities.push(this.bg);

    for (var i=0; i<=this.engine.max.speed; i+=10){

      var a = this.getAngleBySpeed(i);
      var p = $.V.rotate(this.vDir, a, true); 
      var pTxt = $.V.rotate(this.vDir3, a, true); 

      var pTo = $.V.rotate(this.vDir1, a, true); 
      var lSize = 3;
      if (i % 20 === 0){
        pTo = $.V.rotate(this.vDir2, a, true); 
        lSize = 4;
      }

      this.entities.push(new $.Line({
        pos: $.V.add(this.pos, p),
        to: $.V.add(this.pos, pTo),
        size: lSize,
        color: [255,255,255]
      }));

      if (i % 20 === 0){
        var l = i.toString().length * 5;
        pTxt.x += (a < -90 ? -l/1.5 : -l);
        
        this.entities.push(new $.Text({
          pos: $.V.add(this.pos, pTxt),
          text: i,
          size: 10,
          color: [255,255,255]
        }));
      }
    }

    var txtPos = { x: this.pos.x - 20, y: this.pos.y + 70 };
    this.currentSpeed = new $.Text({
      text: "000",
      pos: txtPos,
      size: 20,
      fill: [50,50,50]
    });

    this.entities.push(this.currentSpeed);

    var txtPos2 = { x: txtPos.x+3, y: txtPos.y + 25 };
    this.entities.push(new $.Text({
      text: "km/h",
      pos: txtPos2,
      size: 12,
      fill: [50,50,50]
    }));

    this.pointer = new $.Line({
      pos: $.V.clone(this.pos),
      to: { x: 50, y: 250 },
      size: 3,
      color: [255, 0, 0]
    });

    this.entities.push(this.pointer);
  },

  getAngleBySpeed: function(speed){
    var total = 280;
    var maxSpeed = this.engine.max.speed;

    var offsetAngle = (speed * total) / maxSpeed;
    return -230 + offsetAngle;
  },

  updateAngle: function(){
    var p = $.V.rotate(this.vDir, this.getAngleBySpeed(this.speed), true);
    this.pointer.to = $.V.add(this.pointer.pos, p);

    this.currentSpeed.text = _.pad(this.speed, 3);
  },

  update: function(){
    this.speed = this.engine.speed;
    //console.log(this.speed);
    this.updateAngle();
  },

});