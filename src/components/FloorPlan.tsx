import { useState } from 'react'
import { ROOMS, fmt, getInfo, type Booking, type Room } from '../data'

const S = 26
const COS = 0.866
const W = 17
const H = 13.8
const RW = 4.6
const WH = 1.0
const FH = 0.25
const T = 0.28
const PRIMARY = '#2f5be3'
const PRIMARY_HOVER = '#8b8df2'

const project = (x: number, y: number, z = 0) => [(x - y) * COS * S, (x + y) * 0.5 * S - z * S]
const P = (list: number[][]) => list.map(([x, y, z]) => project(x, y, z).join(',')).join(' ')

type Tone = { top: string; left: string; right: string }
const WALL: Tone = { top: '#ffffff', left: '#f4f1ea', right: '#e2ded5' }
const WOOD_TABLE: Tone = { top: '#f5e8cf', left: '#d9c19a', right: '#c4a97c' }
const CHAIR: Tone = { top: '#c99a63', left: '#a97b48', right: '#8f6639' }
const POT: Tone = { top: '#d9a07a', left: '#c58a62', right: '#a9724d' }

const STATUS = {
  free: { slab: '#22c55e', slabL: '#4ade80', rug: '#86efac', text: '#15803d', label: 'ว่าง' },
  busy: { slab: '#ea580c', slabL: '#fb923c', rug: '#fdba74', text: '#c2410c', label: 'กำลังใช้งาน' },
  booked: { slab: '#2563eb', slabL: '#60a5fa', rug: '#bfdbfe', text: '#1d4ed8', label: 'มีรายการจอง' },
}

type BoxProps = {
  x0: number
  y0: number
  x1: number
  y1: number
  z0?: number
  z1: number
  tone: Tone
  stroke?: string
  sw?: number
}

function Box({ x0, y0, x1, y1, z0 = 0, z1, tone, stroke = 'none', sw = 1 }: BoxProps) {
  return (
    <g strokeLinejoin="round">
      <polygon points={P([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]])} fill={tone.left} />
      <polygon points={P([[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]])} fill={tone.right} />
      <polygon points={P([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])} fill={tone.top} stroke={stroke} strokeWidth={sw} />
    </g>
  )
}

type Props = {
  bookings: Booking[]
  date: string
  selectedId: number | null
  onSelect: (id: number) => void
}

