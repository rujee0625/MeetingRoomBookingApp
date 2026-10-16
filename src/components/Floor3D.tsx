import { useEffect, useMemo, useRef, useState, type ElementRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { MathUtils, MOUSE, TOUCH, Vector3, type Group } from 'three'
import { ROOMS, roomState, type Booking, type Room } from '../data'
import { ROOM_LAYOUT, buildingBounds, type RoomLayout, type Side } from '../layout'
import { MinusIcon, PlusIcon, ResetIcon, RotateLeftIcon, RotateRightIcon } from './icons'

const warn = console.warn
console.warn = (...a: unknown[]) => {
  if (typeof a[0] === 'string' && a[0].includes('THREE.Clock')) return
  warn(...a)
}

type Props = {
  bookings: Booking[]
  date: string
  selectedId: number | null
  onSelect: (id: number) => void
  visibleIds?: number[]
}

type Api = { zoomBy: (f: number) => void; reset: () => void; rotateBy: (rad: number) => void }
type Sides = { n: boolean; s: boolean; e: boolean; w: boolean }
const START_SIDES: Sides = { n: false, s: true, e: true, w: false }

const BOUNDS = buildingBounds()
const CAM_DIR: [number, number, number] = [1, 0.95, 1]
const CAM_DIST = 40
const TALL = 1.35
const LOW = 0.4
const WALL_T = 0.14
const DOOR = 1.5
const FLOOR_TOP = 0.22

const SELECT_COLOR = '#2563eb'
const HOVER_COLOR = '#60a5fa'

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

type Vec3 = [number, number, number]

function Block({
  pos,
  size,
  color,
  emissive,
  shadow = true,
}: {
  pos: Vec3
  size: Vec3
  color: string
  emissive?: string
  shadow?: boolean
}) {
  return (
    <mesh position={pos} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.6 : 0} />
    </mesh>
  )
}

function wallSegments(len: number, door: boolean) {
  if (!door) return [{ c: 0, l: len }]
  const l = (len - DOOR) / 2
  return [
    { c: -(DOOR / 2 + l / 2), l },
    { c: DOOR / 2 + l / 2, l },
  ]
}

function Wall({ side, layout, near }: { side: Side; layout: RoomLayout; near: boolean }) {
  const { w, d, door } = layout
  const h = near ? LOW : TALL
  const hasDoor = door === side
  const alongX = side === 'n' || side === 's'
  const len = alongX ? w : d - 2 * WALL_T
  const fixed = alongX ? (side === 'n' ? -d / 2 + WALL_T / 2 : d / 2 - WALL_T / 2) : side === 'w' ? -w / 2 + WALL_T / 2 : w / 2 - WALL_T / 2
  return (
    <>
      {wallSegments(len, hasDoor).map((s, i) => (
        <Block
          key={i}
          pos={alongX ? [s.c, h / 2, fixed] : [fixed, h / 2, s.c]}
          size={alongX ? [s.l, h, WALL_T] : [WALL_T, h, s.l]}
          color="#ffffff"
        />
      ))}
    </>
  )
}

