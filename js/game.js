// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { window.clearTimeout(id); };
  }
}());

/*
 * Taken from Backbone and Underscore
 * and only left the minimun and necessary code
 */

var _ = {};
var $ = {};

var idCounter = 0;
_.uniqueId = function(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
};

_.isObject = function(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

_.extend = function(obj) {
  if (!_.isObject(obj)) { return obj; }
  var source, prop;
  for (var i = 1, length = arguments.length; i < length; i++) {
    source = arguments[i];
    for (prop in source) {
      if (hasOwnProperty.call(source, prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};

_.pad = function(num, size) {
  var s = "0000000" + num.toFixed();
  return s.substr(s.length-size);
};


// BASE CLASS 

$.Base = function(attributes) {

  if (_.isObject(attributes)){
    _.extend(this, attributes || {});
  }

  this.cid = _.uniqueId('c');
  
  this.start.apply(this, arguments);
};

_.extend($.Base.prototype, {
  start: function(){},
});

$.Base.extend = function(protoProps, staticProps) {
  var parent = this;
  var child = function(){ return parent.apply(this, arguments); };
    
  _.extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (protoProps) { _.extend(child.prototype, protoProps); }
  child._super = parent.prototype;

  return child;
};


$.Entity = $.Base.extend({

  pos: { x: 0, y: 0 },

  start: function(){},

  update: function(){ },

  draw: function(/*ctx*/){ },

});


$.Collection = $.Base.extend({

  entities: [],

  start: function(){
    this.entities = [];
  },

  update: function(){
    this.entities.forEach(function (entity) {
      entity.update();
    });
  },

  draw: function(ctx){
    this.entities.forEach(function (entity) {
      entity.draw(ctx);
    });
  },

});


$.M = $.Base.extend({ }, {

  rnd: function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  rnd01: function(){
    return Math.random();
  },

  rnd11: function(){
    return Math.random() > 0.5 ? 1 : -1;
  },

  rndInCircle: function(radius){
    var angle = Math.random() * Math.PI * 2;
    var rad = $.M.rnd(0, radius);

    return {
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad
    };
  },

  lerp: function(a, b, u) {
    return (1 - u) * a + u * b;
  },

  polygonPoints: function(center, radius, sides) {
    var points = [];
    var angle = (Math.PI * 2) / sides;

    for (var i = 0; i < sides; i++) {
      points.push({
        x: center.x + radius * Math.cos(i * angle),
        y: center.y + radius * Math.sin(i * angle)
      });
    }

    return points;
  },

  degToRad: function(deg){
    return deg * (Math.PI/180);
  },

  radToDeg: function(rad){
    return rad * (180/Math.PI);
  }

});



$.C = $.Base.extend({ }, {

  white: [255,255,255,1],

  toRGBA: function(arr){
    if (Array.isArray(arr)){
      return "rgba(" + (arr[0] || 0) + "," + (arr[1] || 0) + "," + (arr[2] || 0) + "," + (arr[3] || 1).toFixed(1) + ")";
    }
    return arr;
  },

  lerp: function(from, to, t){

    function l(a, b, t, m){
      m = m ? m : 1;
      return Math.round($.M.lerp(a, b, t) * m) / m;
    }

    return [
        l(from[0], to[0], t)
      , l(from[1], to[1], t)
      , l(from[2], to[2], t)
      , l(
          from[3] >= 0 ? from[3]: 1
        , to[3] >= 0 ? to[3] : 1
        , t
        , 100
        )
    ];
  },

  eql: function(a, b){
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }

});


$.V = $.Base.extend({ }, {

  zero: { x: 0, y: 0 },
  one: { x: 1, y: 1 },

  clone: function(v){
    return { x: v.x, y: v.y };
  },

  prod: function(a, b){
    return { x: a.x * b.x, y: a.y * b.y };
  },

  multiply: function(vector, delta){
    return { x: vector.x * delta, y: vector.y * delta };
  },

  divide: function(vector, delta){
    return { x: vector.x / delta, y: vector.y / delta };
  },

  add: function(a, b){
    return { x: a.x + b.x, y: a.y + b.y };
  },

  dif: function(from, to){
    return { x: to.x - from.x, y: to.y - from.y };
  },

  // get "which" part of a point between 2 (i.e. 4th part)
  part: function(from, to, which){
    return $.V.lerp(from, to, which/10);
  },

  angleTo: function(from, to){
    var p = $.V.dif(from, to);
    return Math.atan2(p.y, p.x);
  },

  // get mid point between 2
  mid: function(from, to){
    return $.V.divide($.V.add(from, to), 2);
  },

  eql: function(a, b){
    return (a.x === b.x && a.y === b.y);
  },

  normal: function(from, to){
    var d = $.V.dif(from, to);
    var l = $.V.magnitude(from, to);

    return {
        x: d.x / l || 0
      , y: d.y / l || 0
    };
  },

  origin: function(pos, size){
    return {
        x: pos.x - size.x/2,
        y: pos.y - size.y/2,
    };
  },

  center: function(pos, size){
    return {
        x: pos.x + size.x/2,
        y: pos.y + size.y/2,
    };
  },

  magnitude: function(a, b){
    var dif = $.V.dif(a, b);
    return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
  },

  pointInCircle: function(p, pos, radius){
    return $.V.magnitude(p, pos) < radius;
  },
  
  lerp: function(from, to, t){

    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };

  },

  round: function(v){
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    return v;
  },

  isOut: function(p, min, max){
    return (p.x < min.x || p.x > max.x || p.y < min.y || p.y > max.y);
  },

  rotate: function(p, deg, clockwise){
    var rad = $.M.degToRad(deg * (clockwise ? 1 : -1));
    return {
      x: (p.x * Math.cos(rad)) - (p.y * Math.sin(rad)),
      y: (p.x * Math.sin(rad)) + (p.y * Math.cos(rad))
    };
  }

});


$.Renderer = $.Base.extend({ }, {

  fill: function(ctx, ps){
    if (ps.fill){
      ctx.fillStyle = $.C.toRGBA(ps.fill);
      ctx.fill();
    }
  },

  stroke: function(ctx, ps){
    if (ps.stroke){
      ctx.lineWidth = ps.stroke.size || 1;
      ctx.strokeStyle = $.C.toRGBA(ps.stroke.color);
      ctx.stroke();
    }
  },

  _rect: function(ctx, ps){
    ctx.beginPath();
    ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  circle: function(ctx, ps){
    var start = (ps.angles && ps.angles.start) || 0,
      end = (ps.angles && ps.angles.end) || 2 * Math.PI;

    ctx.beginPath();

    if (ps.lineCap){
      ctx.lineCap = ps.lineCap;
    }

    ctx.arc(ps.pos.x, ps.pos.y, ps.radius, start, end, false);

    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  line: function(ctx, ps){
    var a = ps.pos
      , b = ps.to;

    ctx.beginPath();

    ctx.lineCap = 'round';

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.lineWidth = ps.size;
    ctx.strokeStyle = $.C.toRGBA(ps.color);
    ctx.stroke();
  },

  sprite: function(ctx, ps){
    var img = $.repo[ps.resource]
      , p = $.V.origin(ps.pos, ps.size)
      , x = p.x
      , y = p.y
      , w = ps.size.x
      , h = ps.size.y
      , sp = ps.sprite;

    function draw(){
      if (sp){
        ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, x, y, w, h);
      }
      else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    if (!isNaN(ps.angle)){
      ctx.save();

      ctx.translate(x + w/2, y + h/2);
      x = -w/2;
      y = -h/2;
      ctx.rotate(ps.angle);

      draw();

      ctx.restore();
      return;
    }

    draw();
  },

  text: function(ctx, ps){
    ctx.font = ps.size + 'pt ' + (ps.type || "Play");
    ctx.textBaseline = ps.baseline || 'middle';
    ctx.fillStyle = $.C.toRGBA(ps.color);

    ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
  },

  rect: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , w = ps.size.x
      , h = ps.size.y;

    if (!ps.corner){
      $.Renderer._rect(ctx, ps);
      return;
    }

    var c = ps.corner;

    ctx.beginPath();
    ctx.moveTo(x + c, y);
    ctx.lineTo(x + w - c, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + c);
    ctx.lineTo(x + w, y + h - c);
    ctx.quadraticCurveTo(x + w, y + h, x + w - c, y + h);
    ctx.lineTo(x + c, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - c);
    ctx.lineTo(x, y + c);
    ctx.quadraticCurveTo(x, y, x + c, y);
    ctx.closePath();
    
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  gear: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y;

    var numPoints = ps.numTeeth * 2;
    // draw gear teeth
    ctx.beginPath();
    ctx.lineJoin = 'bevel';
    for(var n = 0; n < numPoints; n++) {

      var radius = null;

      if(n % 2 === 0) {
        radius = ps.outerRadius;
      }
      else {
        radius = ps.innerRadius;
      }

      var theta = ps.theta;
      theta += ((Math.PI * 2) / numPoints) * (n + 1);

      var xt = (radius * Math.sin(theta)) + x;
      var yt = (radius * Math.cos(theta)) + y;

      if(n === 0) {
        ctx.moveTo(xt, yt);
      }
      else {
        ctx.lineTo(xt, yt);
      }
    }

    ctx.closePath();
    ctx.lineWidth = 5;
    ctx.strokeStyle = $.C.toRGBA(ps.darkColor);
    ctx.stroke();

    // draw gear body
    ctx.beginPath();
    ctx.arc(x, y, ps.midRadius, 0, 2 * Math.PI, false);

    //var grd = ctx.createLinearGradient(x - 100, y - 100, x + 100, y + 100);
    //grd.addColorStop(0, ps.lightColor);
    //grd.addColorStop(1, ps.darkColor);
    //ctx.fillStyle = grd;
    ctx.fillStyle = $.C.toRGBA(ps.darkColor);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = $.C.toRGBA(ps.darkColor);
    ctx.stroke();

    // draw gear hole
    ctx.beginPath();
    ctx.arc(x, y, ps.holeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#3C3C3C';
    ctx.fill();
    ctx.strokeStyle = $.C.toRGBA(ps.darkColor);
    ctx.stroke();
    ctx.restore();

  }

});


$.Circle = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //radius: 5,
  //fill:null,
  //stroke: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.circle(ctx, this);
  },

});


$.Line = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //to: { x: 0, y: 0 },

  //size: 1,
  //color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.line(ctx, this);
  },

});



