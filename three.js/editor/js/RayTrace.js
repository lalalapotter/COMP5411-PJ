import {Ray} from "./Ray.js";
import {Sphere} from "./Sphere.js";

class HitRecord {
	constructor(t, p, norm) {
		this.t = t;
		this.p = p;
		this.norm = norm;
	}
}

function random_in_unit_sphere() {
	var p = new THREE.Vector3(0, 0, 0);
	do {
		p = (new THREE.Vector3(Math.random(), Math.random(), Math.random())).multiplyScalar(2).sub(new THREE.Vector3(1, 1, 1));
	} while ((p.x * p.x + p.y * p.y + p.z * p.z) >= 1.0)
	return p;
}

function lambert_scatter(ray, hit_record) {
	hit_record.ray = new Ray(hit_record.p.clone(), hit_record.p.clone().add(hit_record.norm).add(random_in_unit_sphere()));
	return true;
}

function reflect(ray_in, norm) {
	return ray_in.clone().sub(norm.clone().multiplyScalar(2 * norm.dot(ray_in)));
}

function metal_scatter(ray, hit_record) {
	var reflected_dir = reflect(ray.B, hit_record.norm);
	hit_record.ray = new Ray(hit_record.p, hit_record.p.clone().add(reflected_dir).add(random_in_unit_sphere()));
	return reflected_dir.dot(hit_record.norm) < 0;
}

let t_max = 10000;
let max_depth = 50;

function color(ray, world, depth) {
	let hit_record = new HitRecord(t_max, null, null);
	if (world.hit(ray, hit_record)) {
		// console.log(`Depth ${depth}: Hit sphere no. ${hit.index}`)
		if (depth < max_depth && hit_record.scatter_fn(ray, hit_record)) {
			var attenuation = hit_record.attenuation.clone();
			return attenuation.multiply(color(hit_record.ray, world, depth + 1));
		} else {
			return new THREE.Vector3(0, 0, 0);
		}
	}
	return new THREE.Vector3(0.5, 0.7, 1.0);
}

const material_scatter_map = {
	"MeshLambertMaterial": lambert_scatter,
	"MeshStandardMaterial": metal_scatter
}

class World {
	constructor() {
		this.Spheres = [];
		this.hit = (ray, hit_record) => {
			let hit_anything = false;
			let temp_hit_record = new HitRecord(t_max, null, null);
			let t_min = t_max;
			for (let sphere of this['Spheres']) {
				if (sphere.hit(ray, temp_hit_record)) {
					hit_anything = true;
					if (t_min > temp_hit_record.t) {
						t_min = temp_hit_record.t;
						hit_record.t = temp_hit_record.t;
						hit_record.p = temp_hit_record.p.clone();
						hit_record.norm = temp_hit_record.norm.clone();
						hit_record.scatter_fn = material_scatter_map[sphere.material.type];
						hit_record.attenuation = temp_hit_record.attenuation;
						hit_record.index = this['Spheres'].indexOf(sphere);
					}
				}
			}
			return hit_anything;
		}
	}
}

export function exportRayTrace(scene, camera) {

	// Convert three.js objects to our own objects.
	var world = new World();
	for (let item of scene.children) {
		if (item.type !== "Mesh") {
			continue;
		}
		if (item.name === "Sphere"){
			world.Spheres.push(new Sphere(item.scale.x, item.position, item.material));
		}
	}

	// Process the image size according to the camera
	var camera_position = camera.position;
	var camera_lookat = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
	var camera_up = new THREE.Vector3(0, 1, 0).applyEuler(camera.rotation);
	var camera_x = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation);

	var near = camera.near * 1;
	var half_height = near * Math.tan(camera.fov / 2 * Math.PI / 180);
	var half_width = half_height * camera.aspect;

	var image_center = camera.position.clone().add(camera_lookat.clone().multiplyScalar(near));
	var lower_left_corner = image_center.clone().sub(camera_x.clone().multiplyScalar(half_width).add(camera_up.clone().multiplyScalar(half_height)));

	var height_pixel = 800;
	var width_pixel = Math.floor(height_pixel * camera.aspect);
	var ret = `P3\n${width_pixel} ${height_pixel}\n255\n`;

	var num_sample = 10;

	// Do ray tracing for the scene.
	for (let h = height_pixel; h > 0; h = h - 1) {
		for (let w = 0; w < width_pixel; w = w + 1) {
			var pixel_upper_left = lower_left_corner.clone().add(camera_x.clone().multiplyScalar(2 * half_width * w / width_pixel)).add(camera_up.clone().multiplyScalar(2 * half_height * h / height_pixel));
			var ray_colors = new THREE.Vector3(0, 0, 0);
			for (let ns = 0; ns < num_sample; ns = ns + 1) {
				var sample_position = pixel_upper_left.clone().add(camera_x.clone().multiplyScalar(2 * half_width * Math.random() / width_pixel)).add(camera_up.clone().multiplyScalar(2 * half_height * Math.random() / height_pixel));
				var ray = new Ray(camera_position, sample_position.sub(camera_position).normalize());
				ray_colors.add(color(ray, world, 0));
			}
			ray_colors.divideScalar(num_sample).multiplyScalar(255);
			ret += `${Math.floor(ray_colors.x)} ${Math.floor(ray_colors.y)} ${Math.floor(ray_colors.z)}\n`;
		}
	}

	return ret;

}
