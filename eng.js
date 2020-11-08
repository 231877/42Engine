'use strict';
let stack_errors = [], key = 0, loaded = 0, mloaded = 0, images = {},
    render = [], keylocks = {}, grid = {}, pause = false, editor = false,
	cameraes = [{'x': 0, 'y': 0}], current_camera = 0, zoom = 1, grid_size = 32, is_touch = false,
	keys = {
		'up': 1, 'down': 2, 'left': 4, 'right': 8,
		'active': 16, 'mode': 32, 'dclick': 64, 'uclick': 128,
		'move': 256, 'hover': 512
	}, memory = {}, mouse = { 'x': 0, 'y': 0 }, gui = [], touch = {'x': 0, 'y': 0};
function mset(val, value) { memory[val] = value || 0; }
function mget(val) { return memory[val]; }
function show_error(cvs, clr) { // вывод ошибок:
	if (stack_errors.length > 0) {
		if (cvs) {
			cvs.fillStyle = clr || '#fff';
			stack_errors.forEach(function(e, i) {
				add_gui(function(cvs) {
					cvs.globalAlpha = 1 - (stack_errors.length - (i + 1)) / stack_errors.length;
					cvs.fillText(i + ': ' + e, 6, 16 + 12 * i);
				});
			});
			cvs.globalAlpha = 1;
		} else {
			console.log('Найдены ошибки (' + stack_errors.length + '):');
			stack_errors.forEach(function(e, i) { console.error(i + ': ' + e); });
			stack_errors = [];
		}
	}
}
function add_error(msg) { stack_errors[stack_errors.length] = msg; }
function add_script(source) {
	if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) add_script(arguments[i]);
	else {
		mloaded++;
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = source;
		script.onload = function(e) { loaded++; }
		script.onerror = function() { return add_error(source + ' не найден!'); }
		document.body.appendChild(script);
	}
}
function add_image(source) {
	if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) add_image(arguments[i]);
	else {
		mloaded++;
		let img = new Image();
		img.src = source;
		img.onload = function(e) { loaded++; }
		img.onerror = function() { return add_error(source + ' не найден!'); }
		let path = source.split('/');
		if (path[0] == '.') path = path.splice(1, path.length - 1);	
		path[path.length - 1] = path[path.length - 1].replace('.png', '');
		images[path.join('.')] = img;
	}
}
function copy(source) {
	let arr = {};
	Object.keys(source).forEach(function(e) { arr[e] = source[e]; });
	return arr;
}
function add_rule(char, key) { 
	if (arguments.length > 2) for (let i = 0; i < arguments.length; i += 2) keylocks[arguments[i]] = arguments[i + 1];
	else keylocks[char] = key; 
}
function merge(col1, col2, val) {
	let ncol = '#', table = {'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15};
	for (let i = 1, a, b, ab; i < col1.length; i++) {
		a = (table[col1[i]] || col1[i]) - 0, b = (table[col2[i]] || col2[i]) - 0, ab = clamp(Math.abs(Math.floor(a + (b - a) * val)), 0, 15);
		ncol += Object.keys(table)[ab - 10] || ab;
	}
	return ncol;
}
function add(name) {
	let sum = 0;
	if (arguments.length > 1)
		for (let i = 0; i < arguments.length; i++) sum += keys[arguments[i]];
	else sum = keys[name];
	key |= sum;
}
function check(name, n) {
	if (arguments.length < 2) return ((key & keys[name]) > 0);
	else {
		let sum = 0;
		if (arguments.length > 2)
			for (let i = 1; i < arguments.length; i++) sum += keys[arguments[i]];
		else sum = keys[n];
		switch(name) {
			case 'and': return (this.key & sum) > 0; break;
			case 'or':
				for (let i = 1; i < arguments.length; i++)
					if ((this.key & this.list[arguments[i]]) > 0) return true;
			break;
		}
		return false;
	}
}
function clear(name) {
	let sum = 0;
	if (arguments.length > 1)
		for (let i = 0; i < arguments.length; i++) sum += keys[arguments[i]];
	else sum = keys[name];
	key &=~ sum;
}
function rect(x, y, w, h) { return ((mouse.x >= (x * zoom)) && (mouse.x <= ((x + w) * zoom)) && (mouse.y >= (y * zoom)) && (mouse.y <= ((y + (h || w))) * zoom)); }
function point_in_rect(px, py, x, y, w, h) { return ((px >= x) && (px <= (x + w)) && (py >= y) && (py <= (y + (h || w)))); }
function grect(x, y, w, h) {
	if (arguments.length == 1) {
		let arg = x;
		x = arg[0]; y = arg[1]; w = arg[2]; h = arg[3];
	}
	return (mouse.x - cameraes[current_camera].x >= x && mouse.x - cameraes[current_camera].x <= x + w && mouse.y - cameraes[current_camera].y >= y && mouse.y - cameraes[current_camera].y <= y + h);
}
function distance(x1, y1, x2, y2) { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); }
function direction(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
function sign(x) { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); }
function bsign(bool) { return bool - !bool; };
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
function add_gui(func) { gui[gui.length] = func; }
function add_canvas(id, upd, load) {
	try {
		let cvs = document.getElementById(id), node = cvs.parentNode;
		if (cvs) {
			// нажатие клавиш:
			window.onkeydown = function(e) {
				Object.keys(keylocks).forEach(function(f) {
					if (e.key == f) {
						add(keylocks[f]);
						e.preventDefault();
					}
				});
			}
			window.onkeyup = function(e) {
				Object.keys(keylocks).forEach(function(f) {
					if (e.key == f) {
						clear(keylocks[f]);
						e.preventDefault();
					}
				});
			}
			function newCoord(e) {
				mouse.x = cameraes[current_camera].x + e.offsetX;
				mouse.y = cameraes[current_camera].y + e.offsetY;
			};
			function newTCoord(e) {
				mouse.x = cameraes[current_camera].x + e.clientX;
				mouse.y = cameraes[current_camera].y + e.clientY;
			};
			// мышь и touchscreen:
			cvs.onmousemove = newCoord;
			cvs.onmouseup = function(e) {
				newCoord(e);
				add('uclick');
			}
			cvs.onmousedown = function(e) {
				newCoord(e);	
				add('dclick');
			}
			cvs.ontouchstart = function(e) {
				is_touch = true;
				newTCoord(e.changedTouches[0]);
				add('dclick');
				e.preventDefault();
			}
			cvs.ontouchend = function(e) {
				is_touch = false;
				newTCoord(e.changedTouches[0]);
				add('uclick');
				e.preventDefault();
			}
			cvs.ontouchmove = function(e) {
				newTCoord(e.changedTouches[0]);
				e.preventDefault();
			}
			let context = cvs.getContext('2d');
			function temp(t) {
				gui = [];
				if (loaded >= mloaded) {
					context.save();
					context.fillRect(0, 0, cvs.width, cvs.height);
					context.scale(zoom, zoom);
					context.translate(-cameraes[current_camera].x / zoom, -cameraes[current_camera].y / zoom);
					upd(t);
					render.sort(function(a, b) { return (a.obj.yr || a.obj.y) - (b.obj.yr || b.obj.y); }).forEach(function(e) {
						if (e.obj.update && !pause) e.obj.update();
						if (!e.obj.is_init && e.obj.initialize) {
							e.obj.initialize();
							e.obj.is_init = true;
						}
						e.func(context);
					});
					context.restore();
					render = [];
				} else load(loaded / mloaded, t);
				gui.reverse().forEach(function(e) { e(context); }); // gui.
				cvs.style.cursor = check('hover') ? 'pointer' : 'default';
				clear('hover', 'dclick', 'uclick');
				window.requestAnimationFrame(temp);
			}
			let obj = { 'id': cvs, 'cvs': context, 'update': temp };
			if (node) {
				function resize() {
					let tmp = new Image();
					tmp.src = cvs.toDataURL('image/png').replace('image/png', 'image/octet-stream');
					tmp.onload = function() {
						cvs.width = node.clientWidth;
						cvs.height = node.clientHeight;
						obj.context = cvs.getContext('2d');
						obj.context.imageSmoothingEnabled = false;
						obj.context.drawImage(tmp, 0, 0);
					}
				}
				window.onresize = function() { return resize(); }
				node.onresize = function() { return resize(); }
				resize();
			}
			return obj;
		} else throw Error('холст "' + id + '" не найден!');
	}
	catch(err) { add_error(err.message); }
}
let Obj = {
	'init': function(name, image_index) {
		this.x = 0, this.y = 0, this.image_index = image_index, this.name = name || 'undefined';
		let obj = copy(this);
		if (memory.editor) memory.editor.objects[memory.editor.objects.length] = obj;
		else memory.editor = { 'objects': [obj] }
		return obj;
	},
	'draw': function(func) { if (func) render[render.length] = { 'obj': this, 'func': func }; }
}
let Map = {
	'init': function(w, h, x, y) {
		this.grid = [], this.memory = {}, this.w = w, this.h = h,
		this.x = x || 0, this.y = y || 0;
		for(let i = 0; i < w; i++) {
			this.grid[i] = [];
			for(let j = 0; j < h; j++) this.grid[i][j] = 0;
		}
		return copy(this);
	},
	'set': function(i, j, val) { 
		try {
			this.grid[i][j] = val || 0;
		}
		catch(err) { add_error(err.message); }
	},
	'registry': function(val, value) { this.memory[val] = value; },
	'draw': function(func) {
		if (func) render[render.length] = { 'obj': this, 'func': func };
	},
	'get': function(i, j) { return this.grid[i - this.x][j - this.y]; },
	'path': function(i, j, ni, nj) {
		let points = [[i, j]], rpoints = [], count = 20;
		while (count) {
			for (let d = 0; d < 4; d++) {
				let xx = points[points.length - 1][0] + ((d == 0) - (d == 2)), yy = points[points.length - 1][1] + ((d == 3) - (d == 1));
				if (xx < this.grid.length && yy < this.grid[0].length && xx > -1 && yy > -1)
					if (this.grid[xx][yy] == 0) {
						let find = false;
						for (let k = 0; k < points.length; k++)
							if (points[k][0] == xx && points[k][1] == yy) {
								find = true;
								break;
							}
						if (!find) rpoints[rpoints.length] = [distance(xx, yy, ni, nj), xx, yy];
					}
			}
			if (rpoints.length > 0) {
				let c = rpoints.sort(function(a, b) { return a[0] - b[0]; })[0];
				points[points.length] = [c[1], c[2]];
				rpoints = [];
				if (c[1] == ni && c[2] == nj) break;
			} else break;
			if (count-- <= 0) break;
		}
		return points.slice(0, points.length);
	}
}
let Graphics = {
	'init': function(cvs) {
		this.cvs = cvs;
		return copy(this);
	},
	'rect': function(x, y, w, h, color, alpha, tp) {
		if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
		if (alpha != undefined) this.cvs.globalAlpha = alpha;
		if (tp) this.cvs[tp + 'Rect'](x, y, w, h); else this.cvs.fillRect(x, y, w, h);	
		if (alpha != undefined) this.cvs.globalAlpha = 1;
		return [x, y, w, h];
	},
	'text': function(text, x, y, color, alpha, size, font, tp) {
		if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
		if (alpha != undefined) this.cvs.globalAlpha = alpha;		
		if (size != undefined) this.cvs.font = size + 'px ' + (font || 'Arial');
		this.cvs[(tp || 'fill') + 'Text'](text, x, y); 
		if (alpha != undefined) this.cvs.globalAlpha = 1;
	},
	'triangle': function(x1, y1, x2, y2, x3, y3, color, alpha) {
		if (color) this.cvs.fillStyle = color;
		this.cvs.beginPath();
		this.cvs.lineTo(x1, y1);
		this.cvs.lineTo(x2, y2);
		this.cvs.lineTo(x3, y3);
		this.cvs.closePath();
		this.cvs.fill();
	},
	'line': function(x, y) {
		this.cvs.beginPath();
		if (arguments.length > 2) {
			for (let i = 0; i < arguments.length; i += 2) this.cvs.lineTo(arguments[i], arguments[i + 1]);
		} else this.cvs.lineTo(x, y);
		this.cvs.closePath();
		this.cvs.stroke();
	},
	'circle': function(x, y, range, a, b, color, alpha, tp) {
		if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
		if (alpha != undefined) this.cvs.globalAlpha = alpha;	
		this.cvs.beginPath();
		this.cvs.lineTo(x, y);
		this.cvs.arc(x, y, range, a, b);
		this.cvs.lineTo(x, y);
		this.cvs.closePath();
		this.cvs[tp || 'fill']();
		if (alpha != undefined) this.cvs.globalAlpha = 1;
	},
	'round': function(x, y, w, h, range, color, alpha, tp) {
		if (alpha != undefined) this.cvs.globalAlpha = alpha;
		if (color) this.cvs.fillStyle = color;
		this.cvs.beginPath();
			this.cvs.rect(x + range, y, w - range * 2, h);
			this.cvs.rect(x, y + range, w, h - range * 2);		
			this.cvs.lineTo(x, y + range);
			this.cvs.lineTo(x + range, y);
			this.cvs.lineTo(x + w - range, y);
			this.cvs.lineTo(x + w, y + range);
			this.cvs.lineTo(x + w, y + h - range);
			this.cvs.lineTo(x + w - range, y + h);
			this.cvs.lineTo(x + range, y + h);
			this.cvs.lineTo(x, y + h - range);
			this.cvs.moveTo(x, y + range);
			this.cvs.quadraticCurveTo(x, y, x + range, y);
			this.cvs.moveTo(x + w - range, y);
			this.cvs.quadraticCurveTo(x + w, y, x + w, y + range);
			this.cvs.moveTo(x + w, y + h - range);
			this.cvs.quadraticCurveTo(x + w, y + h, x + w - range, y + h);
			this.cvs.moveTo(x, y + h - range);
			this.cvs.quadraticCurveTo(x, y + h, x + range, y + h);
			if (tp) this.cvs[tp](); else this.cvs.fill();
		this.cvs.closePath();
		if (alpha != undefined) this.cvs.globalAlpha = 1;
		return [x, y, w, h];
	}
}

