import { useState } from "react";
import { useCreditStatus } from "@/api/subscription";
import { Link } from "react-router-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  BellIcon,
  UsersIcon,
  BarChart2Icon,
  FlagIcon,
  ShieldIcon,
  GlobeIcon,
  SettingsIcon,
  UserIcon,
  BookMarkedIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SparklesIcon,
  TrophyIcon,
  FlameIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMyLearningStore } from "@/store/myLearning.store";
import { useGamificationQuery } from "@/api/gamification";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const COLLAPSED_KEY = "nav-sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function NavItemLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center transition-colors rounded-lg",
          collapsed ? "justify-center p-2.5 mx-1" : "gap-2.5 px-3 py-2",
          !isActive && "hover:bg-[#ebe6db]",
        )
      }
      style={({ isActive }) => ({
        fontFamily: "'Crimson Pro', serif",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        background: isActive
          ? "color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)"
          : undefined,
        color: isActive ? "oklch(0.52 0.18 28)" : "#3a342e",
      })}
    >
      {({ isActive }) => (
        <>
          <span
            className="shrink-0"
            style={{ color: isActive ? "oklch(0.52 0.18 28)" : "#9a9088" }}
          >
            {item.icon}
          </span>
          {!collapsed && item.label}
        </>
      )}
    </NavLink>
  );
}

function SidebarGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {!collapsed && (
        <div
          className="text-[9px] tracking-[0.16em] uppercase px-3 mb-0.5 mt-0.5"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#b0a898" }}
        >
          {label}
        </div>
      )}
      {collapsed && (
        <div
          className="mx-2 my-1 border-t"
          style={{ borderColor: "#e8e2d9" }}
        />
      )}
      {items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} />
      ))}
    </div>
  );
}

