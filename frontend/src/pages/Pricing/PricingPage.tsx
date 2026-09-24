import { Check, Minus, Plus } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { MarketingCTA } from "@/components/marketing/MarketingCTA";
import { PaddlePricing } from "./PaddlePricing";

const comparisons: { name: string; values: (string | boolean)[] }[] = [
  { name: "Locations", values: ["1", "5", "Discuss your needs"] },
  { name: "Staff members", values: ["3", "25", "Discuss your needs"] },
  { name: "Manager seats, including your admin", values: ["1", "3", "Discuss your needs"] },
  { name: "Reference areas per task", values: ["1", "5", "Discuss your needs"] },
  { name: "GPS attendance & selfies", values: [true, true, true] },
  { name: "Daily & one-time tasks", values: [true, true, true] },
  { name: "QR-based task starting", values: [true, true, true] },
  { name: "Photo verification", values: [true, true, true] },
  { name: "Manager location access", values: [false, true, true] },
  { name: "Automatic assignment & reassignment", values: [false, true, true] },
  { name: "Multi-area tasks", values: [false, true, true] },
  { name: "Detailed verification insights", values: [false, true, true] },
];
const faqs = [
  [
    "How do I get started?",
    "For Starter or Pro, create your account first, then choose a plan for your workspace. For Enterprise, contact us to discuss your requirements. After checkout confirms your subscription, you can add locations, create staff accounts, and set up your first tasks.",
  ],
  [
    "What counts as a manager seat?",
    "Your company administrator counts as one manager seat. Pro includes additional manager seats. For Enterprise, we will discuss how many seats your operation needs. Managers can be assigned to specific locations. Staff accounts have their own separate allowance.",
  ],
  [
    "Can my staff use Hygene Ops on their phones?",
    "Yes. The staff app supports check-in, QR scanning, and task photo submissions. Your team can follow their assigned work from a mobile device.",
  ],
  [
    "What happens if I reach a plan limit?",
    "Your existing resources stay in place. To add more active locations, staff, managers, or reference areas than your plan allows, choose a plan with higher limits.",
  ],
  [
    "How do I manage my subscription?",
    "Your company administrator can open Plan & usage in the workspace and select Manage billing to access the Paddle customer portal.",
  ],
  [
    "Why are prices shown in my local currency?",
    "Paddle localizes prices for your region. Your final total and any applicable taxes are shown during checkout before you confirm.",
  ],
];

export default function PricingPage() {
  const { user } = useAuth();
  const cannotSubscribe = user?.role === "MANAGER" || user?.role === "STAFF";
  return (
    <>
      <section className="pricing-hero marketing-container">
        <div className="section-heading centered">
          <span className="hero-eyebrow">
            <span /> Simple plans. Room to grow.
          </span>
          <h1>
            A little team.
            <br />
            Or your next big chapter.
          </h1>
          <p>
            Choose the space your operation needs. Every plan brings your
            people, places, and tasks together.
          </p>
        </div>
      </section>
      <section className="marketing-container" aria-label="Subscription plans">
        <PaddlePricing
          appearance="marketing"
          subscribeDisabled={cannotSubscribe}
          disabledMessage="Only the company administrator can subscribe for this workspace."
        />
      </section>
      <section className="marketing-container comparison-section">
        <div className="comparison-heading">
          <div>
            <span className="section-kicker">Find your fit</span>
            <h2>The details, side by side.</h2>
            <p>
              Start with what you need today. See exactly what each plan
              includes.
            </p>
          </div>
        </div>
        <div
          className="comparison-scroll"
          tabIndex={0}
          role="region"
          aria-label="Compare plans, scroll horizontally on small screens"
        >
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">What’s included</th>
                <th scope="col">Starter</th>
                <th scope="col" className="pro-col">
                  Pro
                </th>
                <th scope="col">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.name}>
                  <th scope="row">{row.name}</th>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={index === 1 ? "pro-col" : undefined}
                    >
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check aria-label="Included" />
                        ) : (
                          <Minus aria-label="Not included" />
                        )
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="marketing-container pricing-faq">
        <div className="section-heading">
          <span className="section-kicker">
            A few things you might be wondering
          </span>
          <h2>
            Good questions.
            <br />
            Clear answers.
          </h2>
          <p>A little more detail before you get started.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <Plus aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <MarketingCTA />
    </>
  );
}
