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
			}
		}

		/* === private === */

		var translateTo2D = function (x, y, z, canvas) {
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
		}

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

			createjs.Ticker.addEventListener('tick', $.proxy(this._tick, this));
		}
		Canvas.prototype._tick = function () {
			this.figures.forEach(function (figure) {
				figure.tick(this);
			}, this);
			this.stage.update();
		}
		Canvas.prototype.addFigure = function (args) {
			var figure = new Figure(args, this.stage);
			this.figures.push(figure);

			return figure;
		}

		var Element = function (args) {
			console.log('Element constructor');
			this.color = args.color || '#000';
			this.progress = typeof args.progress !== 'undefined' ? args.progress : 100;
			this.shape = new createjs.Shape();
			this.animate = args.animate || $.noop;
		}
		Element.prototype.stop = function () {
			this.animate = $.noop();
		}

		var Dot = function (args) {
			Element.call(this, args);
			console.log('Dot constructor', this)

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

			var onDisplay = translateTo2D(rotatedCoord.x, rotatedCoord.y, rotatedCoord.z, canvas);

			if (! onDisplay) this.shape.visible = false;
			else {
				this.shape.visible = true;
				this.shape.x = canvas.stage.canvas.width / 2 + (onDisplay.x * parentFigure.scale);
				this.shape.y = canvas.stage.canvas.height / 2 + (onDisplay.y * parentFigure.scale);
				this.shape.regX = this.shape.regY = onDisplay.scale * parentFigure.scale / 2;
				this.shape.scaleX = this.shape.scaleY = onDisplay.scale * parentFigure.scale;
			}
		}

		var Figure = function (args, stage) {
			var args = args || {};
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

			this.elements = args.elements || [];
			this.elements.forEach(function (element) {
				this.stage.addChild(element.shape);
			}, this);
		}
		Figure.prototype.tick = function (canvas) {
			var figure = this;
			this.animate();
			this.elements.forEach(function (element) {
				element.tick(canvas, figure);
			});
		}
		Figure.prototype.render = function () {
			
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