$.Rect = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //size: { x: 20, y: 20},
  //fill: null,
  //stroke: null,
  //corner: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.rect(ctx, this);
  },

});


$.Text = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //text: "",

  //size: 1,
  color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.text(ctx, this);
  },

});



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


$.Sprite = $.Entity.extend({

  //resource: "",
  //pos: { x: 0, y: 0 },
  //sprite: { x: 0, y: 0, w: 20, h: 20 },
  //size: { x: 20, y: 20 },
  //angle: 0,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.sprite(ctx, this);
  },

});


$.Controls = $.Base.extend({

  events: {
      "pressing": null
    , "moving": null
    , "release": null

    , "gas:on": null
    , "gas:off": null
    , "brake:on": null
    , "brake:off": null
    , "clutch:on": null
    , "clutch:off": null

    , "gear": null

    , "pause": null
  },

  enabled: false,

  actions: {
    gas: 0,
    brake: 0,
    clutch: 0
  },

  start: function(options){
    var doc = window.document
      , c = this.container = options.container || doc;

    c.onmouseup = this._onMouseEvent.bind(this, "release");
    c.onmousedown = this._onMouseEvent.bind(this, "pressing");
    c.onmousemove = this._onMouseEvent.bind(this, "moving");
    doc.addEventListener("keyup", this._onKeyUp.bind(this));
    doc.addEventListener("keydown", this._onKeyDown.bind(this));
  },

  enable: function(){
    this.enabled = true;
    return this;
  },

  disable: function(){
    this.enabled = false;
    return this;
  },

  on: function(evName, callback){
    if (!this.events[evName]){
      this.events[evName] = [];
    }

    this.events[evName].push(callback);

    return this;
  },

  off: function(evName){
    if (this.events[evName]){
      this.events[evName].length = 0;
    }

    return this;
  },

  _getEventName: function(e){
    var key = e.which || e.keyCode;

    switch(key){
      case 81: //Q
      case 113: //q
        return "clutch";
      case 87: //W
      case 119: //w
        return "gas";
      case 83: //S
      case 115: //s
        return "brake";
      case 38: //Up
        return "gear:up";
      case 40: //Down
        return "gear:down";
      case 112: //P
      case 80: //p
        return "pause";
    }

    if (key >= 48 && key <= 54){
      return "gear:" + String.fromCharCode(key);
    }

    // numeric pad
    key-=48;
    if (key >= 48 && key <= 54){
      return "gear:" + String.fromCharCode(key);
    }

    return;
  },

  _onKeyUp: function(e){
    var evName = this._getEventName(e);

    if (!this.enabled && evName !== "pause"){
      return;
    }

    if (evName){
      if (evName.indexOf("gear") > -1){
        var gearACN = evName.split(":")[1];

        if (this.events.gear){
          this.events.gear.forEach(function(cb){
            cb(gearACN);
          });
        }

        return;
      }

      this.actions[evName] = 0;

      evName += ":off";

      if (this.events[evName]){
        this.events[evName].forEach(function(cb){
          cb();
        });
      }
    }
  },

  _onKeyDown: function(e){
    var evName = this._getEventName(e);

    if (!this.enabled){
      return;
    }

    if (evName){
      this.actions[evName] = 1;

      evName += ":on";
      if (this.events[evName]){
        this.events[evName].forEach(function(cb){
          cb();
        });
      }
    }
  },

  _onMouseEvent: function(type, e){
    if (!this.enabled){
      return;
    }

    var pos = this.getCoordsEvent(e, this.container);

    if (this.events[type]){
      this.events[type].forEach(function(cb){
        cb(pos);
      });
    }
  },

  getCoordsEvent: function(e, ele){
    var x, y
      , doc = document
      , body = doc.body
      , docEle = doc.documentElement;

    if (e.pageX || e.pageY) { 
      x = e.pageX;
      y = e.pageY;
    }
    else { 
      x = e.clientX + body.scrollLeft + docEle.scrollLeft; 
      y = e.clientY + body.scrollTop + docEle.scrollTop; 
    } 
    
    x -= ele.offsetLeft;
    y -= ele.offsetTop;
    
    return { x: x, y: y };
  }

});