function MyLearningSection({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, remove } = useMyLearningStore();

  const activeEnrollmentId = location.pathname.match(
    /\/enrollments\/([^/]+)\//,
  )?.[1];

  const uniqueEntries = entries.filter(
    (entry, idx, arr) =>
      arr.findIndex((e) => e.domainSlug === entry.domainSlug) === idx,
  );

  if (uniqueEntries.length === 0) return null;

  if (collapsed) {
    return (
      <>
        <div
          className="mx-2 my-1 border-t"
          style={{ borderColor: "#e8e2d9" }}
        />
        {uniqueEntries.map((entry) => {
          const isActive = entry.enrollmentId === activeEnrollmentId;
          return (
            <button
              key={entry.enrollmentId}
              title={entry.domainName}
              onClick={() =>
                navigate(
                  `/enrollments/${entry.enrollmentId}/learn/${entry.lastNodeId}`,
                )
              }
              className="flex justify-center items-center p-2.5 mx-1 rounded-lg transition-colors"
              style={{
                background: isActive
                  ? "color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)"
                  : undefined,
                color: isActive ? "oklch(0.52 0.18 28)" : "#9a9088",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "#ebe6db";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <BookMarkedIcon size={15} />
            </button>
          );
        })}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="text-[9px] tracking-[0.16em] uppercase px-3 mb-0.5 mt-0.5"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#b0a898" }}
      >
        My Learning
      </div>
      {uniqueEntries.map((entry) => {
        const isActive = entry.enrollmentId === activeEnrollmentId;
        return (
          <div
            key={entry.enrollmentId}
            className="group flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            style={{
              background: isActive
                ? "color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)"
                : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "#ebe6db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isActive
                ? "color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)"
                : "transparent";
            }}
            onClick={() =>
              navigate(
                `/enrollments/${entry.enrollmentId}/learn/${entry.lastNodeId}`,
              )
            }
          >
            <BookMarkedIcon
              size={14}
              className="shrink-0"
              style={{ color: isActive ? "oklch(0.52 0.18 28)" : "#9a9088" }}
            />
            <span
              className="flex-1 min-w-0 truncate"
              style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 13.5,
                color: isActive ? "oklch(0.52 0.18 28)" : "#3a342e",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {entry.domainName}
            </span>
            <button
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded text-[12px] leading-none"
              style={{ color: "#b0a898" }}
              onClick={(e) => {
                e.stopPropagation();
                remove(entry.enrollmentId);
              }}
              title="Remove"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Mini XP + Streak widget ───────────────────────────────────────────────────

function XpStreakWidget({ collapsed }: { collapsed: boolean }) {
  const { data } = useGamificationQuery();

  if (!data) return null;

  const { xp, streak } = data;
  const streakColor =
    streak.current >= 14
      ? "oklch(0.52 0.22 30)"
      : streak.current >= 5
        ? "oklch(0.62 0.18 28)"
        : "#9a9088";

  if (collapsed) {
    // Just a flame icon with count tooltip
    return (
      <div className="flex justify-center pb-1">
        <div
          className="flex flex-col items-center gap-0.5"
          title={`Level ${xp.level} · ${xp.total} XP · ${streak.current}-day streak`}
        >
          <span
            className="w-7 h-7 rounded-[8px] flex items-center justify-center"
            style={{ background: "#ebe6db", color: "oklch(0.62 0.18 28)" }}
          >
            <TrophyIcon size={13} />
          </span>
          <span
            className="text-[8px]"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "#b0a898",
            }}
          >
            L{xp.level}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-3 rounded-[12px] border overflow-hidden"
      style={{ borderColor: "#d6cfbf", background: "#f3efe7" }}
    >
      {/* Level + XP row */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="w-5 h-5 rounded-[5px] flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "oklch(0.62 0.18 28)",
              color: "#fff",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {xp.level}
          </span>
          <span
            className="text-[11px]"
            style={{ fontFamily: "'Crimson Pro', serif", color: "#3a342e" }}
          >
            Level {xp.level}
          </span>
        </div>
        {/* Streak chip */}
        <div className="flex items-center gap-1">
          <FlameIcon size={10} style={{ color: streakColor }} />
          <span
            className="text-[9px] font-medium"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: streakColor,
            }}
          >
            {streak.current}d
          </span>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="px-3 pb-2.5">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "#e8e2d9" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${xp.progressPct}%`,
              background: "oklch(0.62 0.18 28)",
            }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span
            className="text-[8px]"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "#b0a898",
            }}
          >
            {xp.total} XP
          </span>
          <span
            className="text-[8px]"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "#b0a898",
            }}
          >
            {xp.progressPct}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Credit widget ─────────────────────────────────────────────────────────────

function CreditWidget({ collapsed }: { collapsed: boolean }) {
  const { data } = useCreditStatus();
  if (!data || data.unlimited) return null;

  const pct = Math.round(((data.creditsRemaining ?? 0) / 30) * 100);
  const low = (data.creditsRemaining ?? 0) <= 8;

  if (collapsed) {
    return (
      <div className="flex justify-center pb-1" title={`${data.creditsRemaining} credits left`}>
        <div
          className="w-6 h-6 rounded-full border grid place-items-center text-[9px]"
          style={{
            borderColor: low ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
            color: low ? 'oklch(0.62 0.18 28)' : '#9a9088',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {data.creditsRemaining}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mb-1 rounded-[10px] border px-3 py-2.5" style={{ borderColor: low ? 'color-mix(in srgb, oklch(0.62 0.18 28) 40%, transparent)' : '#d6cfbf', background: low ? 'color-mix(in srgb, oklch(0.62 0.18 28) 5%, #faf7f1)' : '#f3efe7' }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          AI Credits
        </span>
        <span className="text-[11px] font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace', color: low ? 'oklch(0.62 0.18 28)' : '#3a342e' }}>
          {data.creditsRemaining} / 30
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#d6cfbf' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: low ? 'oklch(0.62 0.18 28)' : 'oklch(0.60 0.13 150)' }}
        />
      </div>
      {low && (
        <Link
          to="/go-pro"
          className="block text-center text-[10.5px] mt-1.5 hover:underline"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.52 0.18 28)' }}
        >
          Upgrade to Pro →
        </Link>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { isAdmin, isInstructor } = useAuth();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  }

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden"
      style={{
        background: "#faf7f1",
        borderRight: "1px solid #d6cfbf",
        width: collapsed ? 52 : 220,
        transition: "width 0.2s ease",
      }}
    >
      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-4 min-h-0">
        {/* Mini XP + streak widget — sits above nav groups */}
        <XpStreakWidget collapsed={collapsed} />

        <SidebarGroup
          label="Learn"
          collapsed={collapsed}
          items={[
            {
              to: "/dashboard",
              label: "Dashboard",
              icon: <LayoutDashboardIcon size={15} />,
            },
            {
              to: "/catalog",
              label: "Catalog",
              icon: <BookOpenIcon size={15} />,
            },
            {
              to: "/insights",
              label: "Insights",
              icon: <SparklesIcon size={15} />,
            },
            {
              to: "/achievements",
              label: "Achievements",
              icon: <TrophyIcon size={15} />,
            },
            {
              to: "/notifications",
              label: "Notifications",
              icon: <BellIcon size={15} />,
            },
          ]}
        />

        <MyLearningSection collapsed={collapsed} />

        {isInstructor && !isAdmin && (
          <SidebarGroup
            label="Domain Expert"
            collapsed={collapsed}
            items={[
              {
                to: "/instructor/learners",
                label: "Learners",
                icon: <UsersIcon size={15} />,
              },
              {
                to: "/instructor/flagged",
                label: "Flagged",
                icon: <FlagIcon size={15} />,
              },
              {
                to: "/instructor/domains",
                label: "Domains",
                icon: <GlobeIcon size={15} />,
              },
            ]}
          />
        )}

        {isAdmin && (
          <SidebarGroup
            label="Admin"
            collapsed={collapsed}
            items={[
              {
                to: "/admin/users",
                label: "Users",
                icon: <ShieldIcon size={15} />,
              },
              {
                to: "/admin/domains",
                label: "Domains",
                icon: <GlobeIcon size={15} />,
              },
              {
                to: "/admin/stats",
                label: "Statistics",
                icon: <BarChart2Icon size={15} />,
              },
            ]}
          />
        )}

        <div className="flex-1" />

        <CreditWidget collapsed={collapsed} />

        <SidebarGroup
          label="Account"
          collapsed={collapsed}
          items={[
            { to: "/profile", label: "Profile", icon: <UserIcon size={15} /> },
            {
              to: "/settings",
              label: "Settings",
              icon: <SettingsIcon size={15} />,
            },
          ]}
        />
      </div>

      {/* Collapse toggle — pinned at bottom */}
      <button
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "shrink-0 flex items-center border-t transition-colors",
          collapsed ? "justify-center p-3" : "gap-2 px-4 py-3",
          "hover:bg-[#ebe6db]",
        )}
        style={{ borderColor: "#e8e2d9", color: "#9a9088" }}
      >
        {collapsed ? (
          <PanelLeftOpenIcon size={15} />
        ) : (
          <>
            <PanelLeftCloseIcon size={15} />
            <span
              className="text-[12px]"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "#b0a898",
              }}
            >
              Collapse
            </span>
          </>
        )}
      </button>
    </aside>
  );
}
