var gw = gw || {};


gw.mainObject = function(width, height) {
  this.width = width;
  this.height = height;

  this.canvas = new fabric.Canvas('gw-canvas');
  this.playground = new gw.playground(this, 50, this.width, 30, this.height, 0, 0);
  this.playground.drawCordSystem();
//   this.playground.drawFunction(10, 100, 20);

  this.players = [new gw.player(this.playground, "foo1"), new gw.player(this.playground, "foo2")];
  this.players[0].drawShooters();
  this.players[1].drawShooters();

  // Setup config
  this.settings = {
    functionLength: this.canvas.width,
    functionLines: true,
    functionCollisionBorderStop: true,
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

gw.player = function(playground, name, icon, color) {
  this.name = name;
  this.icon = icon;
  this.color = color;
  this.playground = playground

  this.shooters = [];
  this.shooters[0] = new gw.shooter(this, this.playground);
};

gw.player.prototype.drawShooters = function() {
  for (i = 0; i < this.shooters.size; i++) {
    this.shooters[i].draw();
  }
};

gw.shooter = function(player, playground) {
  this.player = player;
  this.playground = playground;
  this.icon = new gw.shooterIcon(this, this.playground, undefined, Math.random() * 100, Math.random() * 100);
};

gw.shooter.draw = function() {
  this.icon.draw();
};
// gw.shooter.addPlayground = addPlayground;


gw.shooterIcon = function(shooter, playground, icon, x, y) {
  this.shooter = shooter;
  this.playground = playground;

  if (icon == undefined) {
    icon = "images/face-smile.png"
  }
  this.imagepath = icon;

  this.posx = x;
  this.posy = y;
  this.image = undefined;
};

gw.shooterIcon.draw = function() {
  this.image = new fabric.Image.fromURL(this.imagepath);
  this.playground.add(this.image);
};
// gw.shooterIcon.addPlayground = addPlayground;

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

  // The circles which blocks the way
  this.obstacles = [];
  this.obstaclesHits = [];
};

addPlayground = function(element) {
  this.playground = element;
};

gw.playground.prototype.add = function(element) {
  this.canvas.add(element);
};

gw.playground.prototype.clearObstacles = function() {
  for (i = 0; i < this.obstacles.length; i++) {
    this.canvas.remove(this.obstacles[i].circle);
  }
};

gw.playground.prototype.regenerateObstacles = function() {
  this.clearObstacles();
  return this.randomObstacles(10);
};

gw.playground.prototype.randomObstacles = function(count) {
  for (i = 0; i < count; i++) {
    var circle = new fabric.Circle({
      left: Math.random() * this.width,
      top: Math.random() * this.height,
      fill: '#000000',
      radius: Math.random()*30,
      selectable: false,
    });
    this.obstacles.push(new gw.obstacle(circle));
    console.log(circle);
    this.canvas.add(circle);
  }
}

gw.playground.prototype.drawCordSystem = function() {
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
  if (xstart == undefined) {
    xstart = 0;
  }
  if (xend == undefined) {
    xend = this.playwidth;
  }
  if (steps == undefined) {
    steps = this.main.settings.functionLength;
  }

  var i = 0;
  var step_size = (xend-xstart)/steps;
  this.circles = [];
  this.lines = [];

  this.canvas.renderOnAddition = false;
  for (i = 0; i <= this.canvas.width; i++) {
    x = xstart + step_size * i;
    y = express.evaluate({x: x});

    this.circles[i] = circle = new fabric.Circle({
      left: this.getFuncLeft(x),
      top: this.getFuncTop(y),
      fill: '#000000',
      radius: 1,
      selectable: false,
    });
    this.canvas.add(circle);

    // Add line from the previous point to the current point.
    // The first point has no previous point.
    if (this.main.settings.functionLines && i > 0) {
      this.lines[i] = line = new fabric.Line([this.circles[i-1].left, this.circles[i-1].top, this.circles[i].left, this.circles[i].top]);
      line.selectable = false;
      this.canvas.add(line);
    }

    // Detect collision with borders.
    if (this.main.settings.functionCollisionBorderStop) {
      if (Math.abs(y) > this.playheight) {
        break;
      }
    }
  };

  this.canvas.renderAll();
};

gw.playground.prototype.deleteFunction = function() {
  this.canvas.renderOnAddition = false;

  for (i = 0; i <= this.circles.size(); i++) {
    this.cir
  }
};

gw.playground.prototype.getFuncLeft = function(x) {
  return (x/100)*(this.width/2) + this.getMiddleX();
};

gw.playground.prototype.getFuncTop = function(y) {
  return this.getMiddleY() - (y/100)*(this.height/2);
};

gw.playground.prototype.getMiddleX = function() {
  return this.left + this.width/2;
};

gw.playground.prototype.getMiddleY = function() {
  return this.top + this.height/2;
};

gw.obstacle = function(circle) {
  this.hits = [];
  this.circle = circle;
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
  $("#obstacles-clear").click(function() {
    g.playground.clearObstacles();
  });

  $("#obstacles-regenerate").click(function() {
    g.playground.regenerateObstacles();
  });
});
})(jQuery);