$.Particles = $.Collection.extend({

  max: 250, //max particles in world

  start: function(){
    this.entities = [];
    this.emitters = {};

    this.init(this.max);
  },

  init: function(max){
    for (var i=0; i<max; i++){
      this.entities.push({
        active: false
      });
    }  
  },

  createEmitter: function(emitter, ops){
    var e = this.emitters[emitter.cid] = {
      emitter: emitter,
      options: ops,
      count: 0,
      lastr: 0,
      active: (ops.auto ? true : false)
    };

    return e;
  },

  toggleEmiter: function(eid, active){
    var e = this.emitters[eid];
    if (e) {
      e.active = active;
    }
  },

  playEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, true);
  },

  stopEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, false);
  },

  createEmitterParticles: function(cid, howMany){
    for (var i=0; i<howMany; i++){
      var e = this.emitters[cid];
      if (!this.initParticle(e.emitter, e.options)){
        return;
      }
    }
  },

  runEmitters: function(){
    for (var cid in this.emitters){
      var e = this.emitters[cid];
      e.lastr -= $.dt;

      if (e.active && e.count < e.options.max && e.lastr <= 0){
        e.lastr = e.options.rate;
        var am = e.options.ratep;
        this.createEmitterParticles(cid, am);
        e.count += am;
      }
    }
  },

  initParticle: function(emitter, opts){
    var p = this.getParticle();
    
    if (p){

      p.active = true;

      p.g = opts.g || $.V.zero;
      p.d = opts.d || $.V.one;
      p.f = opts.f || $.V.one;

      p.pos = emitter.pos;

      if (opts.rad) {

        var rX = $.M.rnd(0, opts.rad) * $.M.rnd11();
        var rY = $.M.rnd(0, opts.rad) * $.M.rnd11();
        
        p.pos = { x: emitter.pos.x+rX, y: emitter.pos.y+rY };
      }

      p.cFrom = opts.cFrom;
      p.cTo = opts.cTo;

      p.life = opts.life;
      p.tlife = opts.life;
      p.size = opts.size || 1;

      p.emitter = emitter;
      
      return true;
    }

    return false;
  },

  getParticle: function(){
    var ps = this.entities
      , len = ps.length;

    for(var i = 0; i< len; i++){
      if (!ps[i].active){
        return ps[i];
      }
    }

    return null;
  },

  updateParticle: function(p){
    p.f = $.V.multiply(p.g, $.dt);
    p.d = $.V.add(p.d, p.f);
    p.pos = $.V.add(p.pos, $.V.multiply(p.d, $.dt));

    if (p.cFrom && p.cTo) {
      p.color = $.C.lerp(p.cFrom, p.cTo, 1 - ((p.life*100) / p.tlife)/100);
    }

    p.life -= $.dt;
  },

  drawParticle: function(ctx, p){

    $.Renderer.circle(ctx, {
      pos: p.pos,
      radius: p.size,
      fill: p.color
    });

  },

  update: function(){
    this.runEmitters();

    this.entities.forEach(function(p){
      if (p.life <= 0){
        p.active = false;
      }

      if (p.active){
        this.updateParticle(p);
      }
      else if (p.emitter) {
        var e = this.emitters[p.emitter.cid];
        if (e && e.active) {
          e.count--;
        }
      }
    }, this);
  },

  draw: function(ctx){
    this.entities.forEach(function(p){
      if (p.active){
        this.drawParticle(ctx, p);
      }
    }, this);
  }


});


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

