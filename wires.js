// wires.js
// Yuya Miyazaki
// clustium Inc.

if (typeof Wires !== 'undefined') {
	console.error('Wires is already defined.');
}
else {
	var Wires = (function (){
		'use strict';

		/* === public === */

		var Wires = {
			newCanvas: function (id) {
				return new Canvas(id);
			},

			dot : function (args) {
				return new Dot(args);
			},

			line : function (args) {
				return new Line(args);
			},

			curve : function (args) {
				return new Curve(args);
			},

			translateTo2D: function (x, y, z, canvas) {
				var displayX, displayY;
				var depth = 400;
				var distance = 500;
				if (canvas && canvas.config) {
					depth = canvas.config.depth;
					distance = canvas.config.distance;
				}

				if (z <= -distance) return false;

				return {
					x: x / (z + distance) * depth,
					y: y / (z + distance) * depth,
					scale : distance / (z + distance)
				};
			},

			translateTo3D: function (x, y, z, canvas) {
				var x = x - $('#canvas').width()/2; //TODO
				var y = y - $('#canvas').height()/2;
				var displayX, displayY;
				var depth = 400;
				var distance = 500;
				if (canvas && canvas.config) {
					depth = canvas.config.depth;
					distance = canvas.config.distance;
				}
				var z = z || 0;
				if (z <= -distance) return false;

				return {
					x: x * (z + distance) / depth,
					y: y * (z + distance) / depth,
					z: z
				};
			}

		}

		/* === private === */

		var getRotatedCoord = function (x, y, z, rotateX, rotateY, rotateZ) {
			var x = x || 0;
			var y = y || 0;
			var z = z || 0;

			var rotateX = rotateX || 0;
			var rotateY = rotateY || 0;
			var rotateZ = rotateZ || 0;

			// rotateX
			if (rotateX) {
				var deg = Math.atan2(z, y) - rotateX;
				var r = Math.sqrt(y*y + z*z);
				y = r * Math.cos(deg);
				z = r * Math.sin(deg);
			}

			// rotateY
			if (rotateY) {
				var deg = Math.atan2(x, z) - rotateY;
				var r = Math.sqrt(z*z + x*x);
				z = r * Math.cos(deg);
				x = r * Math.sin(deg);
			}

			// rotateZ
			if (rotateZ) {
				var deg = Math.atan2(y, x) - rotateZ;
				var r = Math.sqrt(x*x + y*y);
				x = r * Math.cos(deg);
				y = r * Math.sin(deg);
			}

			return {
				x: x,
				y: y,
				z: z
			}
		}

		var Canvas = function (id) {
			var canvasObject = document.getElementById(id);
			if (! canvasObject) {
				console.error('Canvas not found.');
				return false;
			}

			this.stage = new createjs.Stage(canvasObject);
			this.figures = [];
			this.count = 0;
			this.tick = $.noob;

			createjs.Ticker.addEventListener('tick', $.proxy(this._tick, this));
		}
		Canvas.prototype._tick = function () {
			this.figures.forEach(function (figure) {
				figure._tick(this);
			}, this);
			this.stage.update();
		}
		Canvas.prototype.addFigure = function (args) {
			var figure = new Figure(args, this.stage);
			this.figures.push(figure);

			return figure;
		}

		var Element = function (args) {
			this.color = args.color || '#000';
			this.progress = typeof args.progress !== 'undefined' ? args.progress : 100;
			this.shape = new createjs.Shape();
			this.animate = args.animate || $.noop;
			this.figure = null;
			this.perspective = true;
		}
		Element.prototype.stop = function () {
			this.animate = $.noop();
		}

		var Dot = function (args) {
			Element.call(this, args);

			var args = args || {};
			this.x = args.x || 0;
			this.y = args.y || 0;
			this.z = args.z || 0;
			this.size = args.size || 1;
			this.shape.graphics.beginFill(this.color).drawCircle(0, 0, this.size); // !!!
		};
		inherits(Dot, Element);
		Dot.prototype.tick = function (canvas, parentFigure) {
			this.animate();
			var rotatedCoord = getRotatedCoord(this.x, this.y, this.z, parentFigure.rotateX, parentFigure.rotateY, parentFigure.rotateZ);

			var on2dCoords = Wires.translateTo2D(this.figure.x + rotatedCoord.x, this.figure.y + rotatedCoord.y, this.figure.z + rotatedCoord.z, canvas);

			if (! on2dCoords) this.shape.visible = false;
			else {
				var displayX = canvas.stage.canvas.width / 2 + (on2dCoords.x * parentFigure.scale);
				var displayY = canvas.stage.canvas.height / 2 + (on2dCoords.y * parentFigure.scale);
				this.shape.visible = true;
				this.shape.x = displayX;
				this.shape.y = displayY;
				this.shape.regX = this.shape.regY = on2dCoords.scale * parentFigure.scale / 2;
				if (this.perspective) this.shape.scaleX = this.shape.scaleY = on2dCoords.scale * parentFigure.scale;
			}
		}

		var Line = function (args) {
			Element.call(this, args);

			var args = args || {};
			this.stX = args.stX || 0;
			this.stY = args.stY || 0;
			this.stZ = args.stZ || 0;
			this.enX = args.enX || 0;
			this.enY = args.enY || 0;
			this.enZ = args.enZ || 0;
			this.width = args.width || 1;
			this.shape.graphics.beginFill(this.color).moveTo(this.stX, this.stY).lineTo(this.enX, this.enY).endStroke().closePath;
		};
		inherits(Line, Element);
		Line.prototype.tick = function (canvas, parentFigure) {
			this.animate();
			var rotatedStCoord = getRotatedCoord(this.stX, this.stY, this.stZ, parentFigure.rotateX, parentFigure.rotateY, parentFigure.rotateZ);
			var rotatedEnCoord = getRotatedCoord(this.enX, this.enY, this.enZ, parentFigure.rotateX, parentFigure.rotateY, parentFigure.rotateZ);

			var on2dCoordsSt = Wires.translateTo2D(this.figure.x + rotatedStCoord.x, this.figure.y + rotatedStCoord.y, this.figure.z + rotatedStCoord.z, canvas);
			var on2dCoordsEn = Wires.translateTo2D(this.figure.x + rotatedEnCoord.x, this.figure.y + rotatedEnCoord.y, this.figure.z + rotatedEnCoord.z, canvas);

			if (! on2dCoordsSt && ! on2dCoordsEn) this.shape.visible = false;
			else {
				var displayStX = canvas.stage.canvas.width / 2 + (on2dCoordsSt.x * parentFigure.scale);
				var displayStY = canvas.stage.canvas.height / 2 + (on2dCoordsSt.y * parentFigure.scale);
				var displayEnX = canvas.stage.canvas.width / 2 + (on2dCoordsEn.x * parentFigure.scale);
				var displayEnY = canvas.stage.canvas.height / 2 + (on2dCoordsEn.y * parentFigure.scale);

				this.shape.graphics.clear().moveTo(displayStX, displayStY).beginStroke(this.color).lineTo(displayEnX, displayEnY).endStroke();
				this.shape.visible = true;
				this.shape.regX = this.shape.regY = /* on2dCoords.scale * */parentFigure.scale / 2;
				if (this.perspective) this.shape.scaleX = this.shape.scaleY = /* on2dCoords.scale * */ parentFigure.scale;
				// console.log(displayStX, displayStY, displayEnX, displayEnY)
			}
		}

		var Figure = function (args, stage) {
			var args = args || {};
			this.container = new createjs.Container();
			stage.addChild(this.container);
			this.x = args.x || 0;
			this.y = args.y || 0;
			this.z = args.z || 0;
			this.rotateX = args.rotateX || 0;
			this.rotateY = args.rotateY || 0;
			this.rotateZ = args.rotateZ || 0;
			this.scale = args.scale || 1;
			this.hidden = args.hidden || false;
			this.stage = stage;
			this.animate = args.animate || $.noop;
			this.addElements(args.elements);
			this.zIndex(args.zIndex || 1);
			// this.container.hitArea = (new createjs.Shape()).graphics.beginFill("#000").drawCircle(0, 0, this.size); //TODO
		}
		Figure.prototype._tick = function (canvas) {
			var figure = this;
			this.animate();
			this.elements.forEach(function (element) {
				element.tick(canvas, figure);
			});
		}
		Figure.prototype.render = function () {
			
		}
		Figure.prototype.addElements = function (elements) {
			if (! $.isArray(elements)) elements = [elements];
			var figure = this;
			this.elements = elements || [];
			this.elements.forEach(function (element) {
				element.figure = figure;
				this.container.addChild(element.shape);
			}, this);
		}
		Figure.prototype.zIndex = function (index) {
			this.stage.setChildIndex(this.container, index);
			// console.log(this.stage.getChildIndex(this.container)) TODO なぜか常に -1 になる
		}

		return Wires;
	})();
}


/* omajinai */
var console = console || { log: $.noop, error: $.noop };

function inherits(ctor, superCtor) {
	ctor.super_ = superCtor;
	ctor.prototype = Object.create(superCtor.prototype, {
	constructor: {
		value: ctor,
		enumerable: false,
		writable: true,
		configurable: true
	}
	});
}