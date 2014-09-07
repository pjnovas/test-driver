
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