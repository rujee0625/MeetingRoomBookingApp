import roomImg from '../assets/meeting-room.jpg'
import { ROOMS, TODAY, fmt, roomState, type Booking } from '../data'
import { CheckIcon, ClockIcon, CloseIcon, MapIcon, UserIcon, UsersIcon } from './icons'

const DETAILS: Record<number, { en: string; floor: number; wing: string; desc: string; gear: string[] }> = {
  1: { en: 'Executive Boardroom', floor: 4, wing: 'ปีกทิศเหนือ (North Wing)', desc: 'ห้องประชุมสำหรับคณะกรรมการและผู้บริหาร พร้อมระบบ Video Conference 4K และไมโครโฟนรอบทิศทาง', gear: ['จอแสดงผล 85 นิ้ว 4K UHD', 'กล้อง Cisco Webex Quad Camera', 'ไมโครโฟนรอบทิศทาง Shure Ceiling Mic', 'กระดานดิจิทัล Smart Whiteboard', 'ปลั๊กไฟและพอร์ต HDMI/Type-C ประจำทุกที่นั่ง', 'ระบบควบคุมแสงและผ้าม่านอัตโนมัติ'] },
  2: { en: 'Collaboration Room', floor: 4, wing: 'ปีกทิศเหนือ (North Wing)', desc: 'ห้องประชุมขนาดกลางสำหรับทีมโครงการ เหมาะกับการระดมความคิดและนำเสนองาน', gear: ['จอแสดงผล 75 นิ้ว 4K', 'กล้องและลำโพง Video Conference', 'กระดานไวต์บอร์ดขนาดใหญ่', 'ปลั๊กไฟและพอร์ต HDMI/Type-C', 'Wi-Fi ความเร็วสูง'] },
  3: { en: 'Focus Room', floor: 4, wing: 'ปีกทิศเหนือ (North Wing)', desc: 'ห้องประชุมขนาดเล็กสำหรับประชุมทีมย่อยและการสัมภาษณ์', gear: ['จอแสดงผล 55 นิ้ว', 'กล้องเว็บแคมและลำโพงในตัว', 'กระดานไวต์บอร์ด', 'ปลั๊กไฟและพอร์ต HDMI'] },
  4: { en: 'Town Hall Room', floor: 3, wing: 'ปีกทิศใต้ (South Wing)', desc: 'ห้องประชุมใหญ่สำหรับสัมมนาและประชุมทั้งแผนก รองรับผู้เข้าร่วมจำนวนมาก', gear: ['โปรเจกเตอร์ Laser 4K พร้อมจอรับภาพ', 'ระบบเสียง Line Array พร้อมไมโครโฟนไร้สาย', 'กล้อง PTZ สำหรับประชุมทางไกล', 'เวทีขนาดเล็กและโพเดียม', 'ระบบควบคุมแสงอัตโนมัติ'] },
  5: { en: 'Huddle Room', floor: 3, wing: 'ปีกทิศใต้ (South Wing)', desc: 'ห้องเล็กสำหรับคุยงานด่วนและประชุมออนไลน์แบบกระชับ', gear: ['จอแสดงผล 43 นิ้ว', 'ลำโพงและไมโครโฟนแบบตั้งโต๊ะ', 'ปลั๊กไฟและพอร์ต HDMI', 'Wi-Fi ความเร็วสูง'] },
  6: { en: 'Innovation Lab', floor: 3, wing: 'ปีกทิศใต้ (South Wing)', desc: 'ห้องประชุมสำหรับเวิร์กช็อปและงานสร้างสรรค์ จัดโต๊ะได้ยืดหยุ่น', gear: ['จอแสดงผล 65 นิ้ว 4K', 'กระดานดิจิทัล Smart Whiteboard', 'โต๊ะและเก้าอี้ปรับจัดเรียงได้', 'กล้องและไมโครโฟนรอบทิศทาง', 'ปลั๊กไฟและพอร์ต HDMI/Type-C'] },
}

