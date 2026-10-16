import { DAY_END, DAY_START, NOW, ROOMS, TODAY, fmt, shiftDate, thaiDate, type Booking } from '../data'
import { ChevronLeft, ChevronRight } from './icons'

type Props = {
  bookings: Booking[]
  date: string
  selectedId: number | null
  onDate: (d: string) => void
  onSelectRoom: (id: number) => void
  onBookAt: (roomId: number, start: number) => void
  onClose?: () => void
}

const SPAN = DAY_END - DAY_START
const HOURS = [8, 10, 12, 14, 16, 18]
const BAR = ['#99f6e4', '#ddd6fe', '#bfdbfe', '#fbcfe8']
const pct = (m: number) => `${((m - DAY_START) / SPAN) * 100}%`
const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0)

export default function DayGantt({ bookings, date, selectedId, onDate, onSelectRoom, onBookAt, onClose }: Props) {
  const isToday = date === TODAY

  return (
    <section className="glass shrink-0 rounded-3xl bg-white/90 p-5" aria-label="ตารางเวลาห้องประชุมทั้งหมด">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">ตารางเวลา</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => onDate(shiftDate(date, -1))} aria-label="วันก่อนหน้า" className="rounded-full p-1.5 hover:bg-white/80">
            <ChevronLeft size={16} />
          </button>
          <label className="relative">
            <span className="sr-only">เลือกวันที่</span>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && onDate(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <span className="block min-w-[118px] rounded-full px-2 py-1 text-center text-sm font-medium">{thaiDate(date, false)}</span>
          </label>
          <button onClick={() => onDate(shiftDate(date, 1))} aria-label="วันถัดไป" className="rounded-full p-1.5 hover:bg-white/80">
            <ChevronRight size={16} />
          </button>
          {!isToday && (
            <button onClick={() => onDate(TODAY)} className="ml-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft">
              วันนี้
            </button>
          )}
          {onClose && (
            <button onClick={onClose} aria-label="ปิด" className="ml-2 rounded-full p-1.5 text-lg leading-none text-ink-soft hover:bg-white">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex">
        <div className="w-[100px] shrink-0" />
        <div className="relative h-5 flex-1 text-[11px] text-ink-soft tabular-nums">
          {HOURS.map((h) => (
            <span key={h} className="absolute -translate-x-1/2" style={{ left: pct(h * 60) }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
          {isToday && (
            <span className="absolute -top-0.5 z-10 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ left: pct(NOW) }}>
              {fmt(NOW)}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-1">
        {ROOMS.map((room) => {
          const list = bookings.filter((b) => b.roomId === room.id && b.date === date)
          const on = selectedId === room.id
          return (
            <li key={room.id} className="flex items-center border-t border-line/60">
              <button
                onClick={() => onSelectRoom(room.id)}
                aria-pressed={on}
                className={`w-[100px] shrink-0 rounded-lg py-1.5 pr-1 text-left leading-tight transition-colors duration-200 ${on ? 'text-primary' : ''}`}
              >
                <span className="block text-[12.5px] font-semibold whitespace-nowrap">{room.name}</span>
                <span className="block text-[11px] text-ink-soft">({room.capacity} คน)</span>
              </button>
              <div
                className="relative my-1 h-9 flex-1 cursor-copy rounded-lg bg-white/50"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  const raw = DAY_START + ((e.clientX - r.left) / r.width) * SPAN
                  const start = Math.min(DAY_END - 60, Math.max(DAY_START, Math.round(raw / 30) * 30))
                  onBookAt(room.id, start)
                }}
                title="คลิกที่ช่วงว่างเพื่อจองห้อง"
              >
                {HOURS.slice(1, -1).map((h) => (
                  <span key={h} className="absolute inset-y-0 w-px bg-line/70" style={{ left: pct(h * 60) }} />
                ))}
                {isToday && <span className="absolute inset-y-[-4px] z-10 w-0.5 bg-primary" style={{ left: pct(NOW) }} />}
                {list.map((b) => (
                  <button
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectRoom(room.id)
                    }}
                    title={`${b.title} ${fmt(b.start)}–${fmt(b.end)} โดย ${b.organizer}`}
                    className="absolute inset-y-1 overflow-hidden rounded-md px-1.5 text-left text-[11px] leading-tight font-semibold whitespace-nowrap text-slate-800 shadow-sm"
                    style={{ left: pct(b.start), width: `${((b.end - b.start) / SPAN) * 100}%`, background: BAR[hash(b.id) % BAR.length] }}
                  >
                    <span className="block truncate">{b.title}</span>
                    <span className="block truncate font-normal text-slate-600 tabular-nums">
                      {fmt(b.start)}–{fmt(b.end)}
                    </span>
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
