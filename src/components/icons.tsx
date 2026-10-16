import type { ReactNode } from 'react'

const base = (children: ReactNode, size = 16) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

export const UsersIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    size,
  )
export const ClockIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    size,
  )
export const CalendarIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>,
    size,
  )
export const ChevronLeft = ({ size }: { size?: number }) => base(<path d="m15 18-6-6 6-6" />, size)
export const ChevronRight = ({ size }: { size?: number }) => base(<path d="m9 18 6-6-6-6" />, size)
export const ArrowLeft = ({ size }: { size?: number }) => base(<path d="M19 12H5M12 19l-7-7 7-7" />, size)
export const CloseIcon = ({ size }: { size?: number }) => base(<path d="M18 6 6 18M6 6l12 12" />, size)
export const AlertIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <path d="m10.3 3.9-8.2 14A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-3l-8.2-14a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>,
    size,
  )
export const CheckIcon = ({ size }: { size?: number }) => base(<path d="M20 6 9 17l-5-5" />, size)
export const UserIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>,
    size,
  )
export const MapIcon = ({ size }: { size?: number }) =>
  base(
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15M15 6v15" />
    </>,
    size,
  )
export const BellIcon = ({ size }: { size?: number }) =>
  base(<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />, size)
export const PlusIcon = ({ size }: { size?: number }) => base(<path d="M12 5v14M5 12h14" />, size)
export const MinusIcon = ({ size }: { size?: number }) => base(<path d="M5 12h14" />, size)
export const ResetIcon = ({ size }: { size?: number }) =>
  base(<path d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 0 0 6 6.3L4 10M4 14a8 8 0 0 0 14 3.7l2-3.7" />, size)
export const RotateLeftIcon = ({ size }: { size?: number }) => base(<path d="M3 4v6h6M3.5 10A9 9 0 1 1 5 16.5" />, size)
export const RotateRightIcon = ({ size }: { size?: number }) => base(<path d="M21 4v6h-6M20.5 10A9 9 0 1 0 19 16.5" />, size)
export const SearchIcon = ({ size }: { size?: number }) => base(<path d="m21 21-4.3-4.3M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0" />, size)
