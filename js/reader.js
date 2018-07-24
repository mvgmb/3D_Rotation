function Reader(str) {
	this.str = str;
	this.count = 0;
}

Reader.prototype.nextWord = function() {
	while (this.count < this.str.length && 
			(this.str[this.count] === ' ' || 
				this.str[this.count] === '\n')) {
		this.count++;
	}
	if (this.count == this.str.length) {
		throw 'No word has been found';
	}
	var r = '';
	for (; this.count < this.str.length; this.count++) {
		var char = this.str[this.count];
		if (char === ' ' || char === '\n') {
			break;
		}
		r = r + char;
	}
	return r;
};

Reader.prototype.nextInt = function() {
	var r = null;
	try {
		r = parseInt(this.nextWord());
		while (isNaN(r)) {
			r = parseInt(this.nextWord());
		}
	} catch (error) {
		throw 'No integer has been found';
	}
	return r;
};

Reader.prototype.nextFloat = function() {
	var r = null;
	try {
		r = parseFloat(this.nextWord());
		while (isNaN(r)) {
			r = parseFloat(this.nextWord());
		}
	} catch (error) {
		throw 'No float has been found';
	}
	return r;
};

Reader.prototype.readCamera = function() {
	this.count = 0;
	var C, N, V,
		hx, hy,
		d,
		x, y, z;

	try {
		x = this.nextFloat();
		y = this.nextFloat();
		z = this.nextFloat();
		C = new Point(x,y,z);


		x = this.nextFloat();
		y = this.nextFloat();
		z = this.nextFloat();
		N = new Vector(x,y,z);

		x = this.nextFloat();
		y = this.nextFloat();
		z = this.nextFloat();
		V = new Vector(x,y,z);

		d = this.nextFloat();

		hx = this.nextFloat();
		hy = this.nextFloat();

	} catch (error) {
		throw 'File is not in the correct Camera format\n' + error;
    }
    return {C, N, V, d, hx, hy};
};

Reader.prototype.readLight = function() {
	this.count = 0;
	var Pl, ka,	Ia,	kd,	Od,	ks,	Il,	n,
	x, y, z;
	try {
		x = this.nextFloat();
		y = this.nextFloat();
		z = this.nextFloat();
		Pl = new Point(x, y, z);
		
		ka = this.nextFloat();

		x = this.nextInt();
		y = this.nextInt();
		z = this.nextInt();
		Ia = new Vector(x, y, z);
		
		kd = this.nextFloat();

		x = this.nextFloat();
		y = this.nextFloat();
		z = this.nextFloat();
		Od = new Vector(x, y, z);
		
		ks = this.nextFloat();

		x = this.nextInt();
		y = this.nextInt();
		z = this.nextInt();
		Il = new Vector(x, y, z);
		
		n = this.nextFloat();
    } catch (err) {
		throw 'File is not in the correct Light format\n' + err;
    }
    return {Pl, ka, Ia, kd, Od, ks, Il, n};
};

// Each vertex is a point object
// Each face is a triangle object
Reader.prototype.readObject = function() {
    this.count = 0;
    
    // V - vertex, F - face/triangle
    var V = [], F = [],
		x, y, z;

	    try {
		var no_vertex = this.nextInt(),
		    no_faces = this.nextInt();

		// Read every vertex
		for (var i = 0; i < no_vertex; i++) {
		    x = this.nextFloat();
		    y = this.nextFloat();
		    z = this.nextFloat();
		    V[i] = new Point(x, y, z);
		}
		// Read every face/triangle
		for (i = 0; i < no_faces; i++) {
		    F[i] = {};
		    // Subtract 1 because there's no 0 points in the entry file 
		    F[i].a = this.nextInt() - 1;
		    F[i].b = this.nextInt() - 1;
		    F[i].c = this.nextInt() - 1;
		    F[i].N = new Vector(0,0,0);
		}
    } catch (error) {
		throw 'File is not in the correct Object format\n' + error;
    }
    return {V, F};
};