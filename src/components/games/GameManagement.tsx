'use client';

import React, { useState } from 'react';
import GameList from './GameList';
import AddGame from './AddGame';

type ViewType = 'list' | 'add';

export default function GameManagement() {
  const [currentView, setCurrentView] = useState<ViewType>('list');

  const handleAddGame = () => {
    setCurrentView('add');
  };

  const handleBackToList = () => {
    setCurrentView('list');
  };

  const handleEditGame = (gameId: string) => {
    // Handle edit game - you can implement this later
    console.log('Edit game:', gameId);
  };

  const handleViewGame = (gameId: string) => {
    // Handle view game - you can implement this later
    console.log('View game:', gameId);
  };

  return (
    <div>
      {currentView === 'list' ? (
        <GameList 
          onAddGame={handleAddGame}
          onEditGame={handleEditGame}
          onViewGame={handleViewGame}
        />
      ) : (
        <AddGame onBack={handleBackToList} />
      )}
    </div>
  );
} 