$.GearBox = $.Collection.extend({

  gear: 0,
  moving: false,
  moveSpeed: 1,
  currentPathIdx: -1,

  start: function(){
    this.entities = [];

    this.pos = { x: 750, y: 75 };
    this.size = { x: 250, y: 250 };

    this.initPaths();
    this.init();
  },

  initPaths: function(){
    var margin = 50
      , center = $.V.center(this.pos, this.size)
      , max = $.V.add(this.pos, this.size)
      , x = this.pos.x + margin
      , y = this.pos.y + margin
      , maxX = max.x - margin
      , maxY = max.y - margin;

    this.points = [];
    this.paths = [];

    var gearPoints = [
        center
      , { x: x, y: y }
      , { x: x, y: maxY }
      , { x: center.x, y: y }
      , { x: center.x, y: maxY }
      , { x: maxX, y: y }
      , { x: maxX, y: maxY }

      // control points ( index 7 and 8 )
      , { x: x, y: center.y, control: true } // LEFT
      , { x: maxX, y: center.y, control: true } // RIGHT      
    ];

    gearPoints.forEach(function(p){
      this.points.push(p);
    }, this);

    // paths from neutral
    this.paths.push(
        null
      , [0, 7, 1]
      , [0, 7, 2]
      , [0, 3]
      , [0, 4]
      , [0, 8, 5]
      , [0, 8, 6]
    );

  },

  init: function(){
    var border = {
      color: [50,50,50],
      size: 3
    };
    
    this.entities.push(new $.Rect({
      pos: this.pos,
      size: this.size,
      corner: 20,
      fill: [206,206,206],
      stroke: border
    }));

    this.points.forEach(function(point){

      if (!point.control){
        this.entities.push(new $.Circle({
          pos: point,
          radius: 20,
          fill: [10,10,10],
          stroke: border
        }));
      }

    }, this);

    this.paths.forEach(function(path){

      if (path){
        for (var i=0; i<path.length-1; i++){

          this.entities.push(new $.Line({
            pos: this.points[path[i]],
            to: this.points[path[i+1]],
            size: 20,
            color: [10,10,10]
          }));

        }
      }

    }, this);

    this.points.forEach(function(point, i){

      if (!point.control){

        this.entities.push(new $.Text({
          text: i,
          pos: { x: point.x -8, y: point.y },
          size: 20,
          color: [200,200,200]
        }));
      }

    }, this);

    this.gearBall = new $.Circle({
      pos: this.points[0],
      radius: 30,
      fill: [255,255,255],
      stroke: border
    });

    this.entities.push(this.gearBall);

    var txtPos = { x: this.pos.x-50, y: this.pos.y };

    this.currenGear = new $.Text({
      text: "0",
      pos: txtPos,
      size: 40,
      fill: [50,50,50]
    });

    this.entities.push(this.currenGear);
  },

  isDirectPath: function(){
    var g = this.gear
      , gt = this.gearTo
      , directs = [ [1,2], [5,6] ];

    for (var i=0; i<directs.length; i++){
      var dir = directs[i];

      if (g === dir[0] && gt === dir[1] || g === dir[1] && gt === dir[0]){
        return true;
      }
    }

    return false;
  },

  setMove: function(){
    this.moving = true;
    this.t_startMove = $.tm;
    
    if (this.currentPathIdx === -1){
      // is starting to move
      var start = [];
      var end = [];

      
      if (this.isDirectPath()){
        // they are direct paths (no neutral to get from one to the other)
        this.breadcrumb = [this.gear, this.gearTo];
      }
      else {
        if (this.gear > 0){
          // Get current path from gear to neutral
          start = Array.prototype.slice.call(this.paths[this.gear]);
          start.reverse();
        }
        
        if (this.gearTo){
          // Concat path from neutral to gearTo
          end = this.paths[this.gearTo];
        }

        this.breadcrumb = start.concat(end);
      }

      // set start point to first one
      this.currentPathIdx = 0;
    }
    else {
      // is moving from other point so increase to next point
      this.currentPathIdx++; 
    }

    var from = this.breadcrumb[this.currentPathIdx];
    var to = this.breadcrumb[this.currentPathIdx+1];

    this.movingFrom = this.points[from];
    this.movingTo = this.points[to];

    this.journeyLength = $.V.magnitude(this.movingFrom, this.movingTo);
  },

  updateMove: function(){
    var distCovered = ($.tm - this.t_startMove) * this.moveSpeed;
    var fracJourney = distCovered / this.journeyLength;

    this.gearBall.pos = $.V.round($.V.lerp(this.movingFrom, this.movingTo, fracJourney));

    if (fracJourney > 1) {
      if (this.currentPathIdx+1 < this.breadcrumb.length-1){
        this.setMove();
        return;
      }

      this.gear = this.gearTo;
      this.moving = false;
      this.currentPathIdx = -1;
      this.breadcrumb.length = 0;
      this.gearBall.pos = $.V.clone(this.movingTo);
    }
  },

  update: function(){

    if (this.moving){
      this.updateMove();
      return;
    }

    if (this.gear !== this.engine.gear){
      this.gearTo = this.engine.gear;
      this.setMove();
    }
    
    this.currenGear.text = this.gear;
  }

});


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


