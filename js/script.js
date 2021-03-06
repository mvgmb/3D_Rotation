window.canvas = document.getElementById('canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth - sidenav.offsetWidth;
window.ctx = window.canvas.getContext('2d');

// Auxiliar function that creates an array rows x cols
function createArray(rows, cols, defaultValue) {
	var arr = [];
	// Creates all lines:
	for(var i=0; i < rows; i++){
	    // Creates an empty line
	    arr.push([]);
	    // Adds cols to the empty line:
	    arr[i].push( new Array(cols));
	    for(var j=0; j < cols; j++){
   	    	arr[i][j] = defaultValue;
	    }
	}
	return arr;
}

function barycentric(p, a, b, c) {
	if (!(p instanceof Point2d)||
		!(a instanceof Point2d)||
		!(b instanceof Point2d)||
		!(c instanceof Point2d)) {
		console.log('p: ' + JSON.stringify(p));
		throw 'p || a || b || c is not a point2d';
    }
    var v0 = b.minus(a),
    	v1 = c.minus(a),
    	v2 = p.minus(a);

    var invdet = 0;
    // Inverted because multiplication below is faster than division
   	if ((v0.x * v1.y - v1.x * v0.y) != 0) { 
   		var invdet = 1 / (v0.x * v1.y - v1.x * v0.y); // 1/det(T)
   	}

    var v = (v2.x * v1.y - v1.x * v2.y) * invdet;
    var w = (v0.x * v2.y - v2.x * v0.y) * invdet;
    var u = 1 - v - w;
    return {u, v, w};
}

window.onload = function () { 
    // Check browse support for File
    if (window.File && window.FileReader && window.FileList && window.Blob) {
		var cameraFileChooser = document.getElementById('cameraFile');
		var lightFileChooser = document.getElementById('lightFile');
		var objectFileChooser = document.getElementById('objectFile');
		var readBtn = document.getElementById('read');
		cameraFileChooser.addEventListener('change', fileReadingRoutine, false);
		lightFileChooser.addEventListener('change', fileReadingRoutine, false);
		objectFileChooser.addEventListener('change', fileReadingRoutine, false);
		readBtn.addEventListener('click', prepRoutine, false);

		var oxBtn = document.getElementById('ox');
		var oyBtn = document.getElementById('oy');
		var ozBtn = document.getElementById('oz');
		oxBtn.addEventListener('click', prepRotation, false);
		oyBtn.addEventListener('click', prepRotation, false);
		ozBtn.addEventListener('click', prepRotation, false);
    } 
    else { 
		alert("This navigator does not support Files");
    } 
};

function fileReadingRoutine(e) {
	// Get target id
	var id = e.target.id;

	// Get object from file
	var fileTobeRead = document.getElementById(id).files[0];

	// Setting label name
	var str = document.getElementById(id).value;
	document.getElementById(id + 'Label').innerHTML = str.split(/(\\|\/)/g).pop();

	// Initialize FileReader 
	var fileReader = new FileReader();

	// This function will be called after the FileReader loads
	fileReader.onload = function (e) {
		if (id === 'cameraFile') {
		    window.camFileTxt = fileReader.result;
		} else if (id === 'lightFile') {
		    window.lightFileTxt = fileReader.result;
		} else if (id === 'objectFile') {
		    window.objFileTxt = fileReader.result;
		}
    };

    // Read the file as text, eventually calling the function above
    fileReader.readAsText(fileTobeRead);
}

function readFiles() {
	var reader;
    try {
		reader = new Reader(window.camFileTxt);
		var values;

		window.camera = null;
		values = reader.readCamera();
		window.camera = new Camera(values);
		// Matriz de Mudanca de Base p camera
		window.cameraMatrix = new Matrix((window.camera).U,
					       			     (window.camera).V,
					    			     (window.camera).N);					    
    } catch (error) {
		window.alert(error);
    }
     try {
		reader = new Reader(window.lightFileTxt);
		window.light = null;
		window.light = reader.readLight();
    } catch (error) {
		window.alert(error);
    }
    try {
		reader = new Reader(window.objFileTxt);
		window.object = null;
		window.object = reader.readObject();
		// Initializing centroid
		window.object.centroid = new Point(0, 0, 0);
    } catch (error) {
		window.alert(error);
    }
    console.log(window.camera);
    console.log(window.light);
    console.log(window.object);
}

// Reads files + puts camera, light and object on view perspective + normalizes normals + finds centroid
function prepRoutine() {
	readFiles();

	var Pl_view, P_obj_view;

	// Transforms light source to camera coordinates
	Pl_view = cameraMatrix.timesVector(
		window.light.Pl.minus(window.camera.C));
	window.light.Pl = new Point(Pl_view.x, Pl_view.y, Pl_view.z);

	// Transforms every vertex to camera coordinates
	for (var i = 0; i < (window.object.V.length); i++) {
		P_obj_view = cameraMatrix.timesVector(
			window.object.V[i].minus(window.camera.C));
		window.object.V[i] = new Point(P_obj_view.x, P_obj_view.y, P_obj_view.z);
	}

	// Initializing variables for centroid calculus by Geometric Decomposition 
	var CA_sum = {x: 0, y: 0, z: 0};
	var A_sum = 0;

	for (var i = 0; i < (window.object.F.length); i++) {
		// Getting triagle and calculating its normal
		var a, b, c,
			v1, v2, v3,
			ab, ac;

		a = window.object.F[i].a;
		b = window.object.F[i].b;
		c = window.object.F[i].c;

		pa = window.object.V[a];
		pb = window.object.V[b];
		pc = window.object.V[c];

		ab = pb.minus(pa);
		ac = pc.minus(pa);

		var N = ac.crossProduct(ab);
		window.object.F[i].N = N.normalize();

		// Adding normals of the triangles to the vertexes
		window.object.V[a].N = (window.object.V[a].N).plus(N);
		window.object.V[b].N = (window.object.V[b].N).plus(N);
		window.object.V[c].N = (window.object.V[c].N).plus(N);

		// Calculate baricenter 
		var bx = (pa.x + pb.x + pc.x) / 3;
		var by = (pa.y + pb.y + pc.y) / 3;
		var bz = (pa.z + pb.z + pc.z) / 3;

		// Calculate area to define the weight this baricenter has
		// under the centroid
		var area = ab.crossProduct(ac).norm * 0.5;
		A_sum += area;

		CA_sum.x += bx * area;
		CA_sum.y += by * area;
		CA_sum.z += bz * area;
	}


	// Find centroid
	window.object.centroid.x = CA_sum.x / A_sum;
	window.object.centroid.y = CA_sum.y / A_sum;
	window.object.centroid.z = CA_sum.z / A_sum;

	// Normalizing vertexes normals
	for (var i = 0; i < (window.object.V.length); i++) {
		window.object.V[i].N = (window.object.V[i].N).normalize();
	}

	mainRoutine();
}

function mainRoutine() {
	window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);

	// Ordering faces (aka triangles) so eases up on the color calculus
	// Therefore the ones closer to the screen will be the first to be rendered
    window.object.F = window.object.F.sort(function(f1, f2) {
		var f1_avg = (window.object.V[f1.a].z +
				 	  window.object.V[f1.b].z +
				 	  window.object.V[f1.c].z)/3;
		var f2_avg = (window.object.V[f2.a].z +
				 	  window.object.V[f2.b].z +
				 	  window.object.V[f2.c].z)/3;
		return f1_avg - f2_avg;
    });

	window.object.S = [];

	// Transforming camera coordinates into screen coordinates and storing is S[]
	for (var i = 0; i < (window.object.V.length); i++) {
		var x = ((window.camera.d / window.camera.hx) 
			     *(window.object.V[i].x / window.object.V[i].z));
		var y = ((window.camera.d / window.camera.hy) 
	 		    *(window.object.V[i].y / window.object.V[i].z));

		x = Math.floor((x + 1) * window.canvas.width / 2);
		y = Math.floor((1 - y) * window.canvas.height / 2);
		
		window.object.S[i] = new Point2d(x, y, i);
	}

	// Create and initialize z_buffer with infinity values
	window.z_buffer = createArray(window.canvas.width, window.canvas.height, Infinity);

	// Draws each triangle
	for (var i = 0; i < (window.object.F.length); i++) {
		scanLine(i);
	}

	/* Show centroid on screen
	var r = ((window.camera.d / window.camera.hx) 
			*(window.object.centroid.x / window.object.centroid.z));
	var t = ((window.camera.d / window.camera.hy) 
	 		*(window.object.centroid.y / window.object.centroid.z));

	r = Math.floor((r + 1) * window.canvas.width / 2);
	t = Math.floor((1 - t) * window.canvas.height / 2);

	window.ctx.fillStyle = 'rgb(0,255,0)';
   	window.ctx.fillRect(r, t, 1, 1);
  	window.ctx.stroke();
	*/
}

