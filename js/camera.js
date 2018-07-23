class Camera {
	constructor(values) {
		this.C = values.C;

	    this.d = values.d;
	    this.hx = values.hx;
	    this.hy = values.hy;

	    var proj = (values.V).projection(values.N);
		
		this.N = (values.N).normalize();
		
		this.V = (values.V).minus(proj);
    	this.V = (this.V).normalize();

	    this.U = (this.N).crossProduct(this.V);
	}
}