$.GameTime = $.Base.extend({

  lastTime: null,
  frameTime: 0,
  deltaTime: 0,
  typicalFrameTime: 20,
  minFrameTime: 12,
  time: 0,

  start: function(){
    this.lastTime = Date.now();

    $.tm = this.time;
    $.dt = this.deltaTime;
    $.ft = this.frameTime;
  },

  tick: function(){
    var now = Date.now();
    var delta = now - this.lastTime;

    if (delta < this.minFrameTime ) {
      return false;
    }

    if (delta > 2 * this.typicalFrameTime) { // +1 frame if too much time elapsed
      $.ft = this.typicalFrameTime;
    } else {  
      $.ft = delta;      
    }

    this.frameTime = $.ft;
    $.dt = $.ft/1000;

    this.time += $.ft;
    $.tm = this.time;
    
    this.lastTime = now;

    return true;
  }

});


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


(function(){
  var w = window;
  var doc = w.document;
  doc.title = "BASE GAME";

  function $get(id){
    return doc.getElementById(id);
  }

  var gameCtn = $get("ctn");
  
  function $newCanvas(id){
    var cv = doc.createElement("canvas");
    cv.id = id;
    gameCtn.appendChild(cv);
    return cv;
  }

  function configGame(){
    var ele = doc.documentElement
      , body = doc.body;

    function getSize(which){
      var offset = "offset", scroll = "scroll";
      return Math.max(
        ele["client" + which], 
        ele[scroll + which], 
        ele[offset + which],
        body[scroll + which], 
        body[offset + which] 
      );
    }

    var w = getSize("Width") - 20;
    var h = getSize("Height") - 30;

    var max = { x: 1250, y: 750 };
    var min = { x: 950, y: 640 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    size.x = (size.x < min.x ? min.x : size.x);
    size.y = (size.y < min.y ? min.y : size.y);
    
    gameCtn.style.width = size.x + "px";
    gameCtn.style.height = size.y + "px";

    return {
      size: size,
      world: {
        margin: { x: 150, y: 20 }
      }
    };
  }

  function initGame(){

    w.Time = new $.GameTime();

    w.Controls = new $.Controls({
      container: gameCtn
    });

    w.game = new $.Game({
      cview: $newCanvas("viewport"),
      cworld: $newCanvas("world")
    });

    function pauseGame(){
      if (game.paused){
        game.mainModal.hide();
        game.play();
      }
      else {
        game.mainModal.show();
        game.stop(); 
      }
    }

    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();
    initGame();

    w.game.play();
  }

  w.onload = onDocLoad;

}());