function prepRotation(e) {
	var id = e.target.id;
	var deg = parseInt(document.getElementById('Radius').value);
	if (isNaN(deg)) { deg = 0; }
	deg = deg * Math.PI/180;

	var cosine = Math.cos(deg),
		sine = Math.sin(deg);

	rotation(id, deg, cosine, sine);
}

function rotation(id, deg, cosine, sine) {
	// Matrix to rotate vectors, without translation
    var rotMatrix = [[1, 0, 0, 0],
	 	     		 [0, 1, 0, 0],
		     		 [0, 0, 1, 0],
		     		 [0, 0, 0, 1]];
	// Translates centroid to the origin		     		 
	var toOrigin = [[1, 0, 0, -window.object.centroid.x],
	 	    		[0, 1, 0, -window.object.centroid.y],
		    		[0, 0, 1, -window.object.centroid.z],
		    		[0, 0, 0, 1]];
	// Translates centroid back to it's original position
    var fromOrigin = [[1, 0, 0, window.object.centroid.x],
	 	      		  [0, 1, 0, window.object.centroid.y],
		        	  [0, 0, 1, window.object.centroid.z],
		      		  [0, 0, 0, 1]];
	// This will be the result matrix that will rotate the vertexes
	var translatedRotMatrix = [[1, 0, 0, 0],
	 					       [0, 1, 0, 0],
			    			   [0, 0, 1, 0],
			       			   [0, 0, 0, 1]];

	if (id == 'oz') {
 		matRot = [[cosine, sine, 0, 0],
		      	  [-sine, cosine, 0, 0],
		      	  [0, 0, 1, 0],
		      	  [0, 0, 0, 1]];  
	} 
	else if (id == 'oy') {
		matRot = [[cosine, 0, -sine, 0],
		      	  [0, 1, 0, 0],
		      	  [sine, 0, cosine, 0],
		      	  [0, 0, 0, 1]];
	} 
	else if (id == 'ox') {
		matRot = [[1, 0, 0, 0],
		      	  [0, cosine, -sine, 0],
		      	  [0, sine, cosine, 0],
		      	  [0, 0, 0, 1]];
	}

	translatedRotMatrix = mMatrixMatrix(toOrigin, translatedRotMatrix);
	translatedRotMatrix = mMatrixMatrix(matRot, translatedRotMatrix);
	translatedRotMatrix = mMatrixMatrix(fromOrigin, translatedRotMatrix);
	// Always just rotation, vectors don't need to be translated
	rotMatrix = mMatrixMatrix(matRot, rotMatrix);

	for (var i = 0; i < (window.object.V.length); i++) {
		// Stores normal, so we can rotate it
		var N = window.object.V[i].N;
		// Transforms points, translating them to the origin, rotating and 
		// translating them back 
		window.object.V[i] = pVectorMatrix(window.object.V[i], translatedRotMatrix);
		// rotaciona os vetores, que não devem sofrer translação
		window.object.V[i].N = vVectorMatrix(N, rotMatrix).normalize();
    }
    // Rotates centroid
    window.object.centroid = pVectorMatrix(window.object.centroid, translatedRotMatrix);

    mainRoutine();
}

