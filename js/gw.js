var gw = gw || {};


gw.mainObject = function(width, height) {
  this.width = width;
  this.height = height;

  this.canvas = new fabric.Canvas('gw-canvas');
  this.playground = new gw.playground(this, 50, this.width, 30, this.height, 0, 0);
  this.playground.drawCordSystem();
//   this.playground.drawFunction(10, 100, 20);

  // Setup config
  this.settings = {
    functionLength: 100,
  };
};

gw.mainObject.prototype.testRect = function() {
  var rect = new fabric.Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red'
  });
  this.canvas.add(rect);
};

gw.mainObject.prototype.render = function() {
  this.playground.render();
}

gw.mainObject.prototype.setWidth = function(width) {
  this.width = width;
};

gw.player = function(name, icon, color) { };

gw.shooter = function(player) {
  this.player = player;
};

gw.executeFunction = function(expression) { };


/**
 * Here the actual things are drawn into.
 *
 * @param playwidth
 *    The width in the size of the playground. For example 50
 * @param width
 *    The width in the size of the canvas element.
 *
 * @param top
 *   Where from the top does the playground starts.
 * @param left
 *   Where from the left does the playground starts.
 */
gw.playground = function(mainObject, playwidth, width, playheight, height, top, left) {
  this.main = mainObject;
  this.canvas = this.main.canvas;

  this.width = width;
  this.playwidth = playwidth;
  this.height = height;
  this.playheight = playheight;
  this.top = top;
  this.left = left;
};

gw.playground.prototype.drawCordSystem = function() {
  console.log(this);
  this.xline = new fabric.Line([this.left, this.top + this.height/2,
                               this.left + this.width, this.top + this.height/2]);
  this.yline = new fabric.Line([this.left + this.width/2, this.top,
                               this.left + this.width/2, this.top + this.height]);
  this.yline.selectable = this.xline.selectable = false;

  this.xlabel1 = new fabric.Text('haaaaaalo', {
    fontfamily: 'Delicious_500',
    left: 200, top: 200, 
    fill: '#123456',
  });

  this.canvas.add(this.xline);
  this.canvas.add(this.yline);

  this.canvas.add(this.xlabel1);
//   this.main.canvas.add(this.xlabel2);
//   this.main.canvas.add(this.ylabel1);
//   this.main.canvas.add(this.ylabel2);

//   console.log(this.xlabel1);
}

gw.playground.prototype.render = function() {
  this.drawCordSystem();
}

gw.playground.prototype.drawFunction = function(express, xstart, xend, steps) {
  if (steps == undefined) {
    steps = this.main.settings.functionLength;
  }

  var i = 0;
  var step_size = (xend-xstart)/steps
  for (i = 0; i <= steps; i++) {
    x = xstart + step_size * i;
    y = express.evaluate({x: x});

    this.canvas.add(new fabric.Circle({
      left: this.left + this.getFuncLeft(x),
      top: this.top + this.getFuncTop(y),
      fill: '#000000', 
      radius: 1,
      selectable: false,
    }));
  }
};

gw.playground.prototype.getFuncLeft = function(x) {
  return x*(200/(this.playwidth/2)) + this.getMiddleX() ;
};

gw.playground.prototype.getFuncTop = function(y) {
  return this.getMiddleY() - y*(200/(this.playheight/2));
};

gw.playground.prototype.getMiddleX = function() {
  return this.left + this.width/2;
};

gw.playground.prototype.getMiddleY = function() {
  return this.top + this.height/2;
};

gw.shooterIcon = function(shooter, icon, x, y) {
  this.shooter = shooter;

  if (icon == undefined) {
    icon = "images/face-smile.png"
  }

  this.posx = x;
  this.posy = y;
};


/**
 * The jquery part.
 */
(function ($) {
$(document).ready(function() {
  $("#function-submit").click(function() {
    var func = $("#function-input").val();

    var expr = Parser.parse(func);
    g.playground.drawFunction(expr, -100, 100);
  });
});
})(jQuery);