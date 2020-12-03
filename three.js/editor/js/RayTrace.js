import {Vector3} from "../../build/three.module";

class Sphere {

	constructor(radius, center) {
		this.radius = radius;
		this.center = center;
	}

}

class Box {

	constructor(center, height, width, length) {
		this.center = center;
		this.height = height;
		this.width = width;
		this.length = length;
	}

}

class Ray {

	constructor(A, B) {
		this.A = A;
		this.B = B;
	};

	function
	point_at_parameter(t) {

		return this.A.add(this.B.multiplyScalar(t));

	};

}

function color(ray, world){
	return 0;
}

export function exportRayTrace(scene, camera) {

	// Convert three.js objects to our own objects.
	var world = {
		'Boxes': [],
		'Spheres': [],
		'Lights': []
	};
	for (let item of scene.children) {
		if (item.type !== "Mesh") {
			continue;
		}
		switch (item.name) {
			case "Box":
				world['Boxes'].push(new Box(item.position, item.scale.x, item.scale.y, item.scale.z));
				break;
			case "Sphere":
				world['Spheres'].push(new Sphere(item.scale.x, item.position));
		}
	}

	// Process the image size according to the camera
	var camera_position = camera.position;
	var camera_lookat = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
	var camera_up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
	var camera_x = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

	var half_height = camera.znear * Math.tan(camera.near);
	var half_width = half_height * camera.aspect;

	var image_center = camera.position.add(camera.near * camera_lookat);
	var lower_left_corner = image_center - new THREE.Vector3(half_width * camera_x, half_height * camera_up, 0);

	var height_pixel = 800;
	var width_pixel = height_pixel * camera.aspect;

	var num_sample = 4;
	var max_depth = 4;

	// Do ray tracing for the scene.
	for (let h = height_pixel; h > 0; h = h - 1) {
		for (let w = 0; w < width_pixel; w = w + 1) {
			var pixel_upper_left = lower_left_corner.add(camera_x.multiplyScalar(w)).add(camera_up.multiplyScalar(h));
			var ray_colors = 0;
			for (let ns = 0; ns < num_sample; ns = ns + 1) {
				var sample_position = pixel_upper_left.add(camera_x.multiplyScalar(Math.random())).add(camera_up.multiplyScalar(Math.random()));
				var ray = new Ray(camera_position, sample_position);
				ray_colors += color(ray, world);
			}
			console.log(ray_colors / num_sample);
		}
	}

	return 0;

}
