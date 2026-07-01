import { notFound } from "next/navigation";
import { Flash } from "@/components/flash";
import { VehicleForm } from "@/components/vehicle-form";
import { getVehicleById } from "@/lib/data";
type Params=Promise<{id:string}>;type SearchParams=Promise<{saved?:string;error?:string}>;
export default async function EditVehiclePage({params,searchParams}:{params:Params;searchParams:SearchParams}){const {id}=await params;const messages=await searchParams;const vehicle=await getVehicleById(id);if(!vehicle)notFound();return <><div className="admin-head"><div><h1>Edit {vehicle.make} {vehicle.model}</h1><p>{vehicle.year} • {vehicle.body_type} • {vehicle.status}</p></div></div><Flash sent={messages.saved} error={messages.error}/><VehicleForm vehicle={vehicle}/></>}
