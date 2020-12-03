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
		this.A = A.clone();
		this.B = B.clone();
	};

	function
	point_at_parameter(t) {

		return this.A.clone().add(this.B.clone().multiplyScalar(t));

	};

}

function color(ray, world) {
	return new THREE.Vector3(0, 0, 0);
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
	var camera_lookat = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
	var camera_up = new THREE.Vector3(0, 1, 0).applyEuler(camera.rotation);
	var camera_x = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation);

	var half_height = camera.near * Math.tan(camera.fov * Math.PI / 180);
	var half_width = half_height * camera.aspect;

	var image_center = camera.position.clone().add(camera_lookat.clone().multiplyScalar(camera.near));
	var lower_left_corner = image_center.clone().sub(camera_x.clone().multiplyScalar(half_width).add(camera_up.clone().multiplyScalar(half_height)));

	var height_pixel = 800;
	var width_pixel = Math.floor(height_pixel * camera.aspect);
	var ret = `P3\n${height_pixel} ${width_pixel}\n255\n`;

	var num_sample = 4;
	var max_depth = 4;

	// Do ray tracing for the scene.
	for (let h = height_pixel; h > 0; h = h - 1) {
		for (let w = 0; w < width_pixel; w = w + 1) {
			var pixel_upper_left = lower_left_corner.clone().add(camera_x.clone().multiplyScalar(2 * half_width * w / width_pixel)).add(camera_up.clone().multiplyScalar(2 * half_height * h / height_pixel));
			var ray_colors = new THREE.Vector3(0, 0, 0);
			for (let ns = 0; ns < num_sample; ns = ns + 1) {
				var sample_position = pixel_upper_left.clone().add(camera_x.clone().multiplyScalar(2 * half_width * Math.random() / width_pixel)).add(camera_up.clone().multiplyScalar(2 * half_height * Math.random() / height_pixel));
				var ray = new Ray(camera_position, sample_position);
				ray_colors.add(color(ray, world));
			}
			ray_colors = ray_colors.divideScalar(num_sample);
			ret += `${ray_colors.x} ${ray_colors.y} ${ray_colors.z}\n`;
		}
	}

	return ret;

}
