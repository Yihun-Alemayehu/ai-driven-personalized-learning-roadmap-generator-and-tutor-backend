import { useSystemStatsQuery, useDomainStatsQuery } from "@/api/admin";
import { StatCard } from "./components/StatCard";

function Skeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-[12px]"
            style={{ background: "#ebe6db" }}
          />
        ))}
      </div>
      <div className="h-48 rounded-[12px]" style={{ background: "#ebe6db" }} />
    </div>
  );
}

export default function SystemStatsPage() {
  const { data: stats, isLoading: statsLoading } = useSystemStatsQuery();
  const { data: domainStats, isLoading: dsLoading } = useDomainStatsQuery();

  const isLoading = statsLoading || dsLoading;

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="text-[28px] leading-tight"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1a1614" }}
      >
        System Overview
      </h1>

      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon="👥" value={stats?.users ?? 0} label="Users" />
            <StatCard
              icon="📚"
              value={stats?.enrollments ?? 0}
              label="Enrollments"
            />
            <StatCard
              icon="📝"
              value={stats?.quizAttempts ?? 0}
              label="Quiz Attempts"
            />
            <StatCard
              icon="📊"
              value={(stats?.avgQuizScore ?? 0).toFixed(1)}
              label="Avg Quiz Score"
            />
          </div>

          <div
            className="border rounded-[12px] px-5 py-4"
            style={{ borderColor: "#d6cfbf", background: "#f3efe7" }}
          >
            <div
              className="text-[11px] tracking-[0.1em] uppercase mb-2"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "#9a9088",
              }}
            >
              Mastery Breakdown
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-[13px]" style={{ color: "#6e645a" }}>
                In Progress:{" "}
                <span className="font-mono">
                  {stats?.masteryBreakdown.in_progress ?? 0}
                </span>
              </div>
              <div className="text-[13px]" style={{ color: "#6e645a" }}>
                Review Needed:{" "}
                <span className="font-mono">
                  {stats?.masteryBreakdown.review_needed ?? 0}
                </span>
              </div>
              <div className="text-[13px]" style={{ color: "#6e645a" }}>
                Mastered:{" "}
                <span className="font-mono">
                  {stats?.masteryBreakdown.mastered ?? 0}
                </span>
              </div>
              <div className="text-[13px]" style={{ color: "#6e645a" }}>
                Not Started:{" "}
                <span className="font-mono">
                  {stats?.masteryBreakdown.not_started ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Domain stats table */}
          <div
            className="border rounded-[12px] overflow-hidden"
            style={{ borderColor: "#d6cfbf" }}
          >
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: "#d6cfbf", background: "#f3efe7" }}
            >
              <span
                className="text-[11px] tracking-[0.1em] uppercase"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#9a9088",
                }}
              >
                Domain Stats
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  style={{
                    background: "#f3efe7",
                    borderBottom: "1px solid #d6cfbf",
                  }}
                >
                  {["Domain", "Enrollments", "Avg Completion", "Avg Score"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left font-medium"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#9a9088",
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(domainStats ?? []).map((d, i) => (
                  <tr
                    key={d.id}
                    style={{
                      background: i % 2 === 0 ? "#faf7f1" : "#f7f3ec",
                      borderBottom: "1px solid #ebe6db",
                    }}
                  >
                    <td
                      className="px-4 py-2.5"
                      style={{
                        fontFamily: "'Crimson Pro', serif",
                        color: "#1a1614",
                      }}
                    >
                      {d.name}
                    </td>
                    <td
                      className="px-4 py-2.5 font-mono text-[12px]"
                      style={{ color: "#6e645a" }}
                    >
                      {d.enrollmentCount}
                    </td>
                    <td
                      className="px-4 py-2.5 font-mono text-[12px]"
                      style={{ color: "#6e645a" }}
                    >
                      {d.avgCompletion.toFixed(0)}%
                    </td>
                    <td
                      className="px-4 py-2.5 font-mono text-[12px]"
                      style={{ color: "#6e645a" }}
                    >
                      {d.avgQuizScore !== null
                        ? `${d.avgQuizScore.toFixed(0)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
                {(!domainStats || domainStats.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-6 text-center text-[13px] italic"
                      style={{
                        fontFamily: "'Crimson Pro', serif",
                        color: "#9a9088",
                      }}
                    >
                      No domain data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
