let t_max = 10000;
let t_min = 0.001

class Sphere {

	constructor(radius, center, material) {
		this.radius = radius;
		this.center = center.clone();
		this.material = material;
		this.color = new THREE.Vector3(Math.random(), Math.random(), Math.random())
	}

	hit(ray, hit_record) {
		var oc = this.center.clone().sub(ray.A);
		var a = ray.B.dot(ray.B);
		var b = 2 * ray.B.dot(oc);
		var c = oc.dot(oc) - this.radius * this.radius;
		var discriminant = b * b - 4 * a * c;

		if (discriminant < 0) {
			return false;
		} else {
			var temp = (-b - Math.sqrt(discriminant)) / (2 * a);
			if (temp < t_max && temp > 0.001) {
				hit_record.t = temp;
				hit_record.p = ray.point_at_parameter(hit_record.t);
				hit_record.norm = this.center.clone().sub(hit_record.p).normalize();
				hit_record.attenuation = this.color.clone();
				return true;
			}
			temp = (-b + Math.sqrt(discriminant)) / (2 * a);
			if (temp < t_max && temp > 0.001) {
				hit_record.t = temp;
				hit_record.p = ray.point_at_parameter(hit_record.t);
				hit_record.norm = this.center.clone().sub(hit_record.p).normalize();
				hit_record.attenuation = this.color.clone();
				return true;
			}
		}
		return false;
	}

}

export {Sphere}
