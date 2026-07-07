import { saveHomepageAction, saveSettingsAction } from "@/app/admin-actions";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { getBusinessSettings, getHomepageContent } from "@/lib/data";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [settings, content] = await Promise.all([getBusinessSettings(), getHomepageContent()]);

  return (
    <>
      <div className="admin-head"><div><h1>Website settings</h1><p>Manage public business details and homepage messaging.</p></div></div>
      <Flash success={params.success} error={params.error} />
      <div className="detail-grid">
        <form action={saveSettingsAction} className="panel form-grid">
          <div className="field field-full"><h2>Business details</h2></div>
          <div className="field"><label>Business name</label><input name="business_name" defaultValue={settings.business_name} required /></div>
          <div className="field"><label>Rental name</label><input name="rental_name" defaultValue={settings.rental_name} required /></div>
          <div className="field field-full"><label>Tagline</label><input name="tagline" defaultValue={settings.tagline} required /></div>
          <div className="field"><label>Location</label><input name="location" defaultValue={settings.location} required /></div>
          <div className="field"><label>Opening hours</label><input name="opening_hours" defaultValue={settings.opening_hours} required /></div>
          <div className="field"><label>Phone</label><input name="phone" defaultValue={settings.phone} required /></div>
          <div className="field"><label>WhatsApp number</label><input name="whatsapp" inputMode="tel" defaultValue={settings.whatsapp} required /><span className="meta">Use country code without spaces, for example 254742752439.</span></div>
          <div className="field field-full"><label>Email</label><input name="email" type="email" defaultValue={settings.email} required /></div>
          <div className="field field-full"><SubmitButton label="Save business settings" pendingLabel="Saving settings..." /></div>
        </form>

        <form action={saveHomepageAction} className="panel form-grid">
          <div className="field field-full"><h2>Homepage content</h2></div>
          <div className="field field-full"><label>Eyebrow</label><input name="eyebrow" defaultValue={content?.eyebrow ?? "Kilimani • Nairobi"} required /></div>
          <div className="field field-full"><label>Headline</label><input name="headline" defaultValue={content?.headline ?? "Your next car starts with StepOne."} required /></div>
          <div className="field field-full"><label>Supporting text</label><textarea name="supporting_text" rows={5} defaultValue={content?.supporting_text ?? "Buy confidently or request a reliable self-drive rental — all from one trusted automotive partner."} required /></div>
          <div className="field"><label>Primary button</label><input name="primary_button" defaultValue={content?.primary_button ?? "Browse cars for sale"} required /></div>
          <div className="field"><label>Secondary button</label><input name="secondary_button" defaultValue={content?.secondary_button ?? "Explore rentals"} required /></div>
          <div className="field field-full"><SubmitButton label="Save homepage content" pendingLabel="Saving homepage..." className="button button-blue" /></div>
        </form>
      </div>
    </>
  );
}
