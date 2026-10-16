import { ROOMS, STATE_META, roomState, type Booking, type RoomState } from '../data'

export type StatusFilter = 'all' | RoomState
export type CapacityFilter = 0 | 5 | 6 | 12

type Props = {
  bookings: Booking[]
  date: string
  status: StatusFilter
  capacity: CapacityFilter
  selectedId: number | null
  onStatus: (s: StatusFilter) => void
  onCapacity: (c: CapacityFilter) => void
  onSelect: (id: number) => void
}

const STATUSES: RoomState[] = ['free', 'busy', 'booked']
const CAPS: { value: CapacityFilter; label: string }[] = [
  { value: 0, label: 'ทั้งหมด' },
  { value: 5, label: '≥ 5 คน' },
  { value: 6, label: '≥ 6 คน' },
  { value: 12, label: '≥ 12 คน' },
]

export function matchingIds(bookings: Booking[], date: string, status: StatusFilter, capacity: CapacityFilter) {
  return ROOMS.filter(
    (r) => r.capacity >= capacity && (status === 'all' || roomState(bookings, r.id, date).state === status),
  ).map((r) => r.id)
}

export default function RoomFilters({ bookings, date, status, capacity, selectedId, onStatus, onCapacity, onSelect }: Props) {
  const states = Object.fromEntries(ROOMS.map((r) => [r.id, roomState(bookings, r.id, date)]))
  const counts = { free: 0, busy: 0, booked: 0 }
  ROOMS.forEach((r) => {
    if (r.capacity >= capacity) counts[states[r.id].state as RoomState]++
  })
  const visible = ROOMS.filter((r) => r.capacity >= capacity && (status === 'all' || states[r.id].state === status))

  const chip = (on: boolean) =>
    `inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 ${
      on ? 'border-primary bg-primary-soft text-primary' : 'border-white bg-white/70 text-ink hover:bg-white'
    }`

  return (
    <div className="shrink-0 space-y-3 px-7 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div role="group" aria-label="กรองตามสถานะ" className="flex flex-wrap gap-2">
          <button className={chip(status === 'all')} aria-pressed={status === 'all'} onClick={() => onStatus('all')}>
            ทั้งหมด <b className="tabular-nums">{counts.free + counts.busy + counts.booked}</b>
          </button>
          {STATUSES.map((k) => (
            <button key={k} className={chip(status === k)} aria-pressed={status === k} onClick={() => onStatus(status === k ? 'all' : k)}>
              <span className={`h-2.5 w-2.5 shrink-0 ${STATE_META[k].marker}`} />
              {STATE_META[k].label} <b className="tabular-nums">{counts[k]}</b>
            </button>
          ))}
        </div>
        <div role="group" aria-label="กรองตามความจุ" className="flex items-center gap-1 rounded-full bg-white/60 p-1">
          <span className="px-2 text-xs text-ink-soft">ความจุ</span>
          {CAPS.map((c) => (
            <button
              key={c.value}
              aria-pressed={capacity === c.value}
              onClick={() => onCapacity(c.value)}
              className={`h-8 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                capacity === c.value ? 'bg-white text-primary shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="เลือกห้องประชุม" className="flex items-center gap-2 overflow-x-auto pb-1">
        {visible.map((r) => {
          const { meta } = states[r.id]
          return (
            <button key={r.id} className={chip(selectedId === r.id)} aria-pressed={selectedId === r.id} onClick={() => onSelect(r.id)}>
              <span className={`h-2.5 w-2.5 shrink-0 ${meta.marker}`} />
              {r.name}
              <span className="rounded-full bg-white/80 px-1.5 text-xs text-ink-soft tabular-nums">{r.capacity} คน</span>
            </button>
          )
        })}
        {visible.length === 0 && <p role="status" className="text-sm text-ink-soft">ไม่พบห้องที่ตรงกับตัวกรอง</p>}
      </div>
    </div>
  )
}
