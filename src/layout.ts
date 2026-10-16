// Editable 3D floor-plan layout. Units are metres; x runs left→right, z runs back→front.
// Change x/z/w/d or the door side of any room and the scene, camera framing and base slab follow.
export type Side = 'n' | 's' | 'e' | 'w'
export type RoomLayout = { x: number; z: number; w: number; d: number; door: Side }

const W = 6
const D = 5
const GAP = 0.4
const COL = W + GAP
const ROW = 3.9

export const ROOM_LAYOUT: Record<number, RoomLayout> = {
  1: { x: -COL, z: -ROW, w: W, d: D, door: 's' },
  2: { x: 0, z: -ROW, w: W, d: D, door: 's' },
  3: { x: COL, z: -ROW, w: W, d: D, door: 's' },
  4: { x: -COL, z: ROW, w: W, d: D, door: 'n' },
  5: { x: 0, z: ROW, w: W, d: D, door: 'n' },
  6: { x: COL, z: ROW, w: W, d: D, door: 'n' },
}

export const BUILDING_MARGIN = 0.5

export function buildingBounds() {
  const list = Object.values(ROOM_LAYOUT)
  const minX = Math.min(...list.map((r) => r.x - r.w / 2)) - BUILDING_MARGIN
  const maxX = Math.max(...list.map((r) => r.x + r.w / 2)) + BUILDING_MARGIN
  const minZ = Math.min(...list.map((r) => r.z - r.d / 2)) - BUILDING_MARGIN
  const maxZ = Math.max(...list.map((r) => r.z + r.d / 2)) + BUILDING_MARGIN
  return { minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 }
}
