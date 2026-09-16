import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  Coffee,
  HeartPulse,
  Hotel,
  MapPin,
  Play,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  OperationsPreview,
  PhonePreview,
  ProofVisual,
  SetupSteps,
} from "@/components/marketing/ProductVisuals";
import {
  MarketingCTA,
  WorkspaceLink,
} from "@/components/marketing/MarketingCTA";

export default function LandingPage() {
  return (
    <>
      <section className="home-hero marketing-container">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span /> Made for cleaning businesses
          </span>
          <h1>
            Great cleaning.
            <br />
            Less managing.
          </h1>
          <p>
            Bring your team, tasks, and locations together. Know who’s on site,
            what’s getting done, and where you’re needed.
          </p>
          <div className="hero-actions">
            <WorkspaceLink />
            <a
              href="#product-tour"
              className="marketing-button secondary-button"
            >
              <Play size={15} /> See how it works
            </a>
          </div>
          <div className="hero-assurance">
            <Check size={15} />
            <span>One workspace. A clearer working day.</span>
          </div>
        </div>
        <div className="hero-product-stage">
          <div className="hero-stage-shape" />
          <div className="hero-dashboard">
            <OperationsPreview />
          </div>
          <div className="floating-update">
            <span>
              <CircleCheckIcon />
            </span>
            <div>
              <b>Another task, taken care of.</b>
              <p>Reception & lobby · Photo submitted</p>
            </div>
            <span className="update-time">Just now</span>
          </div>
          <div className="hero-stage-caption">
            <span className="activity-dot" /> A little preview of a day under
            control.
          </div>
        </div>
      </section>
      <section className="industry-strip marketing-container">
        <p>For the spaces your team takes care of</p>
        <div>
          {[
            [Building2, "Offices"],
            [ShoppingBag, "Retail"],
            [HeartPulse, "Healthcare"],
            [Hotel, "Hospitality"],
            [Coffee, "Shared spaces"],
          ].map(([Icon, label]) => {
            const IndustryIcon = Icon as typeof Building2;
            return (
              <span key={String(label)}>
                <IndustryIcon size={22} strokeWidth={1.6} />
                {String(label)}
              </span>
            );
          })}
        </div>
      </section>
      <section
        className="marketing-section marketing-container"
        id="product-tour"
      >
        <div className="section-heading centered">
          <span className="section-kicker">
            Less back-and-forth. More getting things done.
          </span>
          <h2>
            Your whole operation.
            <br />
            Finally on the same page.
          </h2>
          <p>
            From the first check-in to the last task of the day, keep the
            details connected.
          </p>
        </div>
        <div className="value-columns">
          {[
            [
              MapPin,
              "Every location, in view",
              "Give each site its own team, schedule, and clear picture of progress.",
            ],
            [
              Users,
              "Everyone knows the plan",
              "Staff see their shifts and tasks. Managers see what needs attention.",
            ],
            [
              CheckCheck,
              "Work you can follow up on",
              "Keep attendance, task history, and photo evidence together.",
            ],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof MapPin;
            return (
              <article key={String(title)}>
                <span className="icon-tile">
                  <FeatureIcon size={22} />
                </span>
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="home-feature-band">
        <div className="marketing-container feature-split">
          <div className="feature-art mobile-art">
            <div className="mobile-art-circle" />
            <PhonePreview />
            <div className="mobile-floating">
              <span className="avatar">SM</span>
              <div>
                <b>Sarah’s ready for the day</b>
                <p>
                  <span className="activity-dot" /> Checked in at Westfield
                  Office
                </p>
              </div>
            </div>
          </div>
          <div className="feature-copy">
            <span className="section-kicker">
              Simple for the people doing the work
            </span>
            <h2>
              A clear next step.
              <br />
              Right in their pocket.
            </h2>
            <p>
              Give your team a straightforward way to check in, find their
              tasks, and show their work. All from their phone.
            </p>
            <ul className="marketing-check-list">
              <li>
                <Check /> Check in at the right location
              </li>
              <li>
                <Check /> Scan a QR code to start a task
              </li>
              <li>
                <Check /> Submit photos as each area is finished
              </li>
            </ul>
            <Link to="/features#attendance" className="marketing-text-link">
              Explore the staff experience <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="marketing-section marketing-container feature-split proof-split">
        <div className="feature-copy">
          <span className="section-kicker">
            A clearer picture of the finished job
          </span>
          <h2>
            More than
            <br />a tick on a checklist.
          </h2>
          <p>
            Connect every completed area to photo evidence. Compare submissions
            with reference images and see which ones need a closer look.
          </p>
          <Link to="/features#verification" className="marketing-text-link">
            See how photo verification works <ArrowRight size={17} />
          </Link>
          <div className="feature-note">
            <span className="icon-tile peach-tile">
              <CheckCheck size={21} />
            </span>
            <p>
              The task, the person, and the proof.
              <br />
              <b>All in the same place.</b>
            </p>
          </div>
        </div>
        <div className="feature-art proof-art">
          <ProofVisual />
        </div>
      </section>
      <section className="setup-section">
        <div className="marketing-container">
          <div className="section-heading centered">
            <span className="section-kicker">A straightforward start</span>
            <h2>
              Set up today.
              <br />
              Be ready for the next shift.
            </h2>
          </div>
          <SetupSteps />
          <div className="setup-bottom">
            <WorkspaceLink />
            <span>Create your account first. Choose your plan next.</span>
          </div>
        </div>
      </section>
      <MarketingCTA />
    </>
  );
}
function CircleCheckIcon() {
  return <Check size={21} strokeWidth={2.5} />;
}
