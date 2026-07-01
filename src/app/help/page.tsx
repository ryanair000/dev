import { SiteShell } from "@/components/site-shell";

const faqs = [
  ["How do I enquire about a car?", "Open the vehicle page and use the enquiry, viewing or test-drive form."],
  ["Is a rental confirmed immediately?", "No. StepOne reviews availability and contacts you before confirmation."],
  ["Can I pay on the website?", "No online payment is collected in this version. Payment instructions follow approval."],
  ["What documents are required?", "A valid driving licence and National ID or passport are required for self-drive rentals."],
  ["Where do I collect the vehicle?", "Collection is normally arranged from StepOne in Kilimani unless agreed otherwise."],
];

export default function HelpPage() {
  return (
    <SiteShell>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Help centre</p>
              <h1>Questions before you buy or hire?</h1>
              <p>Review common questions and key rental terms before contacting the team.</p>
            </div>
          </div>
          <div className="detail-grid">
            <div className="panel panel-pad">
              <h2>Frequently asked questions</h2>
              {faqs.map(([question, answer]) => (
                <details key={question} className="faq-item">
                  <summary>{question}</summary>
                  <p className="meta">{answer}</p>
                </details>
              ))}
            </div>
            <aside className="panel panel-pad">
              <h2>Rental terms cover</h2>
              <ul className="feature-list feature-list-single">
                {[
                  "Driver eligibility and valid documents",
                  "Vehicle pickup and return inspection",
                  "Fuel and mileage limits",
                  "Security deposit where applicable",
                  "Customer responsibility for damage and fines",
                  "Late-return charges",
                  "Cancellation and rescheduling",
                  "Restricted use and travel locations",
                ].map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="meta">The final rental agreement is signed before vehicle collection.</p>
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
