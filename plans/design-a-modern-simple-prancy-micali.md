# Plan: Meeting room booking dashboard (Thai, 6 rooms)

## Context
Scaffold is empty (`src/App.tsx` is a blank div, `src/index.css` only imports Tailwind). Build a desktop-first booking dashboard with an isometric floor plan as the focus. The brief fixes the aesthetic (clean Thai enterprise SaaS, white on light gray, blue primary, green available, orange in use), so no `create_make_theme` call is needed. Stance: restrained, compact, high-contrast.

## Files
- `src/index.css`: Google Fonts `@import` for Noto Sans Thai (400/500/600/700) placed first, then `@import 'tailwindcss'`. Add `@theme` tokens (`--font-sans`, `--color-primary` blue, `--color-free` green, `--color-busy` orange, `--color-next` blue) and a thin-scrollbar rule.
- `src/App.tsx`: page shell and state: `selectedId`, `view` (`plan` | `timeline`), `date`, `bookings`, `modal` (`{open, prefillStart?}`).
- `src/data.ts`: 6 rooms (name, number, capacity, floor-plan position) and seed bookings for 2026-10-15. Room 1/4 in use now, 2/5 have a next booking, 3/6 free. Helpers: `getStatus(room, bookings, date, now)`, `hasConflict`, `slotsFor`.
- `src/components/Header.tsx`: title "จองห้องประชุม", today's date in Thai (Buddhist-year format via `toLocaleDateString('th-TH')`), date input with prev/next arrows, legend (green ว่าง, orange กำลังใช้งาน, blue มีรายการจองถัดไป).
- `src/components/FloorPlan.tsx`: isometric scene in CSS 3D (`rotateX(60deg) rotateZ(-45deg)` on a floor slab). Six extruded box rooms in a 3x2 grid with a corridor. Each room is a div with a flat top face and two side faces built from skewed divs. Top is colored by status, with a selected state (blue outline, lifted via `translateZ`). Labels are counter-rotated flat HTML chips above each room (name plus status pill) so they stay readable. Rooms are `<button>`s with focus rings. Walls are low so labels are never hidden.
- `src/components/RoomPanel.tsx`: right panel (about 340px) with an empty state, the room header, a status badge, capacity, current meeting plus end time, next booking, and the buttons "จองห้อง" (primary) and "ดูตารางเวลา" (secondary).
- `src/components/Timeline.tsx`: replaces the floor plan in the main area. A "← กลับไปผังห้อง" button, then a vertical 08:00–18:00 hour grid. Bookings are blue blocks (title, start–end, organizer). Free gaps are dashed green blocks, each with a "จองช่วงเวลานี้" button that opens the modal prefilled with that slot.
- `src/components/BookingModal.tsx`: fields are room name (read-only), title, date, start and end (30-minute select), attendees (max capacity), organizer, and optional details. A conflict check runs live and shows a red inline alert, "ช่วงเวลานี้ชนกับ <title> (HH:MM–HH:MM)", and disables "ยืนยันการจอง". Also checks end > start. Buttons are "ยืนยันการจอง" and "ยกเลิก". A successful submit adds the booking, closes the modal, and updates the plan and panel.

## Layout
Header bar (white, 1px border). Below it, a two-column grid: the floor plan card (flex-1, white, on a `#F3F4F6` page) and the 340px details panel. Collapse the panel below 1000px. Status is never conveyed by color alone: each label chip includes text and an icon. Use inline SVG icons (users, clock, calendar) to avoid a new dependency.

## Verification
- Run the dev server (already running). Check the 5 states in the preview: dashboard, available room selected, in-use room selected, timeline, modal with a conflict (e.g. book 10:00–11:00 in a room already booked then).
- Confirm Thai text renders in Noto Sans Thai and that labels do not skew with the 3D transform.
