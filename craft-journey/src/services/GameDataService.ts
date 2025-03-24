export interface GameSave {
  player: {
    x: number;
    y: number;
    inventory: Record<string, number>;
  };
  worldSeed: number;
  timestamp: number;
}

export class GameDataService {
  private static readonly SAVE_KEY = 'craft_journey_save';

  async saveGame(data: GameSave): Promise<void> {
    try {
      localStorage.setItem(GameDataService.SAVE_KEY, JSON.stringify(data));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to save game:', error);
      return Promise.reject(error);
    }
  }

  async loadGame(): Promise<GameSave | null> {
    try {
      const saveData = localStorage.getItem(GameDataService.SAVE_KEY);
      if (!saveData) return null;
      return JSON.parse(saveData) as GameSave;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  async exportSave(): Promise<string> {
    const saveData = localStorage.getItem(GameDataService.SAVE_KEY);
    if (!saveData) throw new Error('No save data found');
    return saveData;
  }

  async importSave(saveData: string): Promise<void> {
    try {
      const parsedData = JSON.parse(saveData);
      // Validate data structure here
      localStorage.setItem(GameDataService.SAVE_KEY, saveData);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to import save:', error);
      return Promise.reject(error);
    }
  }
}