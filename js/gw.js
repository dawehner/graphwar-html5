var gw = gw || {};


gw.mainObject = function(width, height) {
  this.width = width;
  this.height = height;

  this.canvas = new fabric.Canvas('gw-canvas');
};

gw.mainObject.prototype.setWidth = function(width) {
  this.width = width;
};

gw.player = function(name, icon = "", color = "") {
  
};

gw.shooter = function(player) {
  this.player = player;
};
