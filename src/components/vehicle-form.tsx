"use client";

import { useEffect, useMemo, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { Vehicle } from "@/types";

export function VehicleForm({ vehicle }: { vehicle?: Vehicle | null }) {
  const currentCover = useMemo(
    () => vehicle?.images?.find((image) => image.is_cover) ?? vehicle?.images?.[0] ?? null,
    [vehicle],
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(null);
      setSelectedName("");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedName(file.name);
  }

  const displayImage = previewUrl ?? currentCover?.image_url ?? null;

  return (
    <form action="/api/admin/vehicles" method="post" className="panel form-grid" encType="multipart/form-data">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <div className="field"><label>Listing type</label><select name="listing_type" defaultValue={vehicle?.listing_type ?? "sale"}><option value="sale">Car for sale</option><option value="rental">Rental car</option></select></div>
      <div className="field"><label>Make</label><input name="make" defaultValue={vehicle?.make} required /></div>
      <div className="field"><label>Model</label><input name="model" defaultValue={vehicle?.model} required /></div>
      <div className="field"><label>Year</label><input name="year" type="number" min="1980" max="2100" defaultValue={vehicle?.year ?? new Date().getFullYear()} required /></div>
      <div className="field"><label>Body type</label><input name="body_type" defaultValue={vehicle?.body_type ?? "SUV"} required /></div>
      <div className="field"><label>Colour</label><input name="color" defaultValue={vehicle?.color ?? ""} /></div>
      <div className="field"><label>Mileage (km)</label><input name="mileage" type="number" min="0" defaultValue={vehicle?.mileage ?? ""} /></div>
      <div className="field"><label>Transmission</label><input name="transmission" defaultValue={vehicle?.transmission ?? "Automatic"} required /></div>
      <div className="field"><label>Fuel type</label><input name="fuel_type" defaultValue={vehicle?.fuel_type ?? "Petrol"} required /></div>
      <div className="field"><label>Engine capacity</label><input name="engine_capacity" defaultValue={vehicle?.engine_capacity ?? ""} /></div>
      <div className="field"><label>Seats</label><input name="seats" type="number" min="1" defaultValue={vehicle?.seats ?? 5} /></div>
      <div className="field"><label>Drive type</label><input name="drive_type" defaultValue={vehicle?.drive_type ?? "2WD"} /></div>
      <div className="field"><label>Luggage capacity</label><input name="luggage_capacity" defaultValue={vehicle?.luggage_capacity ?? "4 bags"} /></div>
      <div className="field"><label>Location</label><input name="location" defaultValue={vehicle?.location ?? "Kilimani, Nairobi"} required /></div>
      <div className="field"><label>Sale price (KSh)</label><input name="sale_price" type="number" min="1" defaultValue={vehicle?.sale_price ?? ""} /></div>
      <div className="field"><label>Daily rate (KSh)</label><input name="daily_rate" type="number" min="1" defaultValue={vehicle?.daily_rate ?? ""} /></div>
      <div className="field"><label>Weekly rate (KSh)</label><input name="weekly_rate" type="number" min="1" defaultValue={vehicle?.weekly_rate ?? ""} /></div>
      <div className="field"><label>Monthly rate (KSh)</label><input name="monthly_rate" type="number" min="1" defaultValue={vehicle?.monthly_rate ?? ""} /></div>
      <div className="field"><label>Status</label><select name="status" defaultValue={vehicle?.status ?? "available"}><option>available</option><option>reserved</option><option>rented</option><option>sold</option><option>maintenance</option><option>unavailable</option><option>draft</option></select></div>

      <div className="field field-full vehicle-image-editor">
        <div className="vehicle-image-preview">
          {displayImage ? <img src={displayImage} alt="Vehicle image preview" /> : <div className="vehicle-image-placeholder">No image selected</div>}
        </div>
        <div className="vehicle-image-copy">
          <strong>{previewUrl ? "New cover image ready" : currentCover ? "Current cover image" : "Add a cover image"}</strong>
          <p>{previewUrl ? `${selectedName} will replace the current vehicle image after saving.` : "Uploading a new JPG, PNG or WebP image replaces the current cover image across the website."}</p>
          <div className="field" style={{ marginTop: 12 }}>
            <label>{vehicle ? "Replace vehicle photo" : "Vehicle photo"} <small>(max 4 MB)</small></label>
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </div>
        </div>
      </div>

      <div className="field field-full"><label>Description</label><textarea name="description" rows={5} defaultValue={vehicle?.description ?? "A clean, reliable and well-presented vehicle available from StepOne Autodealers."} required /></div>
      <div className="field field-full"><label>Features (comma-separated)</label><textarea name="features" rows={3} defaultValue={vehicle?.features?.join(", ") ?? "Reverse camera, Bluetooth, Air conditioning, Alloy wheels"} /></div>
      <div className="field field-full checks">
        <label><input type="checkbox" name="contact_for_price" value="yes" defaultChecked={vehicle?.contact_for_price} /> Contact for Price</label>
        <label><input type="checkbox" name="featured" value="yes" defaultChecked={vehicle?.featured} /> Feature on homepage</label>
        <label><input type="checkbox" name="published" value="yes" defaultChecked={vehicle?.published ?? true} /> Published publicly</label>
      </div>
      <div className="field field-full"><SubmitButton label="Save vehicle" pendingLabel="Saving vehicle..." /></div>
    </form>
  );
}