function RoomShape({
  room,
  bookings,
  date,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  room: Room
  bookings: Booking[]
  date: string
  selected: boolean
  hovered: boolean
  onSelect: () => void
  onHover: (on: boolean) => void
}) {
  const x = 0.8 + room.col * 5.4
  const y = 0.8 + room.row * 7.6
  const { status, current, next } = getInfo(bookings, room.id, date)
  const state = status === 'busy' ? 'busy' : next ? 'booked' : 'free'
  const c = STATUS[state]
  const outline = selected ? PRIMARY : hovered ? PRIMARY_HOVER : '#d6d3cc'
  const sw = selected ? 2.2 : hovered ? 1.8 : 0.8
  const [cx, cy] = project(x + RW / 2, y + RW / 2, WH)
  const lift = selected ? -8 : hovered ? -4 : 0

  const tl = 1.1 + room.capacity * 0.07
  const tw = 1.0
  const tx0 = x + RW / 2 - tl / 2
  const ty0 = y + RW / 2 - tw / 2 + 0.5
  const perSide = Math.min(4, Math.max(1, Math.round(room.capacity / 4)))
  const chairs = Array.from({ length: perSide }, (_, i) => tx0 + ((i + 0.5) * tl) / perSide)
  const [lx, ly] = project(x + T + 0.55, y + T + 0.55, 0.95)

  const aria = `${room.name} ${c.label}${current ? ` ถึง ${fmt(current.end)} น.` : ''}${next ? ` มีรายการจอง ${fmt(next.start)} น.` : ''}`

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={aria}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="cursor-pointer outline-none"
      style={{ transform: `translateY(${lift}px)`, transition: 'transform 220ms ease-out' }}
    >
      <ellipse
        cx={project(x + RW / 2, y + RW / 2)[0]}
        cy={project(x + RW / 2, y + RW / 2)[1] + 10}
        rx={RW * COS * S + 4}
        ry={RW * 0.5 * S + 4}
        fill="#3b2f1e"
        opacity={selected ? 0.18 : hovered ? 0.12 : 0.07}
        style={{ transition: 'opacity 220ms ease-out' }}
      />
      {selected && (
        <polygon
          points={P([[x - 0.25, y - 0.25, 0], [x + RW + 0.25, y - 0.25, 0], [x + RW + 0.25, y + RW + 0.25, 0], [x - 0.25, y + RW + 0.25, 0]])}
          fill={PRIMARY}
          opacity="0.16"
        />
      )}

      <Box x0={x} y0={y} x1={x + RW} y1={y + RW} z0={-0.22} z1={0} tone={{ top: '#ecd9b2', left: c.slabL, right: c.slab }} />
      <polygon
        points={P([[tx0 - 0.5, ty0 - 0.8, 0.01], [tx0 + tl + 0.5, ty0 - 0.8, 0.01], [tx0 + tl + 0.5, ty0 + tw + 0.8, 0.01], [tx0 - 0.5, ty0 + tw + 0.8, 0.01]])}
        fill={c.rug}
        opacity="0.85"
      />

      <Box x0={x} y0={y} x1={x + RW} y1={y + T} z1={WH} tone={WALL} stroke={outline} sw={sw} />
      <Box x0={x} y0={y + T} x1={x + T} y1={y + RW} z1={WH} tone={WALL} stroke={outline} sw={sw} />
      <polygon
        points={P([[x + 0.8, y + T + 0.01, 0.3], [x + RW - 0.8, y + T + 0.01, 0.3], [x + RW - 0.8, y + T + 0.01, 0.85], [x + 0.8, y + T + 0.01, 0.85]])}
        fill="#fff3d1"
        stroke="#d6b273"
        strokeWidth="1"
      />
      <polyline points={P([[x + RW / 2, y + T + 0.01, 0.3], [x + RW / 2, y + T + 0.01, 0.85]])} stroke="#d6b273" strokeWidth="1" fill="none" />
      <polygon
        points={P([[x + T + 0.01, y + 1.4, 0.35], [x + T + 0.01, y + 3.2, 0.35], [x + T + 0.01, y + 3.2, 0.8], [x + T + 0.01, y + 1.4, 0.8]])}
        fill="#1f2937"
      />
      <Box x0={x + T + 0.25} y0={y + T + 0.25} x1={x + T + 0.7} y1={y + T + 0.7} z1={0.3} tone={POT} />
      <ellipse cx={lx} cy={ly} rx="9" ry="11" fill="#4d8f4f" />
      <ellipse cx={lx + 4} cy={ly - 6} rx="5.5" ry="7" fill="#6aa86a" />

      {chairs.map((cxp, i) => (
        <Box key={`n${i}`} x0={cxp - 0.2} y0={ty0 - 0.55} x1={cxp + 0.2} y1={ty0 - 0.15} z1={0.28} tone={CHAIR} />
      ))}
      <Box x0={tx0} y0={ty0} x1={tx0 + tl} y1={ty0 + tw} z0={0} z1={0.42} tone={WOOD_TABLE} />
      {chairs.map((cxp, i) => (
        <Box key={`s${i}`} x0={cxp - 0.2} y0={ty0 + tw + 0.15} x1={cxp + 0.2} y1={ty0 + tw + 0.55} z1={0.28} tone={CHAIR} />
      ))}

      <Box x0={x + T} y0={y + RW - T} x1={x + 1.6} y1={y + RW} z1={FH} tone={WALL} stroke={outline} sw={sw} />
      <Box x0={x + 2.8} y0={y + RW - T} x1={x + RW - T} y1={y + RW} z1={FH} tone={WALL} stroke={outline} sw={sw} />
      <Box x0={x + RW - T} y0={y + T} x1={x + RW} y1={y + RW} z1={FH} tone={WALL} stroke={outline} sw={sw} />

      <g transform={`translate(${cx - 68}, ${cy - 78})`}>
        <rect width="136" height="58" rx="10" fill="#fff" stroke={selected ? PRIMARY : hovered ? PRIMARY_HOVER : '#e5e7eb'} strokeWidth={selected ? 2 : 1} />
        <text x="12" y="19" fontSize="13.5" fontWeight="700" fill="#20243a">{room.name}</text>
        {state === 'busy' ? (
          <rect x="12" y="27" width="8" height="8" rx="1.5" fill="#ea580c" />
        ) : state === 'booked' ? (
          <rect x="12.5" y="27.5" width="7" height="7" rx="1" fill="#2563eb" transform="rotate(45 16 31)" />
        ) : (
          <circle cx="16" cy="31" r="4.5" fill="#22c55e" />
        )}
        <text x="26" y="35" fontSize="12" fontWeight="600" fill={c.text}>{c.label}</text>
        {next ? (
          <>
            <rect x="12.5" y="43.5" width="7" height="7" rx="1" fill={PRIMARY} transform="rotate(45 16 47)" />
            <text x="26" y="51.5" fontSize="11.5" fontWeight="600" fill={PRIMARY}>มีรายการจอง {fmt(next.start)}</text>
          </>
        ) : (
          <text x="12" y="51.5" fontSize="11.5" fill="#4b5563">รองรับ {room.capacity} คน</text>
        )}
      </g>
    </g>
  )
}