function Furniture({ room, layout, tint, sides }: { room: Room; layout: RoomLayout; tint: string; sides: Sides }) {
  const perSide = Math.min(6, Math.max(2, Math.ceil(room.capacity / 2)))
  const L = MathUtils.clamp(0.9 + perSide * 0.62, 1.9, 4.4)
  const tz = -0.25
  const y = FLOOR_TOP
  const xs = Array.from({ length: perSide }, (_, i) => -L / 2 + ((i + 0.5) * L) / perSide)
  const { w, d } = layout
  const fx = sides.e ? -1 : sides.w ? 1 : -1
  const fz = sides.s ? -1 : sides.n ? 1 : -1

  return (
    <>
      <Block pos={[0, y + 0.015, tz]} size={[L + 1.5, 0.03, 3]} color={tint} shadow={false} />
      <Block pos={[-L / 2 + 0.5, y + 0.35, tz]} size={[0.12, 0.7, 0.9]} color="#94a3b8" />
      <Block pos={[L / 2 - 0.5, y + 0.35, tz]} size={[0.12, 0.7, 0.9]} color="#94a3b8" />
      <Block pos={[0, y + 0.74, tz]} size={[L, 0.08, 1.3]} color="#ffffff" />
      {xs.map((x) =>
        [-1, 1].map((s) => (
          <group key={`${x}${s}`} position={[x, y, tz + s * 1.05]}>
            <Block pos={[0, 0.22, 0]} size={[0.06, 0.44, 0.06]} color="#475569" shadow={false} />
            <Block pos={[0, 0.46, 0]} size={[0.42, 0.07, 0.42]} color="#64748b" />
            <Block pos={[0, 0.72, s * 0.19]} size={[0.42, 0.42, 0.06]} color="#64748b" />
          </group>
        )),
      )}
      <Block pos={[fx * (w / 2 - WALL_T - 0.05), 0.95, tz]} size={[0.07, 0.8, 1.9]} color="#0f172a" />
      <Block pos={[fx * (w / 2 - WALL_T - 0.1), 0.95, tz]} size={[0.04, 0.65, 1.7]} color="#1e3a8a" emissive="#2563eb" shadow={false} />
      <Block pos={[w * 0.28, 0.95, fz * (d / 2 - WALL_T - 0.04)]} size={[1.7, 0.8, 0.05]} color="#cbd5e1" />
      <Block pos={[w * 0.28, 0.95, fz * (d / 2 - WALL_T - 0.08)]} size={[1.55, 0.65, 0.04]} color="#ffffff" shadow={false} />
    </>
  )
}

function Outline({ layout, color }: { layout: RoomLayout; color: string }) {
  const { w, d } = layout
  const t = 0.14
  const o = 0.1 + t / 2
  return (
    <group position={[0, 0.02, 0]}>
      <Block pos={[0, 0, -(d / 2 + o)]} size={[w + 2 * (o + t / 2), 0.06, t]} color={color} emissive={color} shadow={false} />
      <Block pos={[0, 0, d / 2 + o]} size={[w + 2 * (o + t / 2), 0.06, t]} color={color} emissive={color} shadow={false} />
      <Block pos={[-(w / 2 + o), 0, 0]} size={[t, 0.06, d]} color={color} emissive={color} shadow={false} />
      <Block pos={[w / 2 + o, 0, 0]} size={[t, 0.06, d]} color={color} emissive={color} shadow={false} />
    </group>
  )
}

function RoomObject({
  layout,
  color,
  tint,
  room,
  sides,
  selected,
  hovered,
  reduced,
  onSelect,
  onHover,
}: {
  room: Room
  layout: RoomLayout
  color: string
  tint: string
  sides: Sides
  selected: boolean
  hovered: boolean
  reduced: boolean
  onSelect: () => void
  onHover: (on: boolean) => void
}) {
  const group = useRef<Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const targetY = selected ? 0.35 : hovered ? 0.22 : 0

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    if (reduced) {
      g.position.y = targetY
      return
    }
    g.position.y = MathUtils.damp(g.position.y, targetY, 11, dt)
    if (Math.abs(g.position.y - targetY) > 0.002) invalidate()
    else g.position.y = targetY
  })

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : ''
    return () => {
      gl.domElement.style.cursor = ''
    }
  }, [hovered, gl])

  const outline = selected ? SELECT_COLOR : hovered ? HOVER_COLOR : null

  return (
    <group position={[layout.x, 0, layout.z]}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
        }}
        onPointerOut={() => onHover(false)}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <Block pos={[0, 0.1, 0]} size={[layout.w, 0.2, layout.d]} color={color} />
        <Block pos={[0, 0.12, 0]} size={[layout.w - 0.36, 0.2, layout.d - 0.36]} color={tint} />
        <Furniture room={room} layout={layout} tint="#f8fafc" sides={sides} />
        {(['n', 'w', 's', 'e'] as Side[]).map((s) => (
          <Wall key={s} side={s} layout={layout} near={sides[s]} />
        ))}
        {outline && <Outline layout={layout} color={outline} />}

      </group>
    </group>
  )
}

