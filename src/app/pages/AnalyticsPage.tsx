import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { StatCard } from "../components/StatCard";
import { AlertCircle, TrendingDown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface StudentPerformance {
  student_id: string;
  student_name: string;
  student_email: string;
  average_score: number;
  test_count: number;
  weak_count: number;
  average_count: number;
  good_count: number;
  excellent_count: number;
  last_test: string;
}

export default function AnalyticsPage() {
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    weakStudents: 0,
    averageScore: 0,
    totalTests: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch all results with student profile data
        const { data: resultsData } = await supabase
          .from("results")
          .select("student_id, score, performance, created_at, profiles(name, email)");

        if (resultsData && resultsData.length > 0) {
          // Group by student
          const studentMap = new Map<
            string,
            {
              name: string;
              email: string;
              scores: number[];
              performances: string[];
              lastTest: string;
            }
          >();

          resultsData.forEach((result: any) => {
            const key = result.student_id;
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                name: result.profiles?.name || "Unknown",
                email: result.profiles?.email || "Unknown",
                scores: [],
                performances: [],
                lastTest: result.created_at,
              });
            }
            const student = studentMap.get(key)!;
            student.scores.push(result.score);
            student.performances.push(result.performance);
            if (new Date(result.created_at) > new Date(student.lastTest)) {
              student.lastTest = result.created_at;
            }
          });

          // Convert to array and calculate stats
          const studentsList = Array.from(studentMap, ([id, data]) => ({
            student_id: id,
            student_name: data.name,
            student_email: data.email,
            average_score: Math.round(
              data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            ),
            test_count: data.scores.length,
            weak_count: data.performances.filter((p) => p === "weak").length,
            average_count: data.performances.filter((p) => p === "average").length,
            good_count: data.performances.filter((p) => p === "good").length,
            excellent_count: data.performances.filter((p) => p === "excellent").length,
            last_test: data.lastTest,
          }));

          // Sort by average score (weak first)
          studentsList.sort((a, b) => a.average_score - b.average_score);

          setStudents(studentsList);

          // Calculate aggregate stats
          const weakCount = studentsList.filter((s) => s.average_score < 40).length;
          const avgScore = Math.round(
            studentsList.reduce((a, b) => a + b.average_score, 0) / studentsList.length
          );

          setStats({
            totalStudents: studentsList.length,
            weakStudents: weakCount,
            averageScore: avgScore,
            totalTests: resultsData.length,
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getPerformanceColor = (score: number) => {
    if (score >= 86) return "text-green-400 bg-green-500/10";
    if (score >= 71) return "text-blue-400 bg-blue-500/10";
    if (score >= 41) return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 86) return "Excellent";
    if (score >= 71) return "Good";
    if (score >= 41) return "Average";
    return "Weak";
  };

  return (
    <DashboardLayout role="admin" title="Analytics">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={String(stats.totalStudents)}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Students at Risk"
          value={String(stats.weakStudents)}
          icon={AlertCircle}
          color="text-red-500"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={TrendingDown}
          color="text-purple-500"
        />
        <StatCard
          title="Total Tests Taken"
          value={String(stats.totalTests)}
          icon={Users}
          color="text-green-500"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-6">Student Performance Overview</h2>

        {loading ? (
          <div className="text-center text-gray-400">Loading analytics...</div>
        ) : students.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-400">No student data available yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {/* Weak Students Section */}
            {students.filter((s) => s.average_score < 40).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Students Needing Support (Below 40%)
                </h3>
                <div className="grid gap-4">
                  {students
                    .filter((s) => s.average_score < 40)
                    .map((student) => (
                      <GlassCard key={student.student_id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{student.student_name}</h4>
                            <p className="text-sm text-gray-400">{student.student_email}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getPerformanceColor(student.average_score).split(' ')[0]}`}>
                              {student.average_score}%
                            </div>
                            <p className="text-xs text-gray-500">Average Score</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-red-500/10 rounded-lg p-2 text-center">
                            <div className="text-sm font-semibold text-red-400">{student.weak_count}</div>
                            <div className="text-xs text-gray-400">Weak</div>
                          </div>
                          <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                            <div className="text-sm font-semibold text-yellow-400">{student.average_count}</div>
                            <div className="text-xs text-gray-400">Average</div>
                          </div>
                          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                            <div className="text-sm font-semibold text-blue-400">{student.good_count}</div>
                            <div className="text-xs text-gray-400">Good</div>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-2 text-center">
                            <div className="text-sm font-semibold text-green-400">{student.excellent_count}</div>
                            <div className="text-xs text-gray-400">Excellent</div>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Tests Taken: {student.test_count}</span>
                          <span>Last Test: {new Date(student.last_test).toLocaleDateString()}</span>
                        </div>
                      </GlassCard>
                    ))}
                </div>
              </div>
            )}

            {/* All Students Table */}
            <GlassCard className="p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">All Students</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10">
                    <tr className="text-xs uppercase text-gray-400">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Avg Score</th>
                      <th className="px-4 py-3">Performance</th>
                      <th className="px-4 py-3">Tests</th>
                      <th className="px-4 py-3">Weak</th>
                      <th className="px-4 py-3">Average</th>
                      <th className="px-4 py-3">Good</th>
                      <th className="px-4 py-3">Excellent</th>
                      <th className="px-4 py-3">Last Test</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((student) => (
                      <tr
                        key={student.student_id}
                        className={`hover:bg-white/5 transition-colors ${
                          student.average_score < 40 ? "bg-red-500/5" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-white font-medium">{student.student_name}</div>
                            <div className="text-xs text-gray-500">{student.student_email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-semibold ${getPerformanceColor(student.average_score).split(' ')[0]}`}>
                            {student.average_score}%
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(student.average_score)}`}>
                            {getPerformanceLabel(student.average_score)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white">{student.test_count}</td>
                        <td className="px-4 py-3 text-red-400">{student.weak_count}</td>
                        <td className="px-4 py-3 text-yellow-400">{student.average_count}</td>
                        <td className="px-4 py-3 text-blue-400">{student.good_count}</td>
                        <td className="px-4 py-3 text-green-400">{student.excellent_count}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(student.last_test).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
