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
			createDot: function (args) {
				return new Dot(args);
			},
			createFigure: function (args) {
				return new Figure(args);
			}
		}

		/* === private === */

		var Dot = function (args) {
			console.log('Dot', this)
			var args = args || {};
			this.x = args.x || 0;
			this.y = args.y || 0;
			this.z = args.z || 0;
			this.color = args.color || '#000';
			this.size = args.size || 1;
			this.progress = typeof args.progress !== 'undefined' ? args.progress : 1;
		}
		Dot.prototype.draw = function () {
			console.log(this)
		}

		var Figure = function () {
			var args = args || {};
			this.elements = args.elements || [];
			this.x = args.x || 0;
			this.y = args.y || 0;
			this.z = args.z || 0;
			this.rotateX = args.rotateX || 0;
			this.rotateY = args.rotateY || 0;
			this.scale = args.scale || 0;
			this.hidden = args.hidden || false;
		}
		Figure.prototype.rotate = function () {

		}
		Figure.prototype.move = function () {
			
		}
		Figure.prototype.scale = function () {
			
		}
		Figure.prototype.tick = function () {
			
		}
		Figure.prototype.render = function () {
			
		}

		return Wires;
	})();
}

var console = console || { log: $.noop, error: $.noop };