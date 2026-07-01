import { createEnquiryAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { SiteShell } from "@/components/site-shell";
import { getBusinessSettings } from "@/lib/data";

type SearchParams = Promise<{ sent?: string; error?: string }>;
export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const settings = await getBusinessSettings();
  const telHref = `tel:${settings.phone.replace(/[^\d+]/g, "")}`;

  return (
    <SiteShell>
      <section className="page-hero contact-hero">
        <div className="container page-hero-grid">
          <div>
            <p className="eyebrow">Contact StepOne</p>
            <h1>Talk to the team in Kilimani.</h1>
            <p>Call, WhatsApp or send a direct enquiry about buying, renting, viewing or sourcing a vehicle.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={telHref}>{settings.phone}</a>
              <a className="button button-blue" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp us</a>
            </div>
          </div>
          <img src="/vehicles/showroom-silver-suv.jpg" alt="Vehicle handover in a showroom" />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Flash sent={params.sent} error={params.error} />
          <div className="detail-grid">
            <aside className="panel panel-pad contact-card">
              <h2>Contact details</h2>
              <p><strong>Location</strong><br />{settings.location}</p>
              <p><strong>Phone</strong><br /><a href={telHref}>{settings.phone}</a></p>
              <p><strong>Email</strong><br />{settings.email}</p>
              <p><strong>Hours</strong><br />{settings.opening_hours}</p>
              <a className="button button-blue" href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            </aside>
            <form action={createEnquiryAction} className="panel form-grid">
              <input type="hidden" name="return_to" value="/contact" />
              <div className="field field-full"><h2>Send a message</h2></div>
              <div className="field"><label>Full name</label><input name="full_name" required /></div>
              <div className="field"><label>Phone</label><input name="phone" required /></div>
              <div className="field"><label>Email</label><input name="email" type="email" /></div>
              <div className="field"><label>Preferred contact</label><select name="preferred_contact"><option>WhatsApp</option><option>Phone</option><option>Email</option></select></div>
              <div className="field field-full"><label>Enquiry type</label><select name="enquiry_type"><option>General enquiry</option><option>Price enquiry</option><option>Vehicle sourcing</option><option>Trade-in</option><option>Car rental</option></select></div>
              <div className="field field-full"><label>Message</label><textarea name="message" rows={6} required /></div>
              <div className="field field-full"><button className="button button-primary" type="submit">Send enquiry</button></div>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
