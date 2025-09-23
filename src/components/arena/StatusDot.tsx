import { EventStatus } from '@/src/types/arena';

interface StatusDotProps {
  status: EventStatus;
}

export default function StatusDot({ status }: StatusDotProps) {
  const statusConfig = {
    live: {
      dot: "bg-red-500",
      text: "Live",
      icon: "🔴"
    },
    upcoming: {
      dot: "bg-yellow-500",
      text: "Upcoming",
      icon: "🟡"
    },
    ended: {
      dot: "bg-gray-400",
      text: "Ended",
      icon: "⚫"
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="text-sm text-gray-400">{config.text}</span>
    </div>
  );
}