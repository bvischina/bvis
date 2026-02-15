// import * as THREE from 'three';
// import { geoMercator } from 'd3-geo';
// import { GeoJSONFeature } from '../types';

// // Center map roughly on China
// const PROJECTION_CENTER = [104.0, 36.0] as [number, number];
// const PROJECTION_SCALE = 80;

// // Create projection function
// const projection = geoMercator()
//   .center(PROJECTION_CENTER)
//   .scale(PROJECTION_SCALE)
//   .translate([0, 0]);

// export const projectToVector3 = (lon: number, lat: number): THREE.Vector3 => {
//   const [x, y] = projection([lon, lat]) || [0, 0];
//   // Invert Y because Three.js Y is up, but screen coordinates Y is down
//   return new THREE.Vector3(x, -y, 0);
// };

// export const createShapesFromFeature = (feature: GeoJSONFeature): THREE.Shape[] => {
//   const shapes: THREE.Shape[] = [];
//   const { geometry } = feature;

//   if (geometry.type === 'Polygon') {
//     const coords = geometry.coordinates as number[][][];
//     shapes.push(createShapeFromPolygon(coords));
//   } else if (geometry.type === 'MultiPolygon') {
//     const coords = geometry.coordinates as number[][][][];
//     coords.forEach((polygonCoords) => {
//       shapes.push(createShapeFromPolygon(polygonCoords));
//     });
//   }

//   return shapes;
// };

// const createShapeFromPolygon = (coordinates: number[][][]): THREE.Shape => {
//   const shape = new THREE.Shape();

//   // Exterior ring
//   const exterior = coordinates[0];
//   exterior.forEach((point, index) => {
//     const [x, y] = projection([point[0], point[1]]) || [0, 0];
//     if (index === 0) {
//       shape.moveTo(x, -y);
//     } else {
//       shape.lineTo(x, -y);
//     }
//   });

//   // Holes (Interior rings)
//   for (let i = 1; i < coordinates.length; i++) {
//     const hole = coordinates[i];
//     const holePath = new THREE.Path();
//     hole.forEach((point, index) => {
//       const [x, y] = projection([point[0], point[1]]) || [0, 0];
//       if (index === 0) {
//         holePath.moveTo(x, -y);
//       } else {
//         holePath.lineTo(x, -y);
//       }
//     });
//     shape.holes.push(holePath);
//   }

//   return shape;
// };
import { geoMercator } from 'd3-geo';
import * as THREE from 'three';

const PROJECTION_CENTER = [104.0, 36.0] as [number, number];
const PROJECTION_SCALE = 80;

const projection = geoMercator()
  .center(PROJECTION_CENTER)
  .scale(PROJECTION_SCALE)
  .translate([0, 0]);

export const projectToVector3 = (lon: number, lat: number): THREE.Vector3 => {
  const [x, y] = projection([lon, lat]) || [0, 0];
  return new THREE.Vector3(x, -y, 0);
};