export default function FloorPlan({ bookings, date, selectedId, onSelect }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const minX = -H * COS * S - 20
  const maxX = W * COS * S + 20
  const minY = -85
  const maxY = (W + H) * 0.5 * S + 22
  const ordered = [...ROOMS].sort((a, b) => a.row * 7.6 + a.col * 5.4 - (b.row * 7.6 + b.col * 5.4))
  const hovered = ROOMS.find((r) => r.id === hover)

  let tip: { x: number; y: number; text: string } | null = null
  if (hovered) {
    const hx = 0.8 + hovered.col * 5.4 + RW / 2
    const hy = 0.8 + hovered.row * 7.6 + RW / 2
    const [px, py] = project(hx, hy, WH)
    const info = getInfo(bookings, hovered.id, date)
    tip = { x: px, y: py - 78 - 8 - (selectedId === hovered.id ? 8 : 4), text: `${hovered.name} · รองรับ ${hovered.capacity} คน · ${STATUS[info.status === 'busy' ? 'busy' : info.next ? 'booked' : 'free'].label}` }
  }

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="anim-settle h-full w-full"
      role="group"
      aria-label="ผังชั้นสำนักงานแบบไอโซเมตริก"
    >
      <polygon points={P([[0, 0, -0.5], [W, 0, -0.5], [W, H, -0.5], [0, H, -0.5]])} fill="#d9d6cf" />
      <polygon points={P([[0, H, 0], [W, H, 0], [W, H, -0.5], [0, H, -0.5]])} fill="#f1efe9" />
      <polygon points={P([[W, 0, 0], [W, H, 0], [W, H, -0.5], [W, 0, -0.5]])} fill="#dedbd3" />
      <polygon points={P([[0, 0, 0], [W, 0, 0], [W, H, 0], [0, H, 0]])} fill="#faf8f4" stroke="#e5e2da" />
      <polygon points={P([[0.4, 5.9, 0], [W - 0.4, 5.9, 0], [W - 0.4, 7.9, 0], [0.4, 7.9, 0]])} fill="#f0ede6" />
      <text
        x={project(W / 2, 6.9)[0]}
        y={project(W / 2, 6.9)[1] + 4}
        textAnchor="middle"
        fontSize="12"
        fill="#6b7280"
        letterSpacing="2"
      >
        ทางเดินกลาง
      </text>

      {ordered.map((room) => (
        <RoomShape
          key={room.id}
          room={room}
          bookings={bookings}
          date={date}
          selected={selectedId === room.id}
          hovered={hover === room.id}
          onSelect={() => onSelect(room.id)}
          onHover={(on) => setHover((h) => (on ? room.id : h === room.id ? null : h))}
        />
      ))}

      {tip && (
        <g transform={`translate(${tip.x}, ${tip.y})`} pointerEvents="none" className="anim-fade">
          <rect x="-120" y="-24" width="240" height="26" rx="8" fill="#20243a" />
          <path d="M-5 2 L0 8 L5 2Z" fill="#20243a" />
          <text x="0" y="-6.5" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">{tip.text}</text>
        </g>
      )}
    </svg>
  )
}
