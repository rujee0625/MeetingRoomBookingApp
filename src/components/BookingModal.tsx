import { useEffect, useState } from 'react'
import { ROOMS, TIME_OPTIONS, USER, fmt, findConflict, thaiDate, type Booking } from '../data'
import { AlertIcon, CheckIcon, CloseIcon } from './icons'

type Props = {
  roomId: number
  bookings: Booking[]
  initialDate: string
  initialStart: number
  initialEnd: number
  onClose: () => void
  onConfirm: (b: Omit<Booking, 'id'>) => void
  onViewTimeline: () => void
}

const field =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm placeholder:text-slate-400'

export default function BookingModal({ roomId, bookings, initialDate, initialStart, initialEnd, onClose, onConfirm, onViewTimeline }: Props) {
  const room = ROOMS.find((r) => r.id === roomId)!
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDate)
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)
  const [attendees, setAttendees] = useState(2)
  const [organizer, setOrganizer] = useState(USER.name)
  const [done, setDone] = useState<Omit<Booking, 'id'> | null>(null)
  const [details, setDetails] = useState('')
  const [tried, setTried] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const conflict = findConflict(bookings, roomId, date, start, end)
  const badRange = end <= start
  const overCap = attendees > room.capacity || attendees < 1
  const missing = !title.trim() || !organizer.trim()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (conflict || badRange || overCap || missing) return
    const b = { roomId, date, start, end, title: title.trim(), organizer: organizer.trim(), details: details.trim() || undefined }
    onConfirm(b)
    setDone(b)
  }

  const err = (show: boolean) => (show ? 'border-red-500' : '')

  if (done) {
    return (
      <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="done-title"
          onMouseDown={(e) => e.stopPropagation()}
          className="anim-pop w-full max-w-[420px] rounded-xl bg-white p-6 text-center shadow-xl"
        >
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-free-soft text-free">
            <CheckIcon size={26} />
          </span>
          <h2 id="done-title" className="text-lg font-bold">จองห้องสำเร็จ</h2>
          <p className="mt-1 text-sm text-ink-soft">บันทึกการจองเรียบร้อยแล้ว ตารางเวลาของห้องได้รับการอัปเดต</p>
          <dl className="mt-4 space-y-1.5 rounded-lg bg-page p-3 text-left text-sm">
            <div className="flex justify-between gap-3"><dt className="text-ink-soft">หัวข้อ</dt><dd className="font-medium">{done.title}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-soft">ห้อง</dt><dd className="font-medium">{room.name}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-soft">วันที่</dt><dd className="font-medium">{thaiDate(done.date, false)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-soft">เวลา</dt><dd className="font-medium">{fmt(done.start)} – {fmt(done.end)} น.</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-soft">ผู้จอง</dt><dd className="font-medium">{done.organizer}</dd></div>
          </dl>
          <div className="mt-5 flex gap-2">
            <button onClick={onViewTimeline} className="h-9 flex-1 rounded-lg border border-slate-300 bg-white text-sm font-semibold hover:bg-slate-50">ดูตารางเวลา</button>
            <button onClick={onClose} className="h-9 flex-1 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover">เสร็จสิ้น</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-title"
        noValidate
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="anim-pop max-h-full w-full max-w-[520px] overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="book-title" className="text-lg font-bold">จองห้องประชุม</h2>
            <p className="text-sm text-ink-soft">
              {room.name} · รองรับ {room.capacity} คน
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-md p-1.5 text-ink-soft hover:bg-slate-100">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">ห้องประชุม</span>
            <input readOnly value={room.name} className={`${field} bg-slate-50 text-ink-soft`} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">หัวข้อการประชุม</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ประชุมทีมประจำสัปดาห์"
              className={`${field} ${err(tried && !title.trim())}`}
            />
            {tried && !title.trim() && <span className="mt-1 block text-xs text-red-600">กรุณากรอกหัวข้อการประชุม</span>}
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">วันที่</span>
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">เวลาเริ่ม</span>
              <select value={start} onChange={(e) => setStart(Number(e.target.value))} className={`${field} ${err(!!conflict || badRange)}`}>
                {TIME_OPTIONS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{fmt(t)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">เวลาสิ้นสุด</span>
              <select value={end} onChange={(e) => setEnd(Number(e.target.value))} className={`${field} ${err(!!conflict || badRange)}`}>
                {TIME_OPTIONS.slice(1).map((t) => (
                  <option key={t} value={t}>{fmt(t)}</option>
                ))}
              </select>
            </label>
          </div>

          {conflict && (
            <div role="alert" className="flex gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <span className="mt-0.5 shrink-0"><AlertIcon size={16} /></span>
              <div>
                <p className="font-semibold">ช่วงเวลานี้มีผู้จองแล้ว</p>
                <p className="mt-0.5">
                  ชนกับ “{conflict.title}” ({fmt(conflict.start)} – {fmt(conflict.end)} น.) โดย {conflict.organizer} กรุณาเลือกเวลาอื่น
                </p>
              </div>
            </div>
          )}
          {badRange && !conflict && (
            <div role="alert" className="flex gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <span className="mt-0.5 shrink-0"><AlertIcon size={16} /></span>
              เวลาสิ้นสุดต้องหลังเวลาเริ่ม
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">จำนวนผู้เข้าร่วม</span>
              <input
                type="number"
                min={1}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value))}
                className={`${field} ${err(overCap)}`}
              />
              {overCap && <span className="mt-1 block text-xs text-red-600">ห้องนี้รองรับสูงสุด {room.capacity} คน</span>}
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">ชื่อผู้จอง</span>
              <input
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="ชื่อ-นามสกุล"
                className={`${field} ${err(tried && !organizer.trim())}`}
              />
              {tried && !organizer.trim() && <span className="mt-1 block text-xs text-red-600">กรุณากรอกชื่อผู้จอง</span>}
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              รายละเอียดเพิ่มเติม <span className="font-normal text-ink-soft">(ไม่บังคับ)</span>
            </span>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="เช่น ต้องการโปรเจกเตอร์ หรืออุปกรณ์ประชุมออนไลน์"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50">
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={!!conflict || badRange}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            ยืนยันการจอง
          </button>
        </div>
      </form>
    </div>
  )
}
