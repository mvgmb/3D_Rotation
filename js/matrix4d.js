function pVectorMatrix(v, m) {
    return new Point(m[0][0] * v.x + m[0][1] * v.y +
		     		 m[0][2] * v.z + m[0][3],
		     		 m[1][0] * v.x + m[1][1] * v.y +
		     		 m[1][2] * v.z + m[1][3],
		     		 m[2][0] * v.x + m[2][1] * v.y +
		     		 m[2][2] * v.z + m[2][3]);
}

function vVectorMatrix(v, m) {
    return new Vector(m[0][0] * v.x + m[0][1] * v.y +
		     		 m[0][2] * v.z + m[0][3],
		     		 m[1][0] * v.x + m[1][1] * v.y +
		     		 m[1][2] * v.z + m[1][3],
		     		 m[2][0] * v.x + m[2][1] * v.y +
		     		 m[2][2] * v.z + m[2][3]);
}

function mMatrixMatrix(m1, m2) {
    var m = new Array(4);
    for (var i = 0; i < 4; i++) {
		m[i] = new Array(4);
		for (var j = 0; j < 4; j++) {
		    m[i][j] = 0;
		    for (var k = 0; k < 4; k++) {
				m[i][j] += m1[i][k] * m2[k][j];
		    }
		}
    }
    return m;
}