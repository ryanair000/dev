import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { VehicleCard } from "@/components/vehicle-card";
import { getVehicles } from "@/lib/data";

type SearchParams=Promise<{q?:string;body?:string}>;
export const dynamic="force-dynamic";
export default async function RentalsPage({searchParams}:{searchParams:SearchParams}){const params=await searchParams;const vehicles=await getVehicles({listingType:"rental",published:true,query:params.q,bodyType:params.body});const all=await getVehicles({listingType:"rental",published:true});const bodies=[...new Set(all.map(v=>v.body_type))].sort();return <SiteShell><section className="section"><div className="container"><div className="section-head"><div><p className="eyebrow">Self-drive rentals</p><h1>A car for every kind of journey.</h1><p>Request clean, reliable vehicles for daily, weekly or monthly use.</p></div><Link href="/rentals/request" className="button button-blue">Request a rental</Link></div><form className="panel search-bar"><input name="q" defaultValue={params.q} placeholder="Search make or model"/><select name="body" defaultValue={params.body??""}><option value="">All categories</option>{bodies.map(body=><option key={body}>{body}</option>)}</select><button className="button button-blue" type="submit">Search</button></form>{vehicles.length?<div className="grid-3">{vehicles.map(vehicle=><VehicleCard key={vehicle.id} vehicle={vehicle}/>)}</div>:<div className="panel empty">No rentals match those filters.</div>}</div></section></SiteShell>}
