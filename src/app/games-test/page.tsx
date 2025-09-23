'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import { 
  fetchGames, 
  updateGameStatus, 
  selectGames, 
  selectGamesLoading, 
  selectGamesError 
} from '@/src/store/slices/gameSlice';

export default function GamesTestPage() {
  const dispatch = useDispatch<AppDispatch>();
  const games = useSelector(selectGames);
  const loading = useSelector(selectGamesLoading);
  const error = useSelector(selectGamesError);

  const testGetGames = () => {
    dispatch(fetchGames());
  };

  const testUpdateStatus = async (gameId: string, newStatus: 'live' | 'pending' | 'rejected') => {
    try {
      await dispatch(updateGameStatus({
        gameId,
        status: newStatus,
        rejectionNote: newStatus === 'rejected' ? 'Test rejection note' : undefined
      })).unwrap();
      
      console.log('Status updated successfully');
      
      // Refresh the games list
      dispatch(fetchGames());
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  useEffect(() => {
    testGetGames();
  }, [dispatch]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Games API Test Page</h1>
      
      <div className="mb-6">
        <button
          onClick={testGetGames}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
        >
          {loading ? 'Loading...' : 'Refresh Games'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="grid gap-4">
        {games.map((game) => (
          <div key={game.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{game.title}</h3>
                <p className="text-gray-600">{game.subtitle}</p>
                <p className="text-sm text-gray-500">Developer: {game.developer}</p>
                <p className="text-sm text-gray-500">Status: {game.status}</p>
                <p className="text-sm text-gray-500">Type: {game.gameType}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => testUpdateStatus(game.id, 'live')}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Set Live
                </button>
                <button
                  onClick={() => testUpdateStatus(game.id, 'pending')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Set Pending
                </button>
                <button
                  onClick={() => testUpdateStatus(game.id, 'rejected')}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Set Rejected
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && !loading && (
        <div className="text-center text-gray-500">
          No games found. Try refreshing or check the console for errors.
        </div>
      )}
    </div>
  );
}
