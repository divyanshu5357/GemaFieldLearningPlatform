import { GlassCard } from "./GlassCard";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id?: string;
  title: string;
  instructor?: string;
  progress: number;
  image: string;
  totalLessons: number;
  completedLessons: number;
  onClick?: () => void;
}

export function CourseCard({ id, title, instructor, progress, image, totalLessons, completedLessons, onClick }: CourseCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      navigate(`/courses/${id}`);
    }
  };

  return (
    <GlassCard className="flex flex-col overflow-hidden group hover:border-blue-500/30 transition-all duration-300 cursor-pointer" onClick={handleClick}>
      <div className="relative h-40 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
          {completedLessons}/{totalLessons} Lessons
        </div>
        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <PlayCircle className="h-8 w-8 text-white" fill="currentColor" />
          </div>
        </button>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 text-lg font-semibold text-white line-clamp-1">{title}</h3>
        <p className="mb-4 text-sm text-gray-400">{instructor}</p>
        
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-400">
            <span>Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full rounded-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
