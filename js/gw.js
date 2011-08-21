var gw = gw || {};

/**
 * @todo
 * - Decide what to do with x/y vs. top/left:
 *   Currently the problem is that the canvas element uses top/left internally but the function itself
 *   uses x/y, which format should be used at the end.
 */

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
    functionCollisionObstacleStop: true,
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
  for (i = 0; i < this.shooters.length; i++) {
    this.shooters[i].draw();
  }
};

gw.shooter = function(player, playground) {
  this.player = player;
  this.playground = playground;

  Math.seedrandom();
  this.icon = new gw.shooterIcon(this, this.playground, undefined, Math.random() * this.playground.width, Math.random() * this.playground.height);
};

gw.shooter.prototype.draw = function() {
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

  this.left = x;
  this.top = y;
  this.image = undefined;
};

gw.shooterIcon.prototype.draw = function() {
  var playground = this.playground;
  var shooterIcon = this;
  fabric.Image.fromURL(this.imagepath, function(img) {
    img.set('left', shooterIcon.left);
    img.set('top', shooterIcon.top);
    playground.canvas.add(img);
    shooterIcon.image = img;
  });
};

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

gw.playground.prototype.regenerateObstacles = function(seed) {
  this.clearObstacles();
  return this.randomObstacles(10, seed);
};

gw.playground.prototype.randomObstacles = function(count, seed) {
  this.canvas.renderOnAddition = false;

  if (seed) {
    Math.seedrandom(seed);
  }
  else {
    var seed = Math.seedrandom();
  }
  console.log("generate obstacles with seed:" + seed);

  for (i = 0; i < count; i++) {
    var circle = new fabric.Circle({
      left: Math.random() * this.width,
      top: Math.random() * this.height,
      fill: '#000000',
      radius: Math.random()*30,
      selectable: false,
    });
    this.obstacles.push(new gw.obstacle(circle));
    this.canvas.add(circle);
  }
  this.canvas.renderAll();
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

  var step_size = (xend-xstart)/steps;
  this.circles = [];
  this.lines = [];
  var break_on_next = false;
  var line = undefined;

  this.canvas.renderOnAddition = false;
  for (var i = 0; i <= this.canvas.width; i++) {
    x = xstart + step_size * i;
    y = express.evaluate({x: x});
    var funcLeft =this.getFuncLeft(x);
    var funcTop = this.getFuncTop(y);

    this.circles[i] = circle = new fabric.Circle({
      left: funcLeft,
      top: funcTop,
      fill: '#000000',
      radius: 1,
      selectable: false,
    });
    this.canvas.add(circle);

    // Add line from the previous point to the current point.
    // The first point has no previous point.
    if (this.main.settings.functionLines && i > 0) {
      this.lines[i] = line = new fabric.Line([this.circles[i-1].left, this.circles[i-1].top,
                                              this.circles[i].left, this.circles[i].top]);
      line.selectable = false;
      this.canvas.add(line);
    }

    if (break_on_next) {
      break;
    }

    // End of drawing start on the collisition detection system.


    // Detect collision with borders.
    if (this.main.settings.functionCollisionBorderStop) {
      if (Math.abs(y) > this.playheight) {
        console.log("Collision-Border + x:" + x + " y:" + y);
        break_on_next = true;
      }
    }

    // Detect collision with obstacles.
    if (this.main.settings.functionCollisionObstacleStop && line) {
      for (var j = 0; j < this.obstacles.length; j++) {
        var collisionResult = this.collideLineCircle(this.obstacles[j].circle.left, this.obstacles[j].circle.top, this.obstacles[j].circle.radius, line);
        if (collisionResult) {
          console.log("collision");
//           console.log(this.obstacles[j].circle.left);
//           console.log(line);
//           this.obstacles[i]

          break_on_next = true;
        }
        else {
          console.log("no-collision");
        }
      }
    }
  };

  this.canvas.renderAll();
};

/**
 * Calculate the intersection between a line and a circle.
 *
 * Therefore the line elements(m, a) are generated, then the solutions of the following two equations are found.
 *
 * (x - xm)^2 + (y - ym)^2 = r^2
 * y = mx + ma
 *
 * =>
 * x^2 - 2 x * xm + xm^2 + (m*x + ma - ym)^2 - r^2 = 0
 * =>
 * x^2 - 2 x * xm + xm^2 + m^2*x^2 + 2 * m*x*(ma - ym) + (ma - ym)^2 - r^2 = 0;
 * =>
 * x^2 + m^2*x^2 - 2 x * xm + 2 * m*x*(ma - ym) + (ma - ym)^2 - r^2  + xm^2 = 0;
 *
 * First check D to be sure that a real solution exists.
 * If there is one go further and calculate the x position.
 */
gw.playground.prototype.collideLineCircle = function(xm, ym, r, line) {
  // Calc the line elements.
  var m = (line.y2 - line.y1) / (line.x2 - line.x1);
  var ma = line.y1 - m * line.x1;

  var a = 1 + Math.pow(m, 2.0);
  var b = - 2 * xm + 2 * m * ma - 2 * m * ym;
  // @todo:
  // xm seems missing
  var c = Math.pow((ma - ym), 2.0) - Math.pow(r, 2.0) + Math.pow(xm, 2.0);

  var D = Math.pow(b, 2.0) - 4 * a * c;

  if (D >= 0) {
    // The line crosses with the obstacle, but the x value has to be in the range of circle.
    var x1 = (- b + Math.sqrt(D))/(2 * a);
    var y1 = ma + m*x1;

    if (line.x1 > x1 && x1 < line.x2) {
      return [x1, y1];
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
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

gw.obstacle.prototype.addHit = function(circle) {
//   this.hits.push(new gw.obstacle(circle));
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
    g.playground.regenerateObstacles($("#obstacles-random-seed").val());
  });
});
})(jQuery);