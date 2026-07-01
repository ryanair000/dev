import { getRentalRequests } from "@/lib/data";

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}
function dayStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function label(date: Date) { return new Intl.DateTimeFormat("en-KE", { weekday: "short", day: "numeric", month: "short" }).format(date); }

export default async function CalendarPage(){
  const rentals=await getRentalRequests();
  const today=dayStart(new Date());
  const start=addDays(today,-((today.getDay()+6)%7));
  const days=Array.from({length:14},(_,index)=>addDays(start,index));
  return <><div className="admin-head"><div><h1>Rental calendar</h1><p>Upcoming pickups, active hires and returns.</p></div></div><div className="calendar-grid">{days.map(day=>{const startDay=dayStart(day);const endDay=addDays(startDay,1);const events=rentals.filter(r=>new Date(r.pickup_at)<endDay&&new Date(r.return_at)>=startDay&&["approved","active"].includes(r.status));return <div className="calendar-day" key={day.toISOString()}><strong>{label(day)}</strong>{events.map(event=><div className="calendar-event" key={event.id}>{event.vehicle?.model} • {event.full_name}<br/>{event.status}</div>)}</div>})}</div></>;
}
