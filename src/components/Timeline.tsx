import { DAY_END, DAY_START, NOW, ROOMS, TODAY, fmt, freeGaps, roomBookings, thaiDate, type Booking } from '../data'
import { ArrowLeft, ClockIcon, UserIcon } from './icons'

const HOUR = 64
const top = (m: number) => ((m - DAY_START) / 60) * HOUR

type Props = {
  roomId: number
  bookings: Booking[]
  date: string
  onBack: () => void
  onBookSlot: (start: number, end: number) => void
}

export default function Timeline({ roomId, bookings, date, onBack, onBookSlot }: Props) {
  const room = ROOMS.find((r) => r.id === roomId)!
  const list = roomBookings(bookings, roomId, date)
  const gaps = freeGaps(list, date)
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div>
          <h2 className="text-base font-bold">ตารางเวลา · {room.name}</h2>
          <p className="text-sm text-ink-soft">{thaiDate(date)} · 08:00 – 18:00 น.</p>
        </div>
        <div className="flex items-center gap-4">
          <ul className="hidden items-center gap-3 text-xs text-ink-soft sm:flex">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> จองแล้ว
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-green-600 bg-green-50" /> ว่าง
            </li>
          </ul>
          <button
            onClick={onBack}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-slate-50"
          >
            <ArrowLeft size={15} /> กลับไปยังแผนผัง
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="relative ml-14" style={{ height: (DAY_END - DAY_START) / 60 * HOUR }}>
          {hours.map((h) => (
            <div key={h} className="absolute right-0 left-0 border-t border-line" style={{ top: top(h) }}>
              <span className="absolute -top-2.5 -left-14 w-11 text-right text-xs text-ink-soft tabular-nums">{fmt(h)}</span>
            </div>
          ))}

          {gaps.map((g) => (
            <button
              key={g.start}
              onClick={() => onBookSlot(g.start, Math.min(g.end, g.start + 60))}
              aria-label={`จองช่วงเวลานี้ ${fmt(g.start)} ถึง ${fmt(g.end)}`}
              className="group absolute right-2 left-2 flex items-center justify-between gap-3 rounded-xl border border-dashed border-green-600 bg-green-50 px-3 text-left transition-colors duration-200 hover:bg-green-100"
              style={{ top: top(g.start) + 2, height: top(g.end) - top(g.start) - 4 }}
            >
              <span className="text-sm font-medium text-free">
                ว่าง {fmt(g.start)} – {fmt(g.end)}
              </span>
              <span className="shrink-0 rounded-md border border-green-700 bg-white px-2.5 py-1 text-xs font-semibold text-free group-hover:bg-green-50">
                จองช่วงเวลานี้
              </span>
            </button>
          ))}

          {list.map((b) => {
            const h = top(b.end) - top(b.start) - 4
            return (
              <div
                key={b.id}
                className="absolute right-2 left-2 overflow-hidden rounded-xl bg-primary px-3 py-1.5 text-white"
                style={{ top: top(b.start) + 2, height: h }}
              >
                <p className="truncate text-sm leading-tight font-semibold">{b.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-indigo-100">
                  <ClockIcon size={12} /> {fmt(b.start)} – {fmt(b.end)}
                  {h > 44 && (
                    <>
                      <span className="mx-1">·</span>
                      <UserIcon size={12} /> {b.organizer}
                    </>
                  )}
                </p>
                {h <= 44 && h > 30 && (
                  <p className="sr-only">{b.organizer}</p>
                )}
              </div>
            )
          })}

          {date === TODAY && NOW >= DAY_START && NOW <= DAY_END && (
            <div className="pointer-events-none absolute right-0 left-0 z-10 border-t-2 border-red-500" style={{ top: top(NOW) }}>
              <span className="absolute -top-2.5 -left-14 rounded bg-red-500 px-1 text-xs font-semibold text-white tabular-nums">
                {fmt(NOW)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
