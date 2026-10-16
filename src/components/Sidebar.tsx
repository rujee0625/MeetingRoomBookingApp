import { ROOMS, STATE_META, roomState, type Booking, type RoomState } from '../data'
import { CalendarIcon, MapIcon } from './icons'

type Props = {
  view: 'plan' | 'timeline'
  selectedId: number | null
  bookings: Booking[]
  date: string
  onPlan: () => void
  onTimeline: () => void
  onSelect: (id: number) => void
  query: string
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" opacity=".35" />
          <path d="M8 16V8l4 4 4-4v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight">MeetRoom</span>
    </div>
  )
}

export default function Sidebar({ view, selectedId, bookings, date, onPlan, onTimeline, onSelect, query }: Props) {
  const item = (active: boolean) =>
    `flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 ${
      active ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:bg-white/70 hover:text-ink'
    }`

  const counts = { free: 0, busy: 0, booked: 0 }
  ROOMS.forEach((r) => counts[roomState(bookings, r.id, date).state]++)

  return (
    <aside className="glass flex w-[210px] shrink-0 flex-col overflow-y-auto rounded-3xl p-3">
      <nav aria-label="เมนูหลัก" className="flex flex-col gap-1">
        <button className={item(view === 'plan')} onClick={onPlan} aria-current={view === 'plan' ? 'page' : undefined}>
          <span className={view === 'plan' ? 'text-primary' : ''}><MapIcon size={20} /></span>
          แผนผังห้อง
        </button>
        <button
          className={`${item(view === 'timeline')} ${selectedId ? '' : 'opacity-50'}`}
          onClick={onTimeline}
          disabled={!selectedId}
          title={selectedId ? undefined : 'เลือกห้องก่อนเพื่อดูตารางเวลา'}
          aria-current={view === 'timeline' ? 'page' : undefined}
        >
          <span className={view === 'timeline' ? 'text-primary' : ''}><CalendarIcon size={20} /></span>
          ตารางเวลา
        </button>
      </nav>

      <p className="mt-6 mb-2 px-3 text-xs font-semibold text-ink-soft">ห้องประชุม</p>
      <ul className="flex flex-col gap-0.5">
        {ROOMS.filter((r) => r.name.replace(/\s/g, '').includes(query.replace(/\s/g, ''))).map((r) => {
          const { meta } = roomState(bookings, r.id, date)
          const on = selectedId === r.id
          return (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r.id)}
                aria-pressed={on}
                className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors duration-200 ${
                  on ? 'bg-white font-semibold text-primary shadow-sm' : 'text-ink hover:bg-white/70'
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 ${meta.marker}`} />
                <span className="flex-1 truncate text-left">{r.name}</span>
                <span className={`text-xs font-medium ${meta.text}`}>{meta.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {!ROOMS.some((r) => r.name.replace(/\s/g, '').includes(query.replace(/\s/g, ''))) && (
        <p className="px-3 py-2 text-sm text-ink-soft">ไม่พบห้องที่ค้นหา</p>
      )}

      <div className="mt-auto rounded-2xl bg-white/70 p-3">
        <p className="mb-2 text-xs font-semibold text-ink-soft">สัญลักษณ์สถานะ</p>
        <ul className="space-y-1.5 text-sm">
          {(['free', 'busy', 'booked'] as RoomState[]).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 ${STATE_META[k].marker}`} />
              <span className="flex-1">{STATE_META[k].label}</span>
              <span className="font-semibold tabular-nums">{counts[k]}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
