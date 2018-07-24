function Matrix(u, v, n) {
    if (!(u instanceof Vector) ||
		!(v instanceof Vector) ||
		!(n instanceof Vector)) {
		console.log('u: ' + JSON.stringify(u));
		console.log('v: ' + JSON.stringify(v));
		console.log('n: ' + JSON.stringify(n));
		throw 'Is not a matrix';
    }
    this.a = u.x;
    this.b = u.y;
    this.c = u.z;

    this.d = v.x;
    this.e = v.y;
    this.f = v.z;

    this.g = n.x;
    this.h = n.y;
    this.i = n.z;
}

Matrix.prototype.timesVector = function(v) {
    if (!(v instanceof Vector)) {
		console.log('v: ' + JSON.stringify(v));
		throw 'v is not a vector';
    }
    var v = new Vector(this.a * v.x + this.b * v.y + this.c * v.z,
		      		   this.d * v.x + this.e * v.y + this.f * v.z,
		      		   this.g * v.x + this.h * v.y + this.i * v.z);
    return v;
};

Matrix.prototype.inverse = function() {
    var det = ((this.a)*(this.e)*(this.i) - (this.a)*(this.f)*(this.h)
	         - (this.b)*(this.d)*(this.i) + (this.b)*(this.f)*(this.g)
	         + (this.c)*(this.d)*(this.h) - (this.c)*(this.e)*(this.g));

    if (det == 0) {
		throw 'Matrix does not have an inverse matrix';
    }

    det = 1/det;
    
    var a, b, c, d, e, f, g, h, i;
    a = (((this.e)*(this.i) - (this.f)*(this.h))*det);
    b = (((this.f)*(this.g) - (this.d)*(this.i))*det);
    c = (((this.d)*(this.h) - (this.e)*(this.g))*det);
    
    d = (((this.c)*(this.h) - (this.b)*(this.i))*det);
    e = (((this.a)*(this.i) - (this.c)*(this.g))*det);
    f = (((this.b)*(this.g) - (this.a)*(this.h))*det);
    
    g = (((this.b)*(this.f) - (this.c)*(this.e))*det);
    h = (((this.c)*(this.d) - (this.a)*(this.f))*det);
    i = (((this.a)*(this.e) - (this.b)*(this.d))*det);

    var v1 = new Vector(a, d, g);
    var v2 = new Vector(b, e, h);
    var v3 = new Vector(c, f, i);

    var m = new Matrix(v1, v2, v3);
    return m;
};