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

export function exportRayTrace( scene, camera ) {

	// Convert three.js objects to our own objects.
	const boxes = [];
	const spheres = [];
	for (let item of scene.children){
		if ( item.type !== "Mesh" ) {
			continue;
		}
		switch (item.name) {
			case "Box":
				boxes.push(new Box(item.position, item.scale.x, item.scale.y, item.scale.z));
				break;
			case "Sphere":
				spheres.push(new Sphere(item.scale.x, item.position));
		}
	}

	// Process the image size according to

	// Do ray tracing for the scene.
	console.log('')

	return 0;

}
