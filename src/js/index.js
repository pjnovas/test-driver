
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