"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Trophy, DollarSign, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { FriendActivity } from '@/src/types/arena';
import { fetchFriendsNow } from '@/src/lib/api';

interface FriendsNowProps {
  className?: string;
}

export default function FriendsNow({ className = '' }: FriendsNowProps) {
  const [friends, setFriends] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await fetchFriendsNow();
        setFriends(data);
      } catch (error) {
        console.error('Failed to load friends activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const getActivityIcon = (activity: string) => {
    if (activity.includes('Playing')) {
      return <Play className="w-3 h-3 text-green-400" />;
    } else if (activity.includes('Betting') || activity.includes('prediction')) {
      return <DollarSign className="w-3 h-3 text-purple-400" />;
    } else if (activity.includes('tournament') || activity.includes('Joined')) {
      return <Trophy className="w-3 h-3 text-blue-400" />;
    } else if (activity.includes('Won')) {
      return <Trophy className="w-3 h-3 text-yellow-400" />;
    }
    return <Users className="w-3 h-3 text-gray-400" />;
  };

  const getActivityColor = (activity: string) => {
    if (activity.includes('Playing')) {
      return 'text-green-400';
    } else if (activity.includes('Betting') || activity.includes('prediction')) {
      return 'text-purple-400';
    } else if (activity.includes('tournament') || activity.includes('Joined')) {
      return 'text-blue-400';
    } else if (activity.includes('Won')) {
      return 'text-yellow-400';
    }
    return 'text-gray-400';
  };

  const handleQuickJoin = (friend: FriendActivity) => {
    console.log('Quick joining friend:', friend.user);
    // Implement quick join logic
  };

  if (loading) {
    return (
      <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Friends Playing Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-32" />
                </div>
                <div className="w-16 h-6 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#0F1629] border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Friends Playing Now
        </CardTitle>
        <p className="text-sm text-gray-400">See what your friends are up to</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.user}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-800/30 transition-all duration-200 group"
            >
              {/* Friend Avatar */}
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.user}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500/50 transition-colors"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/avatars/default.png';
                  }}
                />
                
                {/* Online Status */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0F1629]">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Friend Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate text-sm">
                  {friend.user}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {getActivityIcon(friend.activity)}
                  <span className={`text-xs truncate ${getActivityColor(friend.activity)}`}>
                    {friend.activity}
                  </span>
                </div>
              </div>

              {/* Quick Join Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickJoin(friend)}
                className="opacity-0 group-hover:opacity-100 transition-opacity border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 px-2 py-1 h-auto text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Join
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {friends.length === 0 && !loading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-2">No friends online</p>
            <p className="text-gray-500 text-xs">
              Invite friends to join the arena!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
            >
              {friends.length} online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-400 text-xs h-auto p-1"
            >
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}