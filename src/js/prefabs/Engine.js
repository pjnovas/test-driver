
$.Engine = $.Base.extend({

  rpm: 0,
  speed: 0,
  gear: 0,

  horsePower: 51,
  decreaseDelta: 31,

  max: {
    gear: 6,
    speed: 250,
    rpm: 7000
  },

  wheel: {
    width: 225,
    aspect: 40,
    diameter: 18,
    circ: 0
  },

  gearRatios: [ 0, 4.2, 2.49, 1.66, 1.24, 1, 0.8 ],
  gearDiffRatio: 3.15,

  start: function(){
    var wheel = this.wheel;
    this.wheel.circ = wheel.width * 2.0 * wheel.aspect/100.0 + wheel.diameter * 25.4;
    this.wheelCirc = 60 * this.wheel.circ * (Math.PI/1000);
    //this.mileKm = 1.609344;

    this.max.speed = this.getSpeed(this.max.rpm, this.gearRatios.length-1);

    Controls.on("gear", this.updateGear.bind(this));
  },

  update: function(){
    this.updateSpeed();
  },

  updateGear: function(gear){
    if (gear === "up"){
      if (this.gear < this.max.gear){
        gear = this.gear+1;
      }
      else {
        return;
      }
    }
    else if (gear === "down"){
      if (this.gear > 0){
        gear = this.gear-1;
      }
      else {
        return;
      }
    }
    else {
      gear = parseInt(gear, 10);
    }

    if (Controls.actions.clutch && this.gear !== gear){
      this.gear = gear;
      this.rpm = this.getRPM(this.speed, this.gear);

      if (this.rpm > this.max.rpm){
        this.rpm = this.max.rpm;
      }
    }
  },

  calculateRatio: function(gear){
    var ratio = this.gearDiffRatio;
    ratio *= this.gearRatios[gear];
    return ratio;
  },

  getRPM: function(speed, gear){
    var r = this.calculateRatio(gear);
    return speed /** this.mileKm*/ * 1000 * r / this.wheelCirc;
  },

  getSpeed: function(rpm, gear){
    var r = this.calculateRatio(gear);
    return rpm * this.wheelCirc / r / 1000/* / this.mileKm*/;
  },

  updateSpeed: function(){

    if (Controls.actions.gas){
      this.rpm += this.horsePower;
      
      if (this.rpm > this.max.rpm){
        this.rpm = this.max.rpm;
      }
    }
    else {
      this.rpm -= this.decreaseDelta;
    }

    if (!this.gear || Controls.actions.clutch){
      this.speed -= 0.1;
    }
    else if (Controls.actions.brake){
      this.speed -= 1; 
      this.rpm -= this.decreaseDelta*3;
    }
    else {
      this.speed = this.getSpeed(this.rpm, this.gear);
    }

    if (this.speed < 0){
      this.speed = 0;
    }

    if (this.rpm < 0){
      this.rpm = 0;
    }
  }

});
