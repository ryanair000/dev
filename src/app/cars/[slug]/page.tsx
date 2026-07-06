import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAppointmentAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { SiteShell } from "@/components/site-shell";
import { getVehicleBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ sent?: string; error?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  return { title: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle not found" };
}

export default async function CarDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  const messages = await searchParams;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle || vehicle.listing_type !== "sale") notFound();

  const cover = vehicle.images?.find((image) => image.is_cover) ?? vehicle.images?.[0];
  const path = `/cars/${vehicle.slug}`;

  return (
    <SiteShell>
      <section className="section">
        <div className="container">
          <Flash sent={messages.sent} error={messages.error} />
          <Link href="/cars" className="back-link">Back to cars</Link>
          <div className="detail-grid detail-layout">
            <div>
              <div className="detail-image">
                <img src={cover?.image_url || "/vehicles/showroom-silver-suv.jpg"} alt={`${vehicle.make} ${vehicle.model}`} />
              </div>
              <div className="panel panel-pad detail-panel">
                <h2>Overview</h2>
                <p>{vehicle.description}</p>
                <ul className="feature-list">{vehicle.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </div>
            </div>
            <aside className="detail-sidebar">
              <div className="panel panel-pad">
                <span className="pill pill-red">For sale</span>
                <h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <p className="price text-red">{vehicle.contact_for_price ? "Contact for Price" : formatCurrency(vehicle.sale_price)}</p>
                <div className="spec-grid">
                  <div className="spec"><small>Mileage</small><strong>{vehicle.mileage?.toLocaleString() ?? "Not listed"} km</strong></div>
                  <div className="spec"><small>Transmission</small><strong>{vehicle.transmission}</strong></div>
                  <div className="spec"><small>Fuel</small><strong>{vehicle.fuel_type}</strong></div>
                  <div className="spec"><small>Location</small><strong>{vehicle.location}</strong></div>
                </div>
              </div>
              <form action="/api/enquiries" method="post" className="panel form-grid">
                <input type="hidden" name="vehicle_id" value={vehicle.id} />
                <input type="hidden" name="return_to" value={path} />
                <input type="hidden" name="enquiry_type" value="Vehicle availability" />
                <div className="field field-full"><h3>Enquire about this car</h3></div>
                <div className="field"><label>Full name</label><input name="full_name" required /></div>
                <div className="field"><label>Phone</label><input name="phone" required /></div>
                <div className="field"><label>Email</label><input name="email" type="email" /></div>
                <div className="field"><label>Preferred contact</label><select name="preferred_contact"><option>WhatsApp</option><option>Phone</option><option>Email</option></select></div>
                <div className="field field-full"><label>Message</label><textarea name="message" defaultValue={`I would like to know more about the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`} required /></div>
                <div className="field field-full"><button className="button button-primary" type="submit">Send enquiry</button></div>
              </form>
              <form action={createAppointmentAction} className="panel form-grid">
                <input type="hidden" name="vehicle_id" value={vehicle.id} />
                <input type="hidden" name="return_to" value={path} />
                <div className="field field-full"><h3>Book a viewing or test drive</h3></div>
                <div className="field"><label>Type</label><select name="appointment_type"><option value="viewing">Vehicle viewing</option><option value="test_drive">Test drive</option></select></div>
                <div className="field"><label>Full name</label><input name="full_name" required /></div>
                <div className="field"><label>Phone</label><input name="phone" required /></div>
                <div className="field"><label>Email</label><input name="email" type="email" /></div>
                <div className="field"><label>Date</label><input name="scheduled_date" type="date" required /></div>
                <div className="field"><label>Time</label><input name="scheduled_time" type="time" defaultValue="11:00" required /></div>
                <div className="field field-full checks"><label><input type="checkbox" name="licence_confirmed" value="yes" /> I have a valid driving licence for a test drive</label></div>
                <div className="field field-full"><label>Message</label><textarea name="message" /></div>
                <div className="field field-full"><button className="button button-dark" type="submit">Request appointment</button></div>
              </form>
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
