
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
