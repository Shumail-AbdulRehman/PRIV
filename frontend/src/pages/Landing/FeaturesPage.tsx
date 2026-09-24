import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AttendanceVisual,
  OperationsPreview,
  ProofVisual,
  ScheduleVisual,
  SetupSteps,
} from "@/components/marketing/ProductVisuals";
import {
  MarketingCTA,
  WorkspaceLink,
} from "@/components/marketing/MarketingCTA";

export default function FeaturesPage() {
  return (
    <>
      <section className="features-hero marketing-container">
        <div className="section-heading centered">
          <span className="hero-eyebrow">
            <span /> Built around the way you work
          </span>
          <h1>
            The details handled.
            <br />
            The bigger picture, clear.
          </h1>
          <p>
            Everything your cleaning operation needs to stay connected, from the
            office to the people on site.
          </p>
          <div className="hero-actions">
            <WorkspaceLink />
            <Link to="/pricing" className="marketing-button secondary-button">
              Explore plans <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="features-dashboard">
          <OperationsPreview interactive />
        </div>
        <p className="preview-caption">
          Explore the tabs above. Illustrative workspace with sample data.
        </p>
      </section>
      <nav className="feature-jump-nav" aria-label="Explore features">
        <div className="marketing-container">
          <a href="#locations">
            <Building2 size={17} /> Locations
          </a>
          <a href="#attendance">
            <MapPin size={17} /> Attendance
          </a>
          <a href="#scheduling">
            <CalendarDays size={17} /> Scheduling
          </a>
          <a href="#verification">
            <ShieldCheck size={17} /> Verification
          </a>
        </div>
      </nav>
      <section
        id="locations"
        className="marketing-section marketing-container locations-section"
      >
        <div className="section-heading">
          <span className="section-kicker">Your locations, connected</span>
          <h2>
            One site or several.
            <br />
            The same clear picture.
          </h2>
          <p>
            Organize each location with its own staff, shifts, and tasks. Give
            managers access to the sites they look after.
          </p>
        </div>
        <div className="location-cards">
          {[
            [
              "WO",
              "Westfield Office",
              "Commercial office",
              "14 tasks",
              "6 team members",
            ],
            [
              "PH",
              "The Park Hotel",
              "Hospitality",
              "8 tasks",
              "8 team members",
            ],
            [
              "OC",
              "Oakwood Clinic",
              "Healthcare",
              "10 tasks",
              "6 team members",
            ],
          ].map(([initials, name, type, tasks, staff]) => (
            <div className="location-preview" key={name}>
              <div className={`location-art location-${initials}`}>
                <Building2 size={50} strokeWidth={1.2} />
                <span className="mini-status green">Active location</span>
              </div>
              <div className="location-details">
                <span>{type}</span>
                <h3>{name}</h3>
                <div>
                  <span>
                    <Check size={14} />
                    {tasks}
                  </span>
                  <span>
                    <Users size={14} />
                    {staff}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="preview-caption">
          Example locations, shown for illustration.
        </p>
      </section>
      <section id="attendance" className="feature-tint-section">
        <div className="marketing-container feature-split">
          <div className="feature-art map-feature-art">
            <AttendanceVisual />
          </div>
          <div className="feature-copy">
            <span className="section-kicker">Attendance with context</span>
            <h2>
              Know who’s there.
              <br />
              Without the check-in calls.
            </h2>
            <p>
              Staff check in with their location and a selfie. You get a record
              of when they arrived, where they checked in, and whether they’re
              on time.
            </p>
            <ul className="marketing-check-list">
              <li>
                <Check /> Set a check-in boundary for each site
              </li>
              <li>
                <Check /> See late arrivals and missed checkouts
              </li>
              <li>
                <Check /> Keep shift attendance in one place
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section
        id="scheduling"
        className="marketing-section marketing-container feature-split"
      >
        <div className="feature-copy">
          <span className="section-kicker">A plan your team can follow</span>
          <h2>
            Repeat the work.
            <br />
            Not the admin.
          </h2>
          <p>
            Set up daily routines and one-time jobs with clear time windows.
            Assign staff, track task starts, and see what’s still outstanding.
          </p>
          <ul className="marketing-check-list">
            <li>
              <Check /> Daily and one-time task schedules
            </li>
            <li>
              <Check /> QR-based task starting
            </li>
            <li>
              <Check /> Automatic assignment on Pro and Enterprise
            </li>
          </ul>
        </div>
        <div className="feature-art schedule-art">
          <ScheduleVisual />
        </div>
      </section>
      <section
        id="verification"
        className="feature-tint-section lavender-section"
      >
        <div className="marketing-container feature-split">
          <div className="feature-art">
            <ProofVisual />
          </div>
          <div className="feature-copy">
            <span className="section-kicker">
              The proof stays with the task
            </span>
            <h2>
              See the work.
              <br />
              Not just the status.
            </h2>
            <p>
              Set reference photos for the areas that matter. Staff submit their
              photos, and image comparison helps flag submissions that need
              attention.
            </p>
            <ul className="marketing-check-list">
              <li>
                <Check /> Photo evidence for each reference area
              </li>
              <li>
                <Check /> Area-match results and review flags
              </li>
              <li>
                <Check /> Submission and attempt history
              </li>
            </ul>
            <p className="feature-footnote">
              Photo comparison supports your review. It doesn’t replace a
              manager’s judgment.
            </p>
          </div>
        </div>
      </section>
      <section className="marketing-section marketing-container">
        <div className="section-heading centered">
          <span className="section-kicker">
            The everyday essentials, included
          </span>
          <h2>Thought through for real working days.</h2>
        </div>
        <div className="essentials-grid">
          {[
            [
              Clock3,
              "Overnight shifts",
              "Work doesn’t always finish at five. Schedule shifts that continue into the next day.",
            ],
            [
              MapPin,
              "Location timezones",
              "Keep schedules grounded in the local time of each site.",
            ],
            [
              ShieldCheck,
              "Clear responsibilities",
              "Separate administrator, manager, and staff roles keep everyone focused.",
            ],
            [
              Users,
              "Room to grow",
              "Start with a small team and choose larger allowances as your business grows.",
            ],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Users;
            return (
              <article key={String(title)}>
                <FeatureIcon size={24} />
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section id="how-it-works" className="setup-section">
        <div className="marketing-container">
          <div className="section-heading centered">
            <span className="section-kicker">From setup to the next shift</span>
            <h2>Make Hygene Ops your own.</h2>
          </div>
          <SetupSteps />
        </div>
      </section>
      <MarketingCTA />
    </>
  );
}
