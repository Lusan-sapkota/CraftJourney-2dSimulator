export interface Tile {
  type: string;
  object?: string;
  resources?: {
    type: string;
    amount: number;
  };
}

export class WorldGenerator {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
  }
  
  // Simple pseudo-random number generator based on position and seed
  private noise(x: number, y: number): number {
    const nx = x * 0.01 + this.seed;
    const ny = y * 0.01 + this.seed;
    return Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453 % 1;
  }
  
  generateChunk(chunkX: number, chunkY: number, size: number): Tile[][] {
    const chunk: Tile[][] = [];
    
    for (let y = 0; y < size; y++) {
      chunk[y] = [];
      
      for (let x = 0; x < size; x++) {
        const worldX = chunkX * size + x;
        const worldY = chunkY * size + y;
        
        const noiseValue = this.noise(worldX, worldY);
        const resourceNoise = this.noise(worldX + 500, worldY + 500);
        
        let tile: Tile;
        
        // Determine tile type based on noise
        if (noiseValue < 0.3) {
          tile = { type: 'grass' };
          
          // Add trees with some probability
          if (noiseValue > 0.22 && noiseValue < 0.28) {
            tile.object = 'tree';
            tile.resources = {
              type: 'wood',
              amount: 3 + Math.floor(resourceNoise * 3) // 3-5 wood
            };
          }
        } else if (noiseValue < 0.6) {
          tile = { type: 'dirt' };
          
          // Sometimes add stone deposits on dirt
          if (resourceNoise > 0.8) {
            tile.object = 'stone_deposit';
            tile.resources = {
              type: 'stone',
              amount: 2 + Math.floor(resourceNoise * 3) // 2-4 stone
            };
          }
        } else {
          tile = { type: 'stone' };
          
          // Stone areas have more stone resources
          if (resourceNoise > 0.7) {
            tile.object = 'stone_deposit';
            tile.resources = {
              type: 'stone',
              amount: 4 + Math.floor(resourceNoise * 4) // 4-7 stone
            };
          }
        }
        
        chunk[y][x] = tile;
      }
    }
    
    return chunk;
  }
  
  // Helper method to convert world coordinates to chunk coordinates
  worldToChunkCoordinates(x: number, y: number, chunkSize: number): [number, number, number, number] {
    const chunkX = Math.floor(x / (chunkSize * 16));
    const chunkY = Math.floor(y / (chunkSize * 16));
    const tileX = Math.floor((x % (chunkSize * 16)) / 16);
    const tileY = Math.floor((y % (chunkSize * 16)) / 16);
    return [chunkX, chunkY, tileX, tileY];
  }
}