function Labels({ refs }: { refs: MutableRefObject<Record<number, HTMLDivElement | null>> }) {
  const v = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const room of ROOMS) {
      const el = refs.current[room.id]
      const l = ROOM_LAYOUT[room.id]
      if (!el || !l) continue
      v.set(l.x, 2.1, l.z).project(camera)
      el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px) translate(-50%, -50%)`
    }
  })
  return null
}

function Plant({ pos }: { pos: Vec3 }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.4, 14]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.15, 0.98, 0.05]} castShadow>
        <icosahedronGeometry args={[0.24, 1]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} flatShading />
      </mesh>
    </group>
  )
}

function Rig({
  apiRef,
  reduced,
  onSides,
}: {
  apiRef: MutableRefObject<Api | null>
  reduced: boolean
  onSides: (s: Sides) => void
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  const controls = useRef<ElementRef<typeof OrbitControls>>(null)
  const inited = useRef(false)
  const pending = useRef(0)
  const sidesKey = useRef('')

  const fit = useMemo(() => {
    const spanX = (BOUNDS.w + BOUNDS.d) / Math.SQRT2 + 1.5
    const spanY = (BOUNDS.w + BOUNDS.d) * 0.43 + 4.8
    return Math.max(8, Math.min(size.width / spanX, size.height / spanY))
  }, [size.width, size.height])

  const home = useMemo<Vec3>(() => [BOUNDS.cx + CAM_DIR[0] * CAM_DIST, CAM_DIR[1] * CAM_DIST, BOUNDS.cz + CAM_DIR[2] * CAM_DIST], [])
  const target = useMemo<Vec3>(() => [BOUNDS.cx, 0.6, BOUNDS.cz], [])

  const setZoom = (z: number) => {
    camera.zoom = MathUtils.clamp(z, fit * 0.85, fit * 2.6)
    camera.updateProjectionMatrix()
    controls.current?.update()
    invalidate()
  }

  const spin = (rad: number) => {
    const c = controls.current
    if (!c) return
    const dx = camera.position.x - c.target.x
    const dz = camera.position.z - c.target.z
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    camera.position.x = c.target.x + dx * cos - dz * sin
    camera.position.z = c.target.z + dx * sin + dz * cos
    c.update()
  }

  useEffect(() => {
    if (!inited.current) {
      camera.position.set(...home)
      controls.current?.target.set(...target)
      camera.lookAt(...target)
      inited.current = true
    }
    camera.zoom = fit
    camera.updateProjectionMatrix()
    controls.current?.update()
    invalidate()
  }, [fit, camera, home, target, invalidate])

  useEffect(() => {
    apiRef.current = {
      zoomBy: (f) => setZoom(camera.zoom * f),
      reset: () => {
        pending.current = 0
        camera.position.set(...home)
        controls.current?.target.set(...target)
        setZoom(fit)
      },
      rotateBy: (rad) => {
        if (reduced) spin(rad)
        else pending.current += rad
        invalidate()
      },
    }
  })

  const settle = useRef(reduced ? 1 : 0)
  useFrame((_, dt) => {
    if (settle.current < 1) {
      settle.current = Math.min(1, settle.current + dt / 0.9)
      const e = 1 - Math.pow(1 - settle.current, 3)
      camera.zoom = fit * (0.9 + 0.1 * e)
      camera.updateProjectionMatrix()
      invalidate()
    }
    if (Math.abs(pending.current) > 0.002) {
      const step = pending.current * Math.min(1, dt * 9)
      pending.current -= step
      spin(step)
      invalidate()
    } else if (pending.current !== 0) {
      spin(pending.current)
      pending.current = 0
    }

    const c = controls.current
    if (c) {
      const dx = camera.position.x - c.target.x
      const dz = camera.position.z - c.target.z
      const len = Math.hypot(dx, dz) || 1
      const sides: Sides = { e: dx / len > 0.35, w: dx / len < -0.35, s: dz / len > 0.35, n: dz / len < -0.35 }
      const key = `${+sides.n}${+sides.s}${+sides.e}${+sides.w}`
      if (key !== sidesKey.current) {
        sidesKey.current = key
        onSides(sides)
      }
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableRotate
      enableDamping={!reduced}
      dampingFactor={0.15}
      rotateSpeed={0.6}
      minPolarAngle={0.7}
      maxPolarAngle={1.25}
      screenSpacePanning
      zoomSpeed={0.5}
      minZoom={fit * 0.85}
      maxZoom={fit * 2.6}
      mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
    />
  )
}

export default function Floor3D({ bookings, date, selectedId, onSelect, visibleIds }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const apiRef = useRef<Api | null>(null)
  const labelRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [sides, setSides] = useState<Sides>(START_SIDES)
  const reduced = useReducedMotion()
  const fmtNext = (start: number, end: number) =>
    `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}–${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-white bg-white/90 text-ink shadow-sm backdrop-blur transition-colors duration-200 hover:bg-white focus-visible:outline-2'

  return (
    <div
      className="relative h-full w-full"
      role="group"
      aria-label="ผังห้องประชุมแบบ 3 มิติ ใช้ปุ่มลูกศรซ้ายขวาเพื่อหมุน เครื่องหมายบวกลบเพื่อซูม"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') apiRef.current?.rotateBy(-Math.PI / 4)
        else if (e.key === 'ArrowRight') apiRef.current?.rotateBy(Math.PI / 4)
        else if (e.key === '+' || e.key === '=') apiRef.current?.zoomBy(1.25)
        else if (e.key === '-') apiRef.current?.zoomBy(0.8)
        else if (e.key === '0') apiRef.current?.reset()
        else return
        e.preventDefault()
      }}
    >
      <Canvas
        orthographic
        flat
        shadows="percentage"
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [BOUNDS.cx + CAM_DIR[0] * CAM_DIST, CAM_DIR[1] * CAM_DIST, BOUNDS.cz + CAM_DIR[2] * CAM_DIST], zoom: 36, near: 0.1, far: 200 }}
        onPointerMissed={() => setHover(null)}
      >
        <ambientLight intensity={1.05} />
        <hemisphereLight args={['#ffffff', '#c7d2e5', 0.5]} />
        <directionalLight
          position={[-9, 18, 12]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
          shadow-camera-near={1}
          shadow-camera-far={70}
          shadow-bias={-0.0004}
        />

        <Block pos={[BOUNDS.cx, -0.15, BOUNDS.cz]} size={[BOUNDS.w, 0.3, BOUNDS.d]} color="#dbe4f1" />

        {ROOMS.map((room) => {
          const layout = ROOM_LAYOUT[room.id]
          if (!layout || (visibleIds && !visibleIds.includes(room.id))) return null
          const { meta } = roomState(bookings, room.id, date)
          return (
            <RoomObject
              key={room.id}
              room={room}
              layout={layout}
              color={meta.color}
              tint={meta.tint}
              sides={sides}
              selected={selectedId === room.id}
              hovered={hover === room.id}
              reduced={reduced}
              onSelect={() => onSelect(room.id)}
              onHover={(on) => setHover((h) => (on ? room.id : h === room.id ? null : h))}
            />
          )
        })}

        {[BOUNDS.minX + 0.9, BOUNDS.cx - 3.2, BOUNDS.cx + 3.2, BOUNDS.maxX - 0.9].map((x) => (
          <Plant key={x} pos={[x, 0, BOUNDS.cz]} />
        ))}

        <Labels refs={labelRefs} />
        <Rig apiRef={apiRef} reduced={reduced} onSides={setSides} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {ROOMS.filter((r) => !visibleIds || visibleIds.includes(r.id)).map((room) => {
          const { state, meta, next } = roomState(bookings, room.id, date)
          const nextText = state === 'booked' && next ? fmtNext(next.start, next.end) : null
          const selected = selectedId === room.id
          const hovered = hover === room.id
          return (
            <div
              key={room.id}
              ref={(el) => {
                labelRefs.current[room.id] = el
              }}
              className="absolute top-0 left-0 will-change-transform"
              style={{ zIndex: selected || hovered ? 50 : 10 }}
            >
              <div className="relative flex flex-col items-center">
                {hovered && (
                  <div
                    id={`tip-${room.id}`}
                    role="tooltip"
                    className="anim-fade pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs whitespace-nowrap text-white shadow-lg"
                  >
                    <p className="text-[13px] font-bold">{room.name}</p>
                    <p className="mt-0.5 text-slate-200">รองรับ {room.capacity} คน</p>
                    <p className="mt-0.5 flex items-center gap-1.5 font-semibold">
                      <span className={`h-2 w-2 shrink-0 ${meta.marker}`} />
                      {meta.label}
                      {nextText ? ` · ${nextText}` : ''}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onSelect(room.id)}
                  onFocus={() => setHover(room.id)}
                  onBlur={() => setHover((h) => (h === room.id ? null : h))}
                  onPointerEnter={() => setHover(room.id)}
                  onPointerLeave={() => setHover((h) => (h === room.id ? null : h))}
                  aria-pressed={selected}
                  aria-describedby={hovered ? `tip-${room.id}` : undefined}
                  aria-label={`${room.name} ${meta.label} รองรับ ${room.capacity} คน${nextText ? ` ${nextText}` : ''}`}
                  className={`pointer-events-auto min-w-[104px] cursor-pointer rounded-lg border-2 bg-white px-2.5 py-1 text-left whitespace-nowrap shadow-md transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    selected ? 'border-blue-600' : hovered ? 'border-blue-300' : 'border-slate-200'
                  }`}
                >
                  <span className="block text-[12.5px] leading-tight font-bold text-slate-900">{room.name}</span>
                  <span className={`mt-0.5 flex items-center gap-1.5 text-[11.5px] leading-tight font-semibold ${meta.text}`}>
                    <span className={`h-2 w-2 shrink-0 ${meta.marker}`} />
                    {meta.label}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute right-3 bottom-3 flex flex-row gap-1.5">
        <button type="button" className={btn} aria-label="หมุนซ้าย" title="หมุนซ้าย (←)" onClick={() => apiRef.current?.rotateBy(-Math.PI / 4)}>
          <RotateLeftIcon size={16} />
        </button>
        <button type="button" className={btn} aria-label="หมุนขวา" title="หมุนขวา (→)" onClick={() => apiRef.current?.rotateBy(Math.PI / 4)}>
          <RotateRightIcon size={16} />
        </button>
        <button type="button" className={btn} aria-label="ซูมเข้า" onClick={() => apiRef.current?.zoomBy(1.25)}>
          <PlusIcon size={16} />
        </button>
        <button type="button" className={btn} aria-label="ซูมออก" onClick={() => apiRef.current?.zoomBy(0.8)}>
          <MinusIcon size={16} />
        </button>
        <button type="button" className={btn} aria-label="รีเซ็ตมุมมอง" onClick={() => apiRef.current?.reset()}>
          <ResetIcon size={16} />
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-ink-soft">ลากเพื่อหมุน · คลิกขวาเพื่อเลื่อน · ล้อเมาส์หรือบีบนิ้วเพื่อซูม</p>
    </div>
  )
}
