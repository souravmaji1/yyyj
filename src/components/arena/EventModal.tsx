import { ArenaEvent } from '@/src/types/arena';
import Modal from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { X } from 'lucide-react';
import StatusDot from './StatusDot';
import ProductList from './ProductList';
import LeaderboardNew from './LeaderboardNew';
import { formatXUT } from '@/src/lib/arena-utils';
import { useAuthState } from '@/src/hooks/useAuthState';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/store/hooks';
import { Card } from '@/src/components/ui/card';

interface EventModalProps {
  event?: ArenaEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null;

  const { token } = useAuthState();
  const router = useRouter();
  const nftData = useAppSelector((state) => state.allNft);

  const typeColors = {
    prediction: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    game: "bg-green-500/20 text-green-400 border-green-500/30",
    tournament: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  };

  const handlePlayGame = () => {
    if (event.externalGameUrl) {
      router.push(`/play/${event.id}`);
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={() => onOpenChange(false)} 
      title={event.title}
      logo={
        <img 
          src="/logo/intelliverse-X img-1.svg" 
          alt="Intelliverse X" 
          className="w-6 h-6"
        />
      }
    >
      <div className="max-w-6xl w-full max-h-[calc(100vh-8rem)]">
        {/* Header section with event info */}
        {/* <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700/30">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={typeColors[event.type]}
              >
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
              <StatusDot status={event.status} />
              {event.externalGameUrl && (
                <Badge 
                  variant="outline" 
                  className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                >
                  External Game
                </Badge>
              )}
            </div>
          </div>
        </div> */}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          {/* Left Column - Summary & Description */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-slate-800/50 rounded-lg p-5 space-y-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">Event Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-white font-medium bg-slate-700/50 px-2 py-1 rounded">{event.entryFeeXUT} XUT</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Rewards</span>
                  <span className="text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded">{formatXUT(event.rewardsXUT)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Ends</span>
                  <span className="text-white">{event.endsIn}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Players</span>
                  <span className="text-white font-medium">{event.players}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-300">About</h3>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <p className="text-gray-400 leading-relaxed">{event.description}</p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl mb-6"
              size="lg"
              onClick={handlePlayGame}
            >
              {event.ctaLabel}
            </Button>
          </div>

          {/* Right Column - Tabs */}
          <div className="space-y-4">
            <Tabs defaultValue="store" className="w-full">
              <TabsList className={`grid w-full ${event.type === 'game' ? 'grid-cols-3' : 'grid-cols-2'} bg-slate-800/80 border border-slate-700/50`}>
                <TabsTrigger 
                  value="store" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
                >
                  {event.eventStoreTitle}
                </TabsTrigger>
                {event.type === 'game' && (
                  <TabsTrigger 
                    value="nfts" 
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
                  >
                    NFTs
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="leaderboard" 
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
                >
                  {event.leaderboardTitle || "Leaderboard"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="store" className="mt-6">
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                  <ProductList products={event.products} />
                </div>
              </TabsContent>

              {event.type === 'game' && (
                <TabsContent value="nfts" className="mt-6">
                  <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                    {nftData.loading ? (
                      <div className="p-6 text-center text-gray-400">
                        Loading NFTs...
                      </div>
                    ) : nftData.error ? (
                      <div className="p-6 text-center text-red-400">
                        Error: {nftData.error}
                      </div>
                    ) : nftData.nftItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nftData.nftItems.map((nft) => (
                          <Card key={nft.id} className="bg-gray-800/50 border-gray-700">
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-white mb-1">{nft.nftName}</h4>
                                  <div className="text-blue-400 font-semibold">{nft.price} XUT</div>
                                </div>
                                {nft.discount && nft.discount > 0 && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {nft.discount}% OFF
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
                                disabled
                              >
                                Buy Now
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        No NFTs found for this game
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="leaderboard" className="mt-6">
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
                  <LeaderboardNew rows={event.leaderboard} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Modal>
  );
}