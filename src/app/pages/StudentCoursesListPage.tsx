import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { BookOpen, Search, Filter, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_minutes: number;
  thumbnail_url: string;
  teacher_id: string;
  is_published: boolean;
}

interface Teacher {
  id: string;
  name: string;
}

export default function StudentCoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<{ [key: string]: Teacher }>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const navigate = useNavigate();

  const categories = ["programming", "design", "business", "science", "math", "languages"];
  const levels = ["beginner", "intermediate", "advanced"];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Fetch published courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!coursesError && coursesData) {
          setCourses(coursesData);

          // Fetch teacher info for each unique teacher
          const uniqueTeacherIds = [...new Set(coursesData.map((c) => c.teacher_id))];
          const { data: teachersData } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", uniqueTeacherIds);

          if (teachersData) {
            const teachersMap = teachersData.reduce(
              (acc, teacher) => {
                acc[teacher.id] = teacher;
                return acc;
              },
              {} as { [key: string]: Teacher }
            );
            setTeachers(teachersMap);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <DashboardLayout role="student" title="Browse Courses">
      {/* Search Bar */}
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              <Filter className="h-4 w-4 inline mr-2" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              <Filter className="h-4 w-4 inline mr-2" />
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-400">
        {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center text-gray-400">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <GlassCard
              key={course.id}
              className="p-0 overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer group"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              {/* Thumbnail */}
              {course.thumbnail_url ? (
                <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-blue-400/30" />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {course.duration_minutes} min
                  </div>
                  {teachers[course.teacher_id] && (
                    <p className="text-xs text-gray-500">{teachers[course.teacher_id].name}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
