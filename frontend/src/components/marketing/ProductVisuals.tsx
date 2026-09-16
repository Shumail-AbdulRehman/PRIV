import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleCheck,
  Clock3,
  LayoutDashboard,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <CheckCheck size={22} strokeWidth={2.7} />
    </span>
  );
}

const sites = [
  {
    name: "Westfield Office",
    type: "Commercial office",
    initials: "WO",
    count: "12 / 14",
    progress: 86,
    status: "In progress",
  },
  {
    name: "The Park Hotel",
    type: "Hospitality",
    initials: "PH",
    count: "8 / 8",
    progress: 100,
    status: "Complete",
  },
  {
    name: "Oakwood Clinic",
    type: "Healthcare",
    initials: "OC",
    count: "6 / 10",
    progress: 60,
    status: "In progress",
  },
];

export function OperationsPreview({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [tab, setTab] = useState("Overview");
  return (
    <div
      className="operations-preview"
      aria-label="CleanOps dashboard preview with illustrative data"
    >
      <aside className="preview-sidebar" aria-hidden="true">
        <div className="preview-brand">
          <BrandMark /> <b>CleanOps</b>
        </div>
        <div className="preview-workspace">
          <span>SC</span>
          <div>
            Sparkle Cleaning<small>Your workspace</small>
          </div>
          <ChevronDown size={12} />
        </div>
        <p>WORKSPACE</p>
        {[
          [LayoutDashboard, "Overview"],
          [Building2, "Locations"],
          [Users, "Team"],
          [CalendarDays, "Attendance"],
          [CheckCheck, "Tasks"],
        ].map(([Icon, label]) => {
          const ItemIcon = Icon as typeof LayoutDashboard;
          return (
            <div
              key={String(label)}
              className={`preview-nav-item ${label === "Overview" ? "selected" : ""}`}
            >
              <ItemIcon size={15} />
              {String(label)}
            </div>
          );
        })}
        <div className="preview-sidebar-bottom">
          <Settings2 size={15} /> Settings
        </div>
      </aside>
      <div className="preview-main">
        <div className="preview-topbar">
          <span>
            Workspace <span>/ Overview</span>
          </span>
          <div>
            <Search size={14} />
            <Bell size={14} />
            <span className="avatar">JD</span>
          </div>
        </div>
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <h3>A good day starts here.</h3>
              <p>Here’s how your team is getting on.</p>
            </div>
            <span className="preview-date">
              <CalendarDays size={12} /> Today <ChevronDown size={10} />
            </span>
          </div>
          <div className="preview-metrics">
            <div>
              <span>
                <Building2 size={14} /> Active locations
              </span>
              <b>
                3 <small>All covered</small>
              </b>
            </div>
            <div>
              <span>
                <Users size={14} /> Staff checked in
              </span>
              <b>
                18<em>/ 20</em>
              </b>
            </div>
            <div>
              <span>
                <CircleCheck size={14} /> Tasks complete
              </span>
              <b>
                26<em>/ 32</em>
              </b>
            </div>
          </div>
          <div
            className="preview-tabs"
            role={interactive ? "group" : undefined}
            aria-label={interactive ? "Preview view" : undefined}
          >
            {["Overview", "Attendance", "Tasks"].map((item) =>
              interactive ? (
                <button
                  type="button"
                  key={item}
                  aria-pressed={tab === item}
                  className={tab === item ? "active" : ""}
                  onClick={() => setTab(item)}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className={tab === item ? "active" : ""}>
                  {item}
                </span>
              ),
            )}
            <span className="preview-demo">Sample workspace</span>
          </div>
          {tab === "Overview" ? (
            <div className="preview-site-table">
              <div className="preview-table-head">
                <span>Location</span>
                <span>Tasks</span>
                <span>Status</span>
              </div>
              {sites.map((site) => (
                <div className="preview-site-row" key={site.name}>
                  <div>
                    <span className={`site-initials site-${site.initials}`}>
                      {site.initials}
                    </span>
                    <span>
                      <b>{site.name}</b>
                      <small>{site.type}</small>
                    </span>
                  </div>
                  <div>
                    <span>{site.count}</span>
                    <i>
                      <span style={{ width: `${site.progress}%` }} />
                    </i>
                  </div>
                  <span
                    className={`mini-status ${site.progress === 100 ? "green" : "blue"}`}
                  >
                    {site.status}
                  </span>
                </div>
              ))}
            </div>
          ) : tab === "Attendance" ? (
            <div className="preview-site-table">
              <div className="preview-table-head">
                <span>Team member</span>
                <span>Check-in</span>
                <span>Status</span>
              </div>
              {["Sarah Miller", "James Wilson", "Alex Taylor"].map(
                (name, i) => (
                  <div className="preview-site-row" key={name}>
                    <div>
                      <span className="site-initials">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <b>{name}</b>
                    </div>
                    <span>{i ? "08:56" : "08:52"} am</span>
                    <span className="mini-status green">Checked in</span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="preview-site-table">
              <div className="preview-table-head">
                <span>Today’s task</span>
                <span>Due</span>
                <span>Status</span>
              </div>
              {[
                "Reception & lobby",
                "Meeting rooms",
                "First-floor washrooms",
              ].map((name, i) => (
                <div className="preview-site-row" key={name}>
                  <div>
                    <CircleCheck size={17} />
                    <b>{name}</b>
                  </div>
                  <span>{10 + i}:00 am</span>
                  <span className={`mini-status ${i ? "blue" : "green"}`}>
                    {i ? "In progress" : "Complete"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="preview-activity">
            <span className="activity-dot" />
            <span>
              <b>Sarah</b> completed Reception & lobby
            </span>
            <small>2 min ago</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhonePreview() {
  return (
    <div
      className="phone-preview"
      aria-label="Staff mobile app preview with sample data"
    >
      <div className="phone-status">
        <b>9:41</b>
        <span>••• ▰</span>
      </div>
      <div className="phone-camera" />
      <div className="phone-body">
        <div className="phone-greeting">
          <span>Good morning, Sarah</span>
          <span className="avatar">SM</span>
        </div>
        <h3>
          Let’s make it
          <br />a good shift.
        </h3>
        <div className="phone-location">
          <span className="mini-status green">
            <span className="activity-dot" /> Checked in
          </span>
          <h4>Westfield Office</h4>
          <p>
            <MapPin size={12} /> 24 Westfield Road
          </p>
          <div>
            <Clock3 size={13} /> 9:00 am – 5:00 pm
          </div>
        </div>
        <div className="phone-task-title">
          <b>Your tasks</b>
          <span>2 of 4 done</span>
        </div>
        {["Reception & lobby", "Meeting rooms", "First-floor washrooms"].map(
          (task, i) => (
            <div className={`phone-task ${i < 2 ? "done" : ""}`} key={task}>
              <span>{i < 2 ? <Check size={13} /> : <Clock3 size={13} />}</span>
              <div>
                <b>{task}</b>
                <small>
                  {i < 2
                    ? "Completed · Photo submitted"
                    : "Next up · Due at 12:00 pm"}
                </small>
              </div>
            </div>
          ),
        )}
        <div className="phone-next">
          <span>
            <Smartphone size={16} /> Scan QR to start a task
          </span>
          <ArrowUpRight size={16} />
        </div>
      </div>
      <div className="phone-home" />
    </div>
  );
}

export function AttendanceVisual() {
  return (
    <div className="attendance-visual">
      <div className="map-art" aria-hidden="true">
        <div className="map-park park-one" />
        <div className="map-park park-two" />
        <div className="map-road road-one" />
        <div className="map-road road-two" />
        <div className="map-road road-three" />
        <div className="map-building building-one" />
        <div className="map-building building-two" />
        <div className="map-building building-three" />
        <div className="map-radius">
          <div className="map-pin">
            <Building2 size={24} />
          </div>
        </div>
        <span className="map-label">Westfield Office</span>
      </div>
      <div className="checkin-note">
        <span className="note-icon">
          <ShieldCheck size={22} />
        </span>
        <div>
          <b>Right place. Ready to go.</b>
          <p>Sarah checked in within the site boundary.</p>
        </div>
        <Check size={18} />
      </div>
    </div>
  );
}

export function ScheduleVisual() {
  return (
    <div className="schedule-visual">
      <div className="schedule-title">
        <div>
          <span className="icon-tile blue-tile">
            <CalendarDays size={20} />
          </span>
          <h3>The week, sorted.</h3>
        </div>
        <MoreHorizontal size={19} />
      </div>
      <div className="week-days">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
          <span className={i === 1 ? "selected" : ""} key={day}>
            {day}
            <b>{12 + i}</b>
          </span>
        ))}
      </div>
      <div className="schedule-label">
        Tuesday’s schedule <span>3 tasks</span>
      </div>
      {[
        ["09:00", "Reception & lobby", "Sarah Miller", "blue"],
        ["10:30", "Meeting rooms", "James Wilson", "purple"],
        ["12:00", "First-floor washrooms", "Alex Taylor", "peach"],
      ].map(([time, title, name, color]) => (
        <div className="schedule-row" key={title}>
          <time>{time}</time>
          <div className={`schedule-task ${color}`}>
            <b>{title}</b>
            <span>
              <span className="tiny-avatar">{name[0]}</span>
              {name}
              <small>Repeats daily</small>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProofVisual() {
  return (
    <div className="proof-visual">
      <div className="proof-header">
        <span className="icon-tile blue-tile">
          <CheckCheck size={20} />
        </span>
        <div>
          <h3>Reception & lobby</h3>
          <p>Westfield Office · Today, 10:24 am</p>
        </div>
      </div>
      <div className="proof-area">
        <div className="room-illustration" aria-hidden="true">
          <span className="room-window" />
          <span className="room-plant" />
          <span className="room-desk" />
          <span className="room-chair" />
        </div>
        <span className="proof-tag">
          <CircleCheck size={14} /> Photo submitted
        </span>
        <span className="illustration-caption">Illustrative preview</span>
      </div>
      <div className="proof-checks">
        <span>
          <Check size={15} /> Reference area matched
        </span>
        <span>
          <Check size={15} /> Submission recorded
        </span>
      </div>
      <div className="proof-bottom">
        <span className="avatar">SM</span>
        <span>
          <b>Sarah Miller</b>
          <small>Task completed</small>
        </span>
        <span className="mini-status green">Complete</span>
      </div>
    </div>
  );
}

export function SetupSteps() {
  return (
    <div className="setup-steps">
      {[
        [
          Building2,
          "Add your locations",
          "Set up each site, its boundaries, and the people responsible.",
        ],
        [
          Users,
          "Bring your team together",
          "Create staff accounts and assign their locations and shifts.",
        ],
        [
          CheckCheck,
          "Make every shift count",
          "Schedule tasks, collect photo proof, and follow the day’s progress.",
        ],
      ].map(([Icon, title, text], i) => {
        const StepIcon = Icon as typeof Plus;
        return (
          <div className="setup-step" key={String(title)}>
            <span className="step-number">0{i + 1}</span>
            <StepIcon size={23} />
            <h3>{String(title)}</h3>
            <p>{String(text)}</p>
          </div>
        );
      })}
    </div>
  );
}
