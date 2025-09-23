import { ArenaEvent } from '@/src/types/arena';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import StatusDot from './StatusDot';
import { formatXUT } from '@/src/lib/arena-utils';
import { useAuthState } from '@/src/hooks/useAuthState';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: ArenaEvent;
  onOpen: (id: string) => void;
}

export default function EventCard({ event, onOpen }: EventCardProps) {
  const { token } = useAuthState();
  const router = useRouter();
  
  const typeColors = {
    prediction: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    game: "bg-green-500/20 text-green-400 border-green-500/30",
    tournament: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  };

  const handleClick = () => {
    onOpen(event.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(event.id);
    }
  };

  const handlePlayGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.externalGameUrl) {
      router.push(`/play/${event.id}`);
    }
  };

  return (
    <Card 
      className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer group"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${event.title}`}
    >
      <div className="p-6">
        {/* Header with status and type */}
        <div className="flex items-center justify-between mb-4">
          <StatusDot status={event.status} />
          <div className="flex items-center gap-2">
            {event.externalGameUrl && (
              <Badge 
                variant="outline" 
                className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
              >
                External
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={typeColors[event.type]}
            >
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        {/* Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Entry Fee</span>
            <span className="text-white font-medium">{event.entryFeeXUT} XUT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Rewards</span>
            <span className="text-green-400 font-medium">{formatXUT(event.rewardsXUT)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Ends</span>
            <span className="text-white">{event.endsIn}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Players</span>
            <span className="text-white">{event.players}</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={event.externalGameUrl ? handlePlayGame : (e) => {
            e.stopPropagation();
            onOpen(event.id);
          }}
        >
          {event.ctaLabel}
        </Button>
      </div>
    </Card>
  );
}