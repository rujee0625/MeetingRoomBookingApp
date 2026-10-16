import { useEffect, useRef, useState } from 'react'
import BookingModal from './components/BookingModal'
import DayGantt from './components/DayGantt'
import FloorPlanView from './components/FloorPlanView'
import RoomFilters, { matchingIds, type CapacityFilter, type StatusFilter } from './components/RoomFilters'
import RoomPanel from './components/RoomPanel'
import Timeline from './components/Timeline'
import TopBar from './components/TopBar'
import { NOW, ROOMS, SEED, TODAY, freeGaps, getInfo, roomBookings, roomState, type Booking } from './data'

type ModalState = { start: number; end: number } | null
type View = 'plan' | 'timeline'

export default function App() {
  const [date, setDate] = useState(TODAY)
  const [bookings, setBookings] = useState<Booking[]>(SEED)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [view, setView] = useState<View>('plan')
  const [modal, setModal] = useState<ModalState>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [capFilter, setCapFilter] = useState<CapacityFilter>(0)
  const [ganttOpen, setGanttOpen] = useState(false)
  const lastId = useRef<number | null>(null)
  if (selectedId) lastId.current = selectedId
  const panelId = selectedId ?? lastId.current
  const open = selectedId !== null

  useEffect(() => {
    if (!ganttOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGanttOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ganttOpen])

  const openBooking = (range?: { start: number; end: number }, roomId = selectedId) => {
    if (range) return setModal(range)
    const gap = roomId ? freeGaps(roomBookings(bookings, roomId, date), date)[0] : undefined
    const start = gap?.start ?? (date === TODAY ? Math.ceil(NOW / 30) * 30 : 9 * 60)
    setModal({ start, end: Math.min(start + 60, 18 * 60) })
  }

  const bookNew = () => {
    const id = selectedId ?? ROOMS.find((r) => getInfo(bookings, r.id, date).status === 'free')?.id ?? 1
    setSelectedId(id)
    openBooking(undefined, id)
  }

  const bookAt = (roomId: number, start: number) => {
    setSelectedId(roomId)
    setModal({ start, end: Math.min(start + 60, 18 * 60) })
  }

  const confirm = (b: Omit<Booking, 'id'>) => {
    setBookings((prev) => [...prev, { ...b, id: `n${Date.now()}` }])
    setDate(b.date)
  }

  const select = (id: number) => {
    setSelectedId(id)
    setView('plan')
  }


  return (
    <div translate="no" lang="th" className="app-bg flex h-screen min-h-[720px] flex-col gap-4 overflow-hidden p-4">
      <TopBar query={query} onQuery={setQuery} onBook={bookNew} />

      <div className="flex min-h-0 flex-1 gap-4">
        <main className="glass flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border-0! bg-transparent!">
          {view === 'plan' || !selectedId ? (
            <>
              <div className="flex shrink-0 items-end justify-between px-7 pt-5">
                <div>
                  <h1 className="mt-0.5 text-3xl font-bold tracking-tight">ผังห้องประชุม</h1>
                  <p className="mt-0.5 text-sm text-ink-soft">เลือกห้องเพื่อดูรายละเอียด ตารางเวลา และจองได้ทันที</p>
                </div>
              </div>
              <RoomFilters
                bookings={bookings}
                date={date}
                status={statusFilter}
                capacity={capFilter}
                selectedId={selectedId}
                onStatus={setStatusFilter}
                onCapacity={setCapFilter}
                onSelect={select}
              />
              <div className="min-h-0 flex-1">
                <FloorPlanView
                  bookings={bookings}
                  date={date}
                  selectedId={selectedId}
                  onSelect={select}
                  visibleIds={matchingIds(bookings, date, statusFilter, capFilter)}
                />
              </div>
            </>
          ) : (
            <Timeline
              roomId={selectedId}
              bookings={bookings}
              date={date}
              onBack={() => setView('plan')}
              onBookSlot={(start, end) => openBooking({ start, end })}
            />
          )}
        </main>

        <div
          aria-hidden={!open}
          inert={!open}
          className={`flex shrink-0 overflow-hidden transition-[width,margin] duration-300 ease-out motion-reduce:transition-none ${
            open ? 'ml-0 w-[400px]' : '-ml-4 w-0'
          }`}
        >
          <div
            className={`flex w-[400px] shrink-0 flex-col transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
              open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            {panelId && (
              <RoomPanel
                key={panelId}
                roomId={panelId}
                bookings={bookings}
                date={date}
                onBook={() => openBooking()}
                onTimeline={() => setGanttOpen(true)}
                onClose={() => {
                  setSelectedId(null)
                  setView('plan')
                }}
              />
            )}
          </div>
        </div>
      </div>

      {ganttOpen && (
        <div className="anim-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={() => setGanttOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ตารางเวลาห้องประชุมทั้งหมด"
            className="relative w-full max-w-[820px]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DayGantt
              bookings={bookings}
              date={date}
              selectedId={selectedId}
              onDate={setDate}
              onSelectRoom={(id) => {
                select(id)
                setGanttOpen(false)
              }}
              onBookAt={(id, start) => {
                setGanttOpen(false)
                bookAt(id, start)
              }}
              onClose={() => setGanttOpen(false)}
            />
          </div>
        </div>
      )}

      {modal && selectedId && (
        <BookingModal
          roomId={selectedId}
          bookings={bookings}
          initialDate={date}
          initialStart={modal.start}
          initialEnd={modal.end}
          onClose={() => setModal(null)}
          onConfirm={confirm}
          onViewTimeline={() => {
            setModal(null)
            setView('timeline')
          }}
        />
      )}
    </div>
  )
}