// Scan Line Polygon Fill Algorithm
function scanLine(i) {
	// i is the index of the triangles array (F)
	// a,b,c are the triangle vertex
	var a = window.object.S[window.object.F[i].a];
	var b =	window.object.S[window.object.F[i].b];
	var c = window.object.S[window.object.F[i].c];
	var s1,s2,s3;
	// Sort a,b,c so v1<=v2<=v3
	if (a.y <= b.y && a.y <= c.y) {
		s1 = a;
		if (b.y <= c.y) { 
			s2 = b;
			s3 = c;
		} else {
			s2 = c;
			s3 = b;
		}
	} else if (b.y <= a.y && b.y <= c.y) {
		s1 = b;
		if (a.y <= c.y) { 
			s2 = a;
			s3 = c;
		} else {
			s2 = c;
			s3 = a;
		}
	} else {
		s1 = c;
		if (a.y <= b.y) { 
			s2 = a;
			s3 = b;
		} else {
			s2 = b;
			s3 = a;
		}
	}	
	drawTriangle(s1, s2, s3, i, a, b, c);
}	

function drawTriangle(v1, v2, v3, i, s1, s2, s3) {
	// Check for bottom-flat triangle
	if (v2.y == v3.y) {
    	fillBottomFlatTriangle(v1, v2, v3, i, s1, s2, s3);
  	}
  	// Check for top-flat triangle
  	else if (v1.y == v2.y) {
    	fillTopFlatTriangle(v1, v2, v3, i, s1, s2, s3);
  	} 
  	// General case - split the triangle in a topflat and bottom-flat one
  	else {
    	var x4 = v1.x + ((v2.y - v1.y) / (v3.y - v1.y)) * (v3.x - v1.x),
    		y4 = v2.y;
    	var v4 = new Point2d(x4, y4);
    	fillBottomFlatTriangle(v1, v2, v4, i, s1, s2, s3);
    	fillTopFlatTriangle(v2, v4, v3, i, s1, s2, s3);
  	}
}

