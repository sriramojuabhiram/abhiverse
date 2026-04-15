import { useAppStore } from '../store/appStore'
import { NetworkScene } from './NetworkScene'
import { HelixScene } from './HelixScene'
import { OrbitalScene } from './OrbitalScene'
import { LatticeScene } from './LatticeScene'

const SCENES = [NetworkScene, HelixScene, OrbitalScene, LatticeScene]

export function SceneManager() {
  const section = useAppStore(s => s.section)
  const Scene = SCENES[section] ?? NetworkScene
  return <Scene />
}
