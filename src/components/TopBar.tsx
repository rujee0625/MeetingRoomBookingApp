import { NOW, TODAY, USER, fmt, thaiDate } from "../data"
import { BellIcon, PlusIcon, SearchIcon } from "./icons"
import { Logo } from "./Sidebar"

export default function TopBar({
  query,
  onQuery,
  onBook,
}: {
  query: string
  onQuery: (q: string) => void
  onBook: () => void
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-x-4 gap-y-4">
      <div className="shrink-0 pl-2">
        <Logo />
      </div>

      <div className="flex items-center gap-4">
        <div className="glass flex h-14 flex-col justify-center rounded-full px-6 leading-tight">
          <span className="text-xs text-ink-soft">{thaiDate(TODAY)}</span>
          <span className="text-lg font-bold tabular-nums">{fmt(NOW)} น.</span>
        </div>

        <button
          aria-label="การแจ้งเตือน มี 1 รายการใหม่"
          className="glass relative flex h-14 w-14 items-center justify-center rounded-full hover:bg-white"
        >
          <BellIcon size={20} />
          <span className="absolute top-3.5 right-4 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="glass flex h-14 items-center gap-3 rounded-full py-2 pr-6 pl-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-white"
            aria-hidden="true"
          >
            {USER.name[0]}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{USER.name}</p>
            <p className="text-xs text-ink-soft">{USER.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