type Props = {
  roomId: number
  bookings: Booking[]
  date: string
  onBook: () => void
  onTimeline: () => void
  onClose?: () => void
}

export default function RoomPanel({ roomId, bookings, date, onBook, onTimeline, onClose }: Props) {
  const room = ROOMS.find((r) => r.id === roomId)
  if (!room) return null

  const { status, current, next, meta } = roomState(bookings, room.id, date)
  const busy = status === 'busy'
  const isToday = date === TODAY
  const info = DETAILS[room.id]

  return (
    <aside className="anim-slide glass relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-3xl" aria-live="polite" aria-label={`รายละเอียด ${room.name}`}>
      <img src={roomImg} alt={`ภาพห้อง ${room.name}`} className="h-28 w-full shrink-0 bg-page object-cover object-[50%_62%]" />
      {onClose && (
        <button onClick={onClose} aria-label="ปิดรายละเอียดห้อง" className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white">
          <CloseIcon size={16} />
        </button>
      )}
      <div className="border-b border-line/70 p-4">
        <p className="text-xs font-medium text-ink-soft">ห้องหมายเลข {room.id}</p>
        <div className="mt-0.5 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold">{room.name}</h2>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${
              meta.badge
            }`}
          >
            <span className={`h-2 w-2 ${meta.marker}`} />
            {meta.label}
          </span>
        </div>
        {info && (
          <p className="mt-1 text-sm text-ink-soft">
            {info.en} • {info.wing}
          </p>
        )}
      </div>

      <div className="space-y-3 p-4">
        {busy && current ? (
          <div className="rounded-xl border border-orange-200 bg-busy-soft p-3">
            <p className="text-xs font-medium text-busy">การประชุมปัจจุบัน</p>
            <p className="mt-0.5 font-semibold">{current.title}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
              <ClockIcon size={14} /> {fmt(current.start)} – {fmt(current.end)} · สิ้นสุด {fmt(current.end)} น.
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
              <UserIcon size={14} /> {current.organizer}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-free-soft p-3 text-sm text-free">
            {isToday ? 'ห้องว่างในขณะนี้ พร้อมให้จอง' : 'ยังไม่มีการใช้งานในช่วงที่ไม่มีรายการจอง'}
          </div>
        )}

        {info && (
          <>
            <p className="pt-1 text-xs font-semibold text-ink-soft">ข้อมูลและสิ่งอำนวยความสะดวก</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/60 p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <UsersIcon size={18} />
                </span>
                <div className="leading-tight">
                  <p className="text-[11px] text-ink-soft">ความจุห้อง</p>
                  <p className="text-sm font-bold">{room.capacity} คน</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white/60 p-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <MapIcon size={18} />
                </span>
                <div className="leading-tight">
                  <p className="text-[11px] text-ink-soft">ตำแหน่งที่ตั้ง</p>
                  <p className="text-sm font-bold">ชั้น {info.floor}</p>
                </div>
              </div>
            </div>
            <p className="rounded-xl border border-line bg-white/60 p-3 text-sm leading-relaxed text-ink-soft">{info.desc}</p>
            <div>
              <p className="mb-1.5 text-sm font-semibold">อุปกรณ์ภายในห้อง:</p>
              <ul className="space-y-1.5 text-sm">
                {info.gear.map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-primary">
                      <CheckIcon size={15} />
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="rounded-xl border border-line p-3">
          <p className="text-xs font-medium text-primary">รายการจองถัดไป</p>
          {next ? (
            <>
              <p className="mt-0.5 font-semibold">{next.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                <ClockIcon size={14} /> {fmt(next.start)} – {fmt(next.end)} น.
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
                <UserIcon size={14} /> {next.organizer}
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-sm text-ink-soft">ไม่มีรายการจองถัดไป</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-line/70 p-4">
        <button
          onClick={onTimeline}
          className="h-10 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-ink hover:bg-slate-50"
        >
          ดูตารางเวลา
        </button>
        <button
          onClick={onBook}
          className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-hover"
        >
          จองห้อง
        </button>
      </div>
    </aside>
  )
}
