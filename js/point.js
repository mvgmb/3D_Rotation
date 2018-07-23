class Point {
	constructor (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		// Setting normal to zero
		this.N = new Vector(0,0,0);
	}
}

Point.prototype.minus = function(pv) {
    if (pv instanceof Point) {
		var v = new Vector(this.x - pv.x, this.y - pv.y, this.z - pv.z);
		return v;
    } else if (pv instanceof Vector) {
		// same as point + (-v)
		var p = new Point(this.x - pv.x, this.y - pv.y, this.z - pv.z);
		return p;
    } else {
		console.log('pv: ' + JSON.stringify(pv));
		throw 'pv is neither a point or a vector';
    }
};

Point.prototype.plus = function(v) {
    if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var p = new Point(this.x + v.x, this.y + v.y, this.z + v.z);
    return p;
};
/*
Point.prototype.distance = function(p) {
	if (!(p instanceof Point)) {
		console.log('p: ' + JSON.stringify(p));
		throw 'p is not a point';
    }
    const dx = this.x - p.x;
    const dy = this.y - p.y;
    const dz = this.z - p.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
*/