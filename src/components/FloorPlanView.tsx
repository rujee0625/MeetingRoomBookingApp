import { Component, Suspense, lazy, useState, type ReactNode } from 'react'
import { type Booking } from '../data'
import FloorPlan from './FloorPlan'

const Floor3D = lazy(() => import('./Floor3D'))

type Props = {
  bookings: Booking[]
  date: string
  selectedId: number | null
  onSelect: (id: number) => void
  visibleIds?: number[]
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function FloorPlanView(props: Props) {
  const [webgl] = useState(hasWebGL)
  const [mode, setMode] = useState<'3d' | '2d'>(webgl ? '3d' : '2d')
  const [failed, setFailed] = useState(false)
  const available3d = webgl && !failed

  const seg = (on: boolean) =>
    `h-8 px-3 text-xs font-semibold transition-colors duration-200 ${on ? 'bg-primary-soft text-primary' : 'text-ink-soft hover:bg-page'}`

  return (
    <div className="relative h-full w-full">
      {available3d && (
        <div role="group" aria-label="โหมดแสดงผังห้อง" className="absolute top-3 left-3 z-30 flex divide-x divide-line overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          </div>
      )}
      {!webgl && (
        <p role="status" className="absolute top-3 left-3 z-30 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800 ring-1 ring-amber-200">
          อุปกรณ์นี้ไม่รองรับ WebGL จึงแสดงผังแบบ 2 มิติแทน
        </p>
      )}
      {mode === '3d' && available3d ? (
        <Boundary onError={() => setFailed(true)}>
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-ink-soft">กำลังโหลดผังห้อง…</div>}>
            <Floor3D {...props} />
          </Suspense>
        </Boundary>
      ) : (
        <div className="flex h-full w-full items-center justify-center p-3">
          <FloorPlan {...props} />
        </div>
      )}
    </div>
  )
}
