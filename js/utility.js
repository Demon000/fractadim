(function(){
	var degree = Math.PI / 180;
	var Utility = {
		rgbaToGray: function(r, g, b) {
			return r * 0.3 + g * 0.59 + b * 0.11;
		},
		imageToCanvas: function(img, w, h) {
			if(!w) {
				w = img.naturalWidth;
			}
			if(!h) {
				h = img.naturalHeight;
			}
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			canvas.width = w;
			canvas.height = h;
			context.fillStyle = '#fff';
			context.fillRect(0, 0, w, h);
			context.drawImage(img, 0, 0, w, h);
			
			return canvas;
		},
		canvasToImage: function(canvas, cb) {
			var result = new Image();
			result.onload = function() {
				cb(result);
			};
			result.src = canvas.toDataURL();
		},
		resizeImage: function(img, w, h, cb) {
			if(w == null) {
				w = h / img.naturalHeight * img.naturalWidth;
			} else if(h == null) {
				h = w / img.naturalWidth * img.naturalHeight;
			}
			var canvas = Utility.imageToCanvas(img, w, h);
			Utility.canvasToImage(canvas, cb);
		},
		cropImage: function(img, l, t, r, b, cb) {
			var canvas = Utility.imageToCanvas(img);
			var context = canvas.getContext('2d');

			var w = r - l;
			var h = b - t;

			var trimmedCanvas = document.createElement('canvas');
			var trimmedContext = trimmedCanvas.getContext('2d');
			var trimmedPixels = context.getImageData(l, t, w, h);
			trimmedCanvas.width = w;
			trimmedCanvas.height = h;
			trimmedContext.putImageData(trimmedPixels, 0, 0);

			Utility.canvasToImage(trimmedCanvas, cb);
		},
		trimImage: function(img, threshold, cb) {
			var canvas = Utility.imageToCanvas(img);
			var context = canvas.getContext('2d');
			var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = pixels.data;
			
			var bounds = {
				  top: null,
				  left: null,
				  right: null,
				  bottom: null
			};
			for (var i = 0; i < data.length; i += 4) {
				var grey = Utility.rgbaToGray(data[i], data[i + 1], data[i + 2]);
				if (grey <= threshold) {
				  var x = (i / 4) % canvas.width;
				  var y = Math.floor((i / 4) / canvas.width);

				  if (bounds.top == null) {
					bounds.top = y;
				  }
				  if (bounds.left == null || x < bounds.left) {
					bounds.left = x; 
				  }
				  if (bounds.right == null || x > bounds.right) {
					bounds.right = x; 
				  }
				  if (bounds.bottom == null || y > bounds.bottom) {
					bounds.bottom = y;
				  }
				}
			}
			Utility.cropImage(img, bounds.left, bounds.top, bounds.right, bounds.bottom, cb);
		},
		padImage: function(img, w, h, cb) {
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			canvas.width = w;
			canvas.height = h;
			context.fillStyle = '#fff';
			context.fillRect(0, 0, w, h);
			context.drawImage(img, 0, 0);
			Utility.canvasToImage(canvas, cb);
		},
		scaleImage: function(img, ws, hs, cb) {
			var w = img.naturalWidth * ws;
			var h = img.naturalHeight * hs;
			var canvas = Utility.imageToCanvas(img, w, h);
			Utility.canvasToImage(canvas, cb);		
		},
		binarizeImage: function(img, threshold, cb) {
			var canvas = Utility.imageToCanvas(img);
			var context = canvas.getContext('2d');
			var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = pixels.data;

			for (var i = 0; i < data.length; i += 4) {
				var grey = Utility.rgbaToGray(data[i], data[i + 1], data[i + 2]);
				data[i] = data[i + 1] = data[i + 2] = grey < threshold ? 0 : 255;
			}
			context.putImageData(pixels, 0, 0);
			Utility.canvasToImage(canvas, cb);
		},
		binaryImageToArray: function(img) {
			var canvas = Utility.imageToCanvas(img);
			var context = canvas.getContext('2d');
			var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
			var w = img.naturalWidth;

			var rem = [];

			for(var i = 0; i < data.length; i += 4) {
				rem.push(data[i]);
			}

			var arr = [];
			for(var i = 0; i < rem.length; i += w) {
				arr.push(rem.slice(i, i + w).map(function(x) {
					var r = 0;
					if(x == 0)
						r = 1;
					return r;
				}));
			}
			return arr;
		},
		arrayToHTML: function(a) {
		    var ahtml = "<div>";
		    a.forEach(function(l) {
		        var lhtml = "<div>";
		        l.forEach(function(v) {
		            lhtml += v;
		        });
		        lhtml += "</div>";
		        ahtml += lhtml;
		    });
		    ahtml += "</div>";
		    return ahtml;
		},
		arraySubset: function(a, sx, sy, ex, ey) {
			var ah = a.slice(sy, ey);
			var ahw = ah.map(function(v) {
				return v.slice(sx, ex);
			});
			return ahw;
		},
		arrayAverage: function(a) {
			var sum = a.reduce(function(a, b) {
			    return a + b;
			});
			var avg = sum / a.length;
			return avg;
		},
		arrayClearFill: function(a) {
			var c = a.map(function(l) {
			    return l.slice();
			});
			for(var i = 1; i < c.length - 1; i++) {
				for(var j = 1; j < c[i].length - 1; j++) {
					if(a[i - 1][j] && a[i + 1][j] && a[i][j - 1] && a[i][j + 1]) {
						c[i][j] = 0;
					}
				}
			}
			return c;
		},
		arrayIsEmpty: function(a) {
			return a.every(function(l) {
				return l.every(function(v) {
					return !v;
				});
			});
		}
	};
	window.Utility = Utility;
})();