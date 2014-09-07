
$.RPM = $.Collection.extend({

  rpm: 0,

  start: function(){
    this.entities = [];
    this.init();
  },

  init: function(){
    this.pos = { x: 200, y: 200 };
    this.radius = 150;
    this.vDir = {x: this.radius-10, y: 0};
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

    for (var i=0; i<=this.engine.max.rpm; i+=1000){
      var a = this.getAngleByRPM(i);
      var p = $.V.rotate(this.vDir, a, true); 
      var pTo = $.V.rotate(this.vDir2, a, true); 
      var pTxt = $.V.rotate(this.vDir3, a, true); 

      this.entities.push(new $.Line({
        pos: $.V.add(this.pos, p),
        to: $.V.add(this.pos, pTo),
        size: 3,
        color: [255,255,255]
      }));

      pTxt.x -= 5;
      this.entities.push(new $.Text({
        pos: $.V.add(this.pos, pTxt),
        text: i/1000,
        size: 15,
        color: [255,255,255]
      }));
    }

    var txtPos = { x: this.pos.x - 30, y: this.pos.y + 70 };
    this.currentRPM = new $.Text({
      text: "0000",
      pos: txtPos,
      size: 20,
      fill: [50,50,50]
    });

    this.entities.push(this.currentRPM);

    var txtPos2 = { x: txtPos.x+15, y: txtPos.y + 25 };
    this.entities.push(new $.Text({
      text: "rpm",
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

  getAngleByRPM: function(rpm){
    var total = 180;
    var maxRPM = this.engine.max.rpm;

    var offsetAngle = (rpm * total) / maxRPM;
    return -(total+45) + offsetAngle;
  },

  updateAngle: function(){
    var p = $.V.rotate(this.vDir, this.getAngleByRPM(this.rpm), true);
    this.pointer.to = $.V.add(this.pointer.pos, p);

    this.currentRPM.text = _.pad(this.rpm, 4);
  },

  update: function(){
    this.rpm = this.engine.rpm;
    this.updateAngle();
  },

});