'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, AlertTriangle, Bold, Italic, Underline, Strikethrough, Link, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, X, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '../common/RichTextEditor';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchGames, 
  updateGameStatus, 
  setFilters, 
  clearFilters, 
  selectFilteredGames, 
  selectGamesLoading, 
  selectGamesError, 
  clearError,
  GameManagement 
} from '../../store/slices/gameSlice';
import Image from 'next/image';

interface GameListProps {
  onAddGame?: () => void;
  onEditGame?: (gameId: string) => void;
  onViewGame?: (gameId: string) => void;
}

export default function GameList({ onAddGame, onEditGame, onViewGame }: GameListProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const games = useSelector(selectFilteredGames);
  const loading = useSelector(selectGamesLoading);
  const error = useSelector(selectGamesError);
  console.log("Games", games);
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [updatingGames, setUpdatingGames] = useState<Set<string>>(new Set());
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameManagement | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Fetch games from Redux store
  const handleFetchGames = () => {
    dispatch(fetchGames());
  };

  useEffect(() => {
    handleFetchGames();
  }, [dispatch]);

  // Update Redux filters when local state changes
  useEffect(() => {
    dispatch(setFilters({ search: searchTerm, status: statusFilter }));
  }, [searchTerm, statusFilter, dispatch]);

    const handleStatusChange = async (gameId: string, newStatus: 'live' | 'pending' | 'rejected') => {
    if (newStatus === 'rejected') {
      const game = games.find(g => g.id === gameId);
      if (game) {
        setSelectedGame(game);
        setShowRejectModal(true);
      }
    } else {
      try {
        setUpdatingGames(prev => new Set(prev).add(gameId));
        
        // Update game status via Redux
        await dispatch(updateGameStatus({
          gameId,
          status: newStatus
        })).unwrap();
        
        setSuccessMessage(`Game status updated to ${newStatus} successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error updating game status:', error);
        // Revert the select value on error
        const game = games.find(g => g.id === gameId);
        if (game) {
          const selectElement = document.querySelector(`select[data-game-id="${gameId}"]`) as HTMLSelectElement;
          if (selectElement) {
            selectElement.value = game.status;
          }
        }
      } finally {
        setUpdatingGames(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameId);
          return newSet;
        });
      }
    }
  };

  const handleRejectGame = async () => {
    if (selectedGame && rejectionNote.trim()) {
      try {
        // Update the game status to rejected via Redux
        await dispatch(updateGameStatus({
          gameId: selectedGame.id,
          status: 'rejected',
          rejectionNote
        })).unwrap();
        
        // Close modal and reset
        setShowRejectModal(false);
        setSelectedGame(null);
        setRejectionNote('');
      } catch (error) {
        console.error('Error rejecting game:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setSelectedGame(null);
    setRejectionNote('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02a7fd]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080f] via-[#0c1120] to-[#0f1529] p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E6E9F2] mb-3 bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] bg-clip-text text-transparent">Game Management</h1>
        <p className="text-[#9AA3B2] text-lg">Manage games submitted by game developers.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl p-6 mb-6 hover:border-[#2e2d7b]/50 transition-all duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Search size={18} className="text-[#9AA3B2]" />
              <input
                type="text"
                placeholder="Search games, developers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 min-w-[300px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[#9AA3B2]">Filter by:</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="live">Live</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleFetchGames}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 border border-[#2e2d7b]/30 rounded-xl text-[#9AA3B2] hover:bg-[#0f1529]/50 hover:border-[#2e2d7b]/50 hover:text-[#E6E9F2] transition-all duration-200 disabled:opacity-50 bg-[#0f1529]/30"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={onAddGame || (() => router.push('/games/add'))}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] text-white rounded-xl hover:from-[#0284c7] hover:to-[#6d28d9] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={18} />
              Add New Game
            </button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6 text-sm text-[#9AA3B2] bg-[#0c1120]/50 rounded-xl px-4 py-3 border border-[#1e1b4d]/20">
        Showing {games.length} games
        {searchTerm && ` matching "${searchTerm}"`}
        {statusFilter && ` with status "${statusFilter}"`}
      </div>

      {/* Games Table */}
      <div className="bg-[#0c1120]/80 backdrop-blur-sm border border-[#1e1b4d]/30 rounded-2xl shadow-2xl overflow-hidden hover:border-[#2e2d7b]/50 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1529]/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Game Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Developer
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Game Type
                </th> */}
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Revenue Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  NFT linked
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#9AA3B2] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b4d]/20">
              {games.map((game, index) => (
                <tr key={game.id} className="hover:bg-[#0f1529]/30 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9AA3B2]">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#02a7fd] to-[#7c3aed] rounded-xl flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {/* {game.title.substring(0, 4).toUpperCase()} */}
                          <Image src={game.logoUrl} alt={game.title} width={40} height={40} />
                        </span>
                      </div>
                      <div className="text-sm font-medium text-[#E6E9F2]">{game.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {game.category.map((cat: string, idx: number) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#0f1529]/50 border border-[#2e2d7b]/30 text-[#02a7fd]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E6E9F2]">
                    {game.developer}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E6E9F2]">
                    {game.gameType}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E6E9F2]">
                    {/* {game.revenueSources} */}
                    <div className="flex flex-wrap gap-1">
                      {game.revenueSources.map((cat: string, idx: number) => (
                        <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#0f1529]/50 border border-[#2e2d7b]/30 text-[#02a7fd]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      game.nftLinked 
                        ? 'bg-[#0f1529]/50 border border-[#22c55e]/30 text-[#22c55e]'
                        : 'bg-[#0f1529]/50 border border-[#2e2d7b]/30 text-[#9AA3B2]'
                    }`}>
                      {game.nftLinked ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select 
                      className="px-3 py-2 border border-[#2e2d7b]/30 rounded-xl bg-[#0f1529]/50 text-[#E6E9F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#02a7fd] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                      value={game.status}
                      data-game-id={game.id}
                      disabled={updatingGames.has(game.id)}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'live' | 'pending' | 'rejected';
                        handleStatusChange(game.id, newStatus);
                      }}
                    >
                      <option value="live">Live</option>
                      <option value="pending">Pending</option>
                      <option value="draft">Draft</option>
                    </select>
                    {updatingGames.has(game.id) && (
                      <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-[#02a7fd]"></div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#0f1529]/50 rounded-full flex items-center justify-center">
              <span className="text-2xl text-[#9AA3B2]">🎮</span>
            </div>
            <p className="text-[#9AA3B2] text-lg">No games found</p>
            <p className="text-[#6B7280] text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="px-4 py-2 text-sm text-[#9AA3B2] hover:text-[#E6E9F2] disabled:opacity-50 transition-colors duration-200">
          ← Previous
        </button>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
            <button
              key={page}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                page === 1
                  ? 'bg-gradient-to-r from-[#02a7fd] to-[#7c3aed] text-white shadow-lg'
                  : 'text-[#9AA3B2] hover:text-[#E6E9F2] hover:bg-[#0f1529]/30'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 text-sm text-[#9AA3B2] hover:text-[#E6E9F2] transition-colors duration-200">
          Next →
        </button>
      </div>

      {/* Reject Game Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c1120] border border-[#1e1b4d]/30 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-6 border-b border-[#1e1b4d]/30">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#E6E9F2]">
                  Reject Game Submission
                </h3>
                <p className="text-sm text-[#9AA3B2] mt-1">
                  Please enter a note explaining the reason for rejection. This will be shared with the submitter.
                </p>
              </div>
              <button
                onClick={handleCancelReject}
                className="text-[#9AA3B2] hover:text-[#E6E9F2] transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rich Text Editor */}
              <RichTextEditor
                value={rejectionNote}
                onChange={setRejectionNote}
                placeholder="Enter rejection reason..."
                height="150px"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#1e1b4d]/30">
              <button
                onClick={handleCancelReject}
                className="px-4 py-2 border border-[#2e2d7b]/30 rounded-xl text-[#9AA3B2] hover:bg-[#0f1529]/50 hover:border-[#2e2d7b]/50 hover:text-[#E6E9F2] transition-all duration-200 bg-[#0f1529]/30"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectGame}
                disabled={!rejectionNote.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl hover:from-[#dc2626] hover:to-[#b91c1c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 