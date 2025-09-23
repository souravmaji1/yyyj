import { LeaderboardRow } from '@/src/types/arena';
import { formatXUT } from '@/src/lib/arena-utils';
import { Trophy } from 'lucide-react';

interface LeaderboardNewProps {
  rows?: LeaderboardRow[];
}

export default function LeaderboardNew({ rows }: LeaderboardNewProps) {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">No leaderboard data yet.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div 
          key={row.rank}
          className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg"
        >
          {/* Rank */}
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">
            {row.rank}
          </div>

          {/* Avatar (first letter of handle) */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {row.handle.charAt(0).toUpperCase()}
          </div>

          {/* Handle and Points */}
          <div className="flex-1">
            <div className="text-white font-medium">{row.handle}</div>
            <div className="text-sm text-blue-400">{formatXUT(row.pointsXUT)}</div>
          </div>

          {/* Trophies */}
          {row.trophies && row.trophies > 0 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Trophy size={16} />
              <span className="text-sm font-medium">{row.trophies}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}