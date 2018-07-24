class Point2d {
	constructor(x, y, i) {
		this.x = x;
		this.y = y;
		// i ~ original vertex
		this.i = i;
	}
}

Point2d.prototype.minus = function(pv) {
    if (pv instanceof Point2d) {
		var v = new Vector(this.x - pv.x, this.y - pv.y, 0);
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