function fillBottomFlatTriangle(v1, v2, v3, i, s1, s2, s3) {
  var invslope1, invslope2;
	// Handling division by zero
	if (v2.y - v1.y == 0) {
		invslope1 = 0;
	} else {
		invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
	}
	if (v3.y - v1.y == 0) {
		invslope2 = 0;
	} else {
   		invslope2 = (v3.x - v1.x) / (v3.y - v1.y);
    }
    
	if (invslope1 > invslope2) {
		var tmp = invslope2;
		invslope2 = invslope1;
		invslope1 = tmp;
	}
	
    var curx1 = v1.x;
  	var curx2 = v1.x;

    for (var y = v1.y; y <= v2.y; y++) {
    
    	for (var k = curx1; k <= curx2; k++) {
			prePhong(k, y, s1, s2, s3, i);
		}
	   	curx1 += invslope1;
    	curx2 += invslope2;
  	}
}

function fillTopFlatTriangle(v1, v2, v3, i, s1, s2, s3) {
	var invslope1, invslope2; 

	// Handling division by zero
	if (v3.y - v1.y == 0) {
		invslope1 = 0;
	} else { 
		invslope1 = (v3.x - v1.x) / (v3.y - v1.y); 
	}
	if (v3.y - v2.y == 0) {
		invslope2 = 0;
	} else {
		invslope2 = (v3.x - v2.x) / (v3.y - v2.y);
	}
 	
	var curx1 = v3.x;
	var curx2 = v3.x;

	if (invslope1 < invslope2) {
		var tmp = invslope2;
		invslope2 = invslope1;
		invslope1 = tmp;
	}
	
	// Scanline y == y
	for (var y = v3.y; y >= v1.y; y--) {
	
		for (var k = curx1; k <= curx2; k++) {
			prePhong(k, y, s1, s2, s3, i);
			
	}
	    curx1 -= invslope1;
	    curx2 -= invslope2;
	}
}

