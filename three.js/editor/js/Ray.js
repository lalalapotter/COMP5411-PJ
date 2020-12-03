class Ray {

	function

	constructor(A, B) {
		this.A = A.clone();
		this.B = B.clone().sub(A).normalize(); // unit direction vector
	};

	point_at_parameter(t) {

		return this.A.clone().add(this.B.clone().multiplyScalar(t));

	};

}

export {Ray}