// objects work:
function search(name) {
	let list = [];
	if (memory.lobjects)
		if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) list = list.concat(search(arguments[i]));
		else
			memory.lobjects.forEach(function(e) { 
				if (e.name == name)
					list[list.length] = e;
			});
	return list;
}
function search_id(id) {
	let list = [];
	if (memory.lobjects)
		if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) list = list.concat(search_id(arguments[i]));
		else
			memory.lobjects.forEach(function(e) { 
				if (e.id == id)
					list[list.length] = e;
			});
	if (list.length > 1) return list;
	else if (list.length == 1) return list[0];
	else return false;
}
function csearch(name, obj) {
	let list = -1;
	search(name).forEach(function(e, i) { if (e == obj) return i; });
	return list;
}
function search_distance(name, x, y) {
	let _search = [];
	if (typeof(name) == 'object') name.forEach(function(e) { _search = _search.concat(search(e)); });
	else _search = search(name);
	return _search.sort(function(a, b) { return distance(x, y, a.x, a.y) - distance(x, y, b.x, b.y); });
}
function add_object(obj, x, y) {
	if (typeof(obj) == 'string') {
		if (memory.editor)
			for (let i = 0; i < memory.editor.objects.length; i++) {
				if (obj == memory.editor.objects[i].name) {
					obj = memory.editor.objects[i];
					break;
				}
			}
	}
	obj.x = x || 0, obj.y = y || 0;
	if (memory.lobjects) memory.lobjects[memory.lobjects.length] = copy(obj); else memory.lobjects = [copy(obj)];
	memory.lobjects[memory.lobjects.length - 1].id = '#id' + memory.lobjects.length;
	return memory.lobjects[memory.lobjects.length - 1];
}
function delete_object(obj) {
	if (memory.lobjects)
		for (let i = 0; i < memory.lobjects.length; i++) { 
			if (memory.lobjects[i] == obj) {
				if (memory.lobjects[i].delete) memory.lobjects[i].delete();
				delete memory.lobjects[i];
				return 1;
			}
		}
	return 0;
}
function loadLevel(src, map) {
	mloaded++;
	let script = document.createElement('script');
	script.src = src;
	script.onload = function(e) {
		memory.lobjects = [];
		Level.objects.forEach(function(f) {
			if (f != null) {
			add_object(Obj, f.x, f.y);
			Object.keys(f).forEach(function(k) {
				memory.lobjects[memory.lobjects.length - 1][k] = f[k];
			});
			}
		});
		if (Level.map) map.grid = Level.map;
		loaded++;
		save();
	}
	script.onerror = function() { return add_error(src + ' не найден!'); }
	document.body.appendChild(script);
}
// camera work:
function getWindowSize(canvas) { return {'w': canvas.id.width, 'h': canvas.id.height}; }
// loading / save:
function save(accept) {
	if (!editor || accept) {
		memory.save = [];
		memory.lobjects.forEach(function(e) { memory.save[memory.save.length] = copy(e); });
		if (memory.ach) {
			memory.sach = {};
			Object.keys(memory.ach).forEach(function(e) { memory.sach[e] = copy(memory.ach[e]); });
		}
	}
}
function load() {
	memory.lobjects = [];
	memory.save.forEach(function(e) { memory.lobjects[memory.lobjects.length] = copy(e); });
	if (memory.ach) {
		memory.ach = {};
		Object.keys(memory.sach).forEach(function(e) { memory.ach[e] = copy(memory.sach[e]); });
	}
}
