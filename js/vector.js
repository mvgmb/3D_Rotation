class Vector {
	constructor(x, y, z) {
		if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
			console.log('x: ' + x + '\n' + 'y: ' + y + '\n' + 'z: ' + z);
			throw 'Not a vector';
		}
		this.x = x;
		this.y = y;
		this.z = z;
		this.norm = Math.sqrt(this.dotProduct(this));
	}	
}

Vector.prototype.scalarMult = function(k) {
	var v = new Vector(this.x * k, this.y * k, this.z * k);
    return v;
}

Vector.prototype.dotProduct = function(v) {
	if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var num = (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
    return num;
}

Vector.prototype.crossProduct = function(v) {
	if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var v = new Vector(this.y * v.z - this.z * v.y,
		      		   this.z * v.x - this.x * v.z,
		     		   this.x * v.y - this.y * v.x);
    return v;
}

Vector.prototype.internalMult = function(v) {
	if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
	var v = new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
	return v;
}

Vector.prototype.normalize = function() {
	var aux = 0;
	if (this.norm != 0) aux = 1 / this.norm;
	var v = new Vector(this.x*aux, this.y*aux, this.z*aux);
    return v;
}

Vector.prototype.projection = function(v) {
    if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var proj = v.scalarMult(this.dotProduct(v)/v.dotProduct(v));
    return proj;
};

Vector.prototype.minus = function(v) {
    if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var v = new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
    return v;
};

Vector.prototype.plus = function(v) {
    if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var v = new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    return v;
};
