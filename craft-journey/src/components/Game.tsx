import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { WorldScene } from '../scenes/WorldScene';
import InventoryUI from './InventoryUI';

interface GameProps {
  onGameReady?: () => void;
}

interface GameItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface GameRecipe {
  result: string;
  resultName: string;
  count: number;
  ingredients: Array<{name: string, count: number}>;
  canCraft: boolean;
}

const Game: React.FC<GameProps> = ({ onGameReady }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<GameItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [recipes, setRecipes] = useState<GameRecipe[]>([]);

  useEffect(() => {
    if (gameRef.current && !gameInstance.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: window.innerWidth,
        height: window.innerHeight,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: [BootScene, WorldScene],
        backgroundColor: '#4CAF50',
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      gameInstance.current = new Phaser.Game(config);
      
      // Listen for inventory toggle events
      gameInstance.current.events.on('toggleInventory', (data: any) => {
        setShowInventory(data.open);
        
        if (data.items) {
          // Convert game inventory data to UI format
          const items: GameItem[] = data.items
            .filter((slot: any) => slot !== null)
            .map((slot: any) => ({
              id: slot.itemId,
              name: slot.itemId.charAt(0).toUpperCase() + slot.itemId.slice(1),
              count: slot.count,
              icon: `assets/items/${slot.itemId}.png`
            }));
          
          setInventoryItems(items);
        }
        
        if (data.recipes) {
          // Convert recipe data to UI format
          // This would need to be processed from game data
          setRecipes(data.recipes.map((recipe: any) => ({
            result: recipe.result,
            resultName: recipe.result.charAt(0).toUpperCase() + recipe.result.slice(1),
            count: recipe.count,
            ingredients: recipe.ingredients.map((ing: any) => ({
              name: ing.itemId.charAt(0).toUpperCase() + ing.itemId.slice(1),
              count: ing.count
            })),
            canCraft: true // This would be calculated based on inventory
          })));
        }
      });
      
      if (onGameReady) {
        onGameReady();
      }
    }

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [onGameReady]);

  const handleSelectSlot = (index: number) => {
    setSelectedSlot(index);
    
    // Send event to the game
    if (gameInstance.current) {
      gameInstance.current.events.emit('selectInventorySlot', { slot: index });
    }
  };
  
  const handleCloseInventory = () => {
    setShowInventory(false);
    
    // Send event to the game
    if (gameInstance.current) {
      gameInstance.current.events.emit('closeInventory');
    }
  };
  
  const handleCraft = (itemId: string) => {
    // Send craft request to the game
    if (gameInstance.current) {
      gameInstance.current.events.emit('craftItem', { itemId });
    }
  };

  return (
    <>
      <div ref={gameRef} id="game-container" style={{ width: '100%', height: '100%' }} />
      
      {showInventory && (
        <InventoryUI 
          items={inventoryItems}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
          onClose={handleCloseInventory}
          onCraft={handleCraft}
          recipes={recipes}
        />
      )}
    </>
  );
};

export default Game;