function prePhong(x, y, s1, s2, s3, i) {
	// Calculating barycentric coordinates using the screen points
    var bar = barycentric(new Point2d(x, y), s1, s2, s3);

    // Original 3d points
    var a = window.object.V[window.object.F[i].a],
    	b = window.object.V[window.object.F[i].b],
    	c = window.object.V[window.object.F[i].c];

   	// p is the aproximation of the 3d point coordinate 
   	// p = u*a + v*b + w*c
	var pz = (a.z * bar.u) + (b.z * bar.v) + (c.z * bar.w);
	x = Math.round(x);
  	
	if (x >= 0 && x < window.canvas.width && y >= 0 && y < window.canvas.height){
		if (pz < window.z_buffer[x][y]) {
			window.z_buffer[x][y] = pz;
			var px = (a.x * bar.u) + (b.x * bar.v) + (c.x * bar.w),
	   	    	py = (a.y * bar.u) + (b.y * bar.v) + (c.y * bar.w);

	    	var N = (((a.N.scalarMult(bar.u)).plus(b.N.scalarMult(bar.v))).plus(c.N.scalarMult(bar.w)));

	    	var s = new Point2d(x, y, i);
		    		
	    	phong(N, new Point(px, py, pz), s);
	   	}
   }
}

// N is the normal (already normalized), p is aproximation of the point in 3d and s is the 2d screen location 
function phong(N, p, s) {
	// Normalize the Normal
	N = N.normalize();
	// V = (-1) * p
    var V = (new Vector(-p.x, -p.y, -p.z)).normalize();
    // L = Pl - p
    var L = (window.light.Pl.minus(p)).normalize();

    var ka = window.light.ka;
    var ks = window.light.ks;
    var kd = window.light.kd;
    var Ia = window.light.Ia;
    var Od = window.light.Od;
    var Il = window.light.Il;
    var n = window.light.n;

 	// If V.N < 0 , then N = -N
    if (V.dotProduct(N) < 0) {
		N = N.scalarMult(-1);
    }
	
	// If N.L < 0, then neither difuse or specular components
    if (N.dotProduct(L) < 0) {
    	kd = 0;
    	ks = 0;
    }

	// R = 2(L.N)N - L
    var R = (N.scalarMult(((N.dotProduct(L)) * 2))).minus(L);
    R = R.normalize();
    
    // If cosRV < 0, then there's no specular light
   	var cosRV = R.dotProduct(V);
    if (cosRV < 0) {
		ks = 0;
    }

    var cosNL = N.dotProduct(L);

    var IlOd = Il.internalMult(Od);

    // Iamb = Ia.ka
    var Iamb = Ia.scalarMult(ka);

    // Id = kd*(N.L) * (IlOd)
    var Id = IlOd.scalarMult(kd * cosNL);

    // Is = ks*(R.V)^n * Il
    var Is = Il.scalarMult(ks * Math.pow(cosRV, n));

    // total = ambient + difuse + specular
    var I = Iamb.plus(Id).plus(Is);

    I.x = Math.min(I.x, 255);
    I.y = Math.min(I.y, 255);
    I.z = Math.min(I.z, 255);

	window.ctx.fillStyle = 'rgb(' + I.x + ',' + I.y + ',' + I.z +')';
   	window.ctx.fillRect(s.x, s.y, 1, 1);
  	window.ctx.stroke();
}