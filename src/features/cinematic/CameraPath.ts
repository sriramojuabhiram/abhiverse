// CameraPath.ts — Cinematic camera flythrough spline path
import * as THREE from 'three'
import { planets } from '../../scenes/planetary/planetData'

/** 
 * Build a CatmullRomCurve3 that flies through all planetary sections.
 * The path goes: space overview → About → Skills → Experience → Projects → Contact → slow orbit ending
 */
export function buildCinematicPath(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [
    // Start far out — wide space view
    new THREE.Vector3(0, 12, 20),
    // Approach About planet
    new THREE.Vector3(
      planets[0].cameraPosition[0] + 4,
      planets[0].cameraPosition[1] + 3,
      planets[0].cameraPosition[2] + 6,
    ),
    // Fly past Skills
    new THREE.Vector3(
      planets[1].cameraPosition[0] - 2,
      planets[1].cameraPosition[1] + 4,
      planets[1].cameraPosition[2] + 5,
    ),
    // Sweep through Experience
    new THREE.Vector3(
      planets[2].cameraPosition[0] + 3,
      planets[2].cameraPosition[1] + 2,
      planets[2].cameraPosition[2] + 4,
    ),
    // Orbit Projects
    new THREE.Vector3(
      planets[3].cameraPosition[0] - 3,
      planets[3].cameraPosition[1] + 3,
      planets[3].cameraPosition[2] + 5,
    ),
    // End at Contact — settle near first section
    new THREE.Vector3(
      planets[0].cameraPosition[0],
      planets[0].cameraPosition[1] + 0.5,
      planets[0].cameraPosition[2] + 1,
    ),
  ]

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
}

/**
 * Build corresponding look-at targets along the path.
 * Each look-at point is the planet position for that segment.
 */
export function buildLookAtPath(): THREE.CatmullRomCurve3 {
  const lookPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0), // Look at center of scene
    new THREE.Vector3(...planets[0].position),
    new THREE.Vector3(...planets[1].position),
    new THREE.Vector3(...planets[2].position),
    new THREE.Vector3(...planets[3].position),
    new THREE.Vector3(...planets[0].position),
  ]

  return new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5)
}
