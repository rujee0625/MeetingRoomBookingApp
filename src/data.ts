export type Room = { id: number; name: string; capacity: number; col: number; row: number }
export type Booking = {
  id: string
  roomId: number
  date: string
  start: number
  end: number
  title: string
  organizer: string
  details?: string
}
export type Status = 'free' | 'busy'
export type RoomState = 'free' | 'busy' | 'booked'

export const USER = { name: 'กัญญา พิทักษ์ไทย', role: 'ฝ่ายทรัพยากรบุคคล' }

export const TODAY = '2026-10-15'
export const NOW = 11 * 60 + 15
export const DAY_START = 8 * 60
export const DAY_END = 18 * 60

export const ROOMS: Room[] = [
  { id: 1, name: 'ห้องประชุม 1', capacity: 8, col: 0, row: 0 },
  { id: 2, name: 'ห้องประชุม 2', capacity: 12, col: 1, row: 0 },
  { id: 3, name: 'ห้องประชุม 3', capacity: 6, col: 2, row: 0 },
  { id: 4, name: 'ห้องประชุม 4', capacity: 20, col: 0, row: 1 },
  { id: 5, name: 'ห้องประชุม 5', capacity: 4, col: 1, row: 1 },
  { id: 6, name: 'ห้องประชุม 6', capacity: 10, col: 2, row: 1 },
]

export const pad = (n: number) => String(n).padStart(2, '0')
export const fmt = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

export function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

export function thaiDate(date: string, long = true) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', {
    weekday: long ? 'long' : undefined,
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric',
  })
}

const seed = (
  id: string,
  roomId: number,
  off: number,
  s: string,
  e: string,
  title: string,
  organizer: string,
): Booking => {
  const t = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3))
  return { id, roomId, date: shiftDate(TODAY, off), start: t(s), end: t(e), title, organizer }
}

export const SEED: Booking[] = [
  seed('a1', 1, 0, '09:00', '10:30', 'รายงานยอดขายไตรมาส 3', 'สมชาย ใจดี'),
  seed('a2', 1, 0, '11:00', '12:00', 'ประชุมทีมการตลาดประจำสัปดาห์', 'วิภา รัตนากร'),
  seed('a3', 1, 0, '14:00', '15:30', 'ทบทวนแผนผลิตภัณฑ์ 2027', 'ธนากร พงษ์ไพบูลย์'),
  seed('b1', 2, 0, '10:00', '11:00', 'สัมภาษณ์ผู้สมัครตำแหน่งนักบัญชี', 'ปวีณา สุขสันต์'),
  seed('b2', 2, 0, '13:00', '14:30', 'อบรมการใช้งานระบบ ERP ใหม่', 'อนันต์ ศรีสวัสดิ์'),
  seed('c1', 3, 0, '08:30', '09:30', 'ประชุมโครงการปรับปรุงสำนักงาน', 'กมลชนก แก้วมณี'),
  seed('d1', 4, 0, '10:30', '12:30', 'ประชุมใหญ่ฝ่ายขาย', 'ณัฐวุฒิ เจริญผล'),
  seed('d2', 4, 0, '15:00', '16:00', 'นำเสนอลูกค้า บริษัท สยามเทค', 'ศิริพร ทองคำ'),
  seed('e1', 5, 0, '13:30', '14:00', 'ซิงก์งานทีมออกแบบ', 'พิมพ์ชนก อรุณรัตน์'),
  seed('f1', 6, 0, '08:30', '09:30', 'สรุปงานฝ่ายบัญชีรายวัน', 'จิราพร วงศ์ใหญ่'),
  seed('g1', 1, 1, '09:30', '11:00', 'Kick-off โครงการแอปมือถือ', 'ธนากร พงษ์ไพบูลย์'),
  seed('g2', 2, 1, '13:00', '15:00', 'อบรมความปลอดภัยข้อมูล', 'อนันต์ ศรีสวัสดิ์'),
  seed('g3', 4, 1, '10:00', '12:00', 'ประชุมผู้บริหารประจำเดือน', 'ณัฐวุฒิ เจริญผล'),
]

export function roomBookings(all: Booking[], roomId: number, date: string) {
  return all.filter((b) => b.roomId === roomId && b.date === date).sort((a, b) => a.start - b.start)
}

export function getInfo(all: Booking[], roomId: number, date: string) {
  const list = roomBookings(all, roomId, date)
  const isToday = date === TODAY
  const current = isToday ? list.find((b) => b.start <= NOW && NOW < b.end) : undefined
  const next = list.find((b) => (isToday ? b.start > NOW : true) && b !== current)
  const status: Status = current ? 'busy' : 'free'
  return { status, current, next }
}

export function findConflict(all: Booking[], roomId: number, date: string, start: number, end: number) {
  return roomBookings(all, roomId, date).find((b) => start < b.end && end > b.start)
}

export function freeGaps(list: Booking[], date: string) {
  const gaps: { start: number; end: number }[] = []
  let cursor = date === TODAY ? Math.max(DAY_START, Math.ceil(NOW / 30) * 30) : DAY_START
  for (const b of list) {
    if (b.start > cursor) gaps.push({ start: cursor, end: b.start })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < DAY_END) gaps.push({ start: cursor, end: DAY_END })
  return gaps
}

export const TIME_OPTIONS = Array.from({ length: 21 }, (_, i) => DAY_START + i * 30)

export const STATE_META: Record<
  RoomState,
  { label: string; color: string; tint: string; text: string; marker: string; badge: string }
> = {
  free: { label: 'ว่าง', color: '#22c55e', tint: '#bbf7d0', text: 'text-free', marker: 'rounded-full bg-green-500', badge: 'bg-free-soft text-free' },
  busy: { label: 'กำลังใช้งาน', color: '#f97316', tint: '#fed7aa', text: 'text-busy', marker: 'rounded-[2px] bg-orange-500', badge: 'bg-busy-soft text-busy' },
  booked: { label: 'มีรายการจอง', color: '#3b82f6', tint: '#bfdbfe', text: 'text-blue-700', marker: 'rotate-45 rounded-[1px] bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
}

export function roomState(all: Booking[], roomId: number, date: string) {
  const info = getInfo(all, roomId, date)
  const state: RoomState = info.current ? 'busy' : info.next ? 'booked' : 'free'
  return { ...info, state, meta: STATE_META[state] }
}
