import { MapPin, Users, ClipboardList, TrendingUp, ArrowRight, BellRing, ShieldCheck, Camera, CalendarClock } from "lucide-react";
import { useGetDashboardLocations } from "./queries";
import PageHeader from "@/components/common/PageHeader";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import StatCard from "@/components/common/StatCard";
import SurfaceCard from "@/components/common/SurfaceCard";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#0d9488", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();
  const { data, isLoading } = useGetDashboardLocations();

  if (isLoading) return <LoadingSpinner fullScreen />;

  const locations = data?.data ?? [];

  const totalLocations = locations.length;
  const totalStaff = locations.reduce(
    (sum: number, l: any) => sum + (l._count?.staff ?? 0), 0
  );
  const totalTemplates = locations.reduce(
    (sum: number, l: any) => sum + (l._count?.taskTemplates ?? 0), 0
  );
  const averageTemplates =
    totalLocations > 0 ? (totalTemplates / totalLocations).toFixed(1) : "0";
  const busiestLocations = [...locations]
    .sort((a: any, b: any) => (b._count?.staff ?? 0) - (a._count?.staff ?? 0))
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const barData = locations.map((l: any) => ({
    name: l.name.length > 15 ? l.name.slice(0, 15) + "…" : l.name,
    staff: l._count?.staff ?? 0,
    templates: l._count?.taskTemplates ?? 0,
  }));

  const pieData = locations
    .filter((l: any) => (l._count?.staff ?? 0) > 0)
    .map((l: any) => ({
      name: l.name,
      value: l._count?.staff ?? 0,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(" ")[0] ?? "Manager"}`}
        subtitle={`You are managing ${totalLocations} active location${totalLocations === 1 ? "" : "s"} with ${totalStaff} team members across your operation.`}
        action={
          <Button onClick={() => navigate("/locations")} className="rounded-2xl px-4">
            Review locations
            <ArrowRight className="size-4" />
          </Button>
        }
      />

      <SurfaceCard className="border-none bg-[linear-gradient(135deg,rgba(15,118,110,0.97),rgba(14,165,233,0.88))] text-white shadow-[0_35px_90px_-45px_rgba(13,148,136,0.75)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/80">
              Operations snapshot
            </div>
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
                Keep daily cleaning operations visible without turning the dashboard into noise.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/80">
                The backend is centered on locations, staff assignment, recurring task templates, task instances, and attendance. This dashboard now reflects that structure directly.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-2">
                  <BellRing className="size-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white">Manager focus</p>
                <p className="mt-1 text-sm text-white/75">Check Today Status for attendance gaps and unfinished work.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-2">
                  <ShieldCheck className="size-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white">Site coverage</p>
                <p className="mt-1 text-sm text-white/75">Location-level staffing and templates stay visible from one place.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-2">
                  <Camera className="size-4 text-white" />
                </div>
                <p className="text-sm font-medium text-white">Photo-ready future</p>
                <p className="mt-1 text-sm text-white/75">The current layout leaves room for task proof images and review states.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Today</p>
              <p className="mt-2 text-2xl font-semibold">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm text-white/70">Template density</p>
              <p className="mt-2 text-2xl font-semibold">{averageTemplates}</p>
              <p className="mt-1 text-sm text-white/75">Average templates per location</p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Locations" value={totalLocations} icon={MapPin} />
        <StatCard label="Active Staff" value={totalStaff} icon={Users} tone="sky" />
        <StatCard label="Task Templates" value={totalTemplates} icon={ClipboardList} tone="emerald" />
        <StatCard label="Avg. Templates / Location" value={averageTemplates} icon={TrendingUp} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SurfaceCard title="Staff and templates by location" description="High-level operational load across active sites.">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbe3ea" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", fontSize: 13 }}
                />
                <Bar dataKey="staff" fill="#0f766e" radius={[8, 8, 0, 0]} name="Staff" />
                <Bar dataKey="templates" fill="#0284c7" radius={[8, 8, 0, 0]} name="Templates" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No location data yet</div>
          )}
        </SurfaceCard>

        <div className="grid gap-6">
          <SurfaceCard title="Review lanes" description="Three places managers will usually jump next.">
            <div className="grid gap-3">
              <button
                onClick={() => navigate("/today-status")}
                className="flex items-start justify-between rounded-3xl border border-border/70 bg-muted/40 p-4 text-left transition hover:bg-muted/70"
              >
                <div>
                  <p className="font-medium text-foreground">Today Status</p>
                  <p className="mt-1 text-sm text-muted-foreground">Triage absences, pending tasks, and exceptions.</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/staff")}
                className="flex items-start justify-between rounded-3xl border border-border/70 bg-muted/40 p-4 text-left transition hover:bg-muted/70"
              >
                <div>
                  <p className="font-medium text-foreground">Staff Review</p>
                  <p className="mt-1 text-sm text-muted-foreground">Inspect attendance and task history by person.</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/locations")}
                className="flex items-start justify-between rounded-3xl border border-border/70 bg-muted/40 p-4 text-left transition hover:bg-muted/70"
              >
                <div>
                  <p className="font-medium text-foreground">Site Operations</p>
                  <p className="mt-1 text-sm text-muted-foreground">Open a location to inspect templates and task instances.</p>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground" />
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard title="Highest load locations" description="Sites with the most assigned staff right now.">
            {busiestLocations.length > 0 ? (
              <div className="space-y-3">
                {busiestLocations.map((location: any, index: number) => (
                  <button
                    key={location.id}
                    onClick={() => navigate(`/locations/${location.id}`)}
                    className="flex w-full items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-left transition hover:bg-muted/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{location._count?.staff ?? 0}</p>
                      <p className="text-xs text-muted-foreground">staff</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No active sites yet.</div>
            )}
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard
        title="Location quick view"
        description="Fast access to the sites behind your current counts."
        contentClassName="p-0"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Your Locations
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/locations")}>
            View all
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border/70 bg-muted/40">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Templates</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {locations.map((loc: any) => (
                <tr
                  key={loc.id}
                  onClick={() => navigate(`/locations/${loc.id}`)}
                  className="cursor-pointer transition-colors hover:bg-muted/35"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{loc.name}</span>
                        <p className="text-xs text-muted-foreground">Location ID #{loc.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{loc.address}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{loc._count?.staff ?? 0}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{loc._count?.taskTemplates ?? 0}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={loc.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard title="Evidence-ready direction" description="Design groundwork for future task photos and proof of completion.">
          <div className="space-y-3">
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Camera className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Task evidence slot</p>
                  <p className="text-sm text-muted-foreground">Each completed task can later include one or more proof images for manager review.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Review timeline</p>
                  <p className="text-sm text-muted-foreground">Attendance, task timestamps, and photo evidence should be reviewed together, not as separate admin tables.</p>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Staff distribution" description="How people are currently spread across locations.">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_: any, idx: number) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No staff assigned yet</div>
          )}
        </SurfaceCard>
      </div>

    </div>
  );
}
