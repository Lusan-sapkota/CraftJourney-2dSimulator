import Phaser from 'phaser';
import { WorldGenerator, Tile } from './WorldGenerator';

export class ChunkManager {
  private scene: Phaser.Scene;
  private chunks: Map<string, { group: Phaser.GameObjects.Group, data: Tile[][] }>;
  private activeChunks: Set<string>;
  private chunkSize: number = 16 * 16; // 16 tiles of 16px
  private loadDistance: number = 2; // Load chunks within this distance
  private worldGenerator: WorldGenerator;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.chunks = new Map();
    this.activeChunks = new Set();
    this.worldGenerator = new WorldGenerator();
  }
  
  getChunkKey(x: number, y: number): string {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkSize);
    return `${chunkX},${chunkY}`;
  }
  
  loadInitialChunks(playerX: number, playerY: number) {
    const centerChunkKey = this.getChunkKey(playerX, playerY);
    const [centerChunkX, centerChunkY] = centerChunkKey.split(',').map(Number);
    
    // Load chunks around player
    for (let x = centerChunkX - this.loadDistance; x <= centerChunkX + this.loadDistance; x++) {
      for (let y = centerChunkY - this.loadDistance; y <= centerChunkY + this.loadDistance; y++) {
        this.loadChunk(x, y);
      }
    }
  }
  
  loadChunk(chunkX: number, chunkY: number) {
    const key = `${chunkX},${chunkY}`;
    
    // Skip if chunk already loaded
    if (this.chunks.has(key)) {
      this.activeChunks.add(key);
      return;
    }
    
    // Create a new chunk group
    const chunkGroup = this.scene.add.group();
    
    // Generate chunk data using world generator
    const chunkData = this.worldGenerator.generateChunk(chunkX, chunkY, 16);
    
    // Create chunk tiles
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const worldX = chunkX * this.chunkSize + x * 16;
        const worldY = chunkY * this.chunkSize + y * 16;
        
        const tile = chunkData[y][x];
        let sprite;
        
        switch (tile.type) {
          case 'grass':
            sprite = this.scene.add.image(worldX, worldY, 'grass');
            break;
          case 'dirt':
            sprite = this.scene.add.image(worldX, worldY, 'dirt');
            break;
          case 'stone':
            sprite = this.scene.add.image(worldX, worldY, 'stone');
            break;
          default:
            sprite = this.scene.add.image(worldX, worldY, 'grass');
        }
        
        // Center the sprites
        sprite.setOrigin(0, 0);
        chunkGroup.add(sprite);
        
        // Add objects (trees, resources, etc.)
        if (tile.object) {
          const objSprite = this.scene.add.image(worldX, worldY, tile.object);
          objSprite.setOrigin(0, 0);
          chunkGroup.add(objSprite);
        }
      }
    }
    
    // Store and activate chunk
    this.chunks.set(key, { group: chunkGroup, data: chunkData });
    this.activeChunks.add(key);
  }
  
  unloadChunk(key: string) {
    const chunk = this.chunks.get(key);
    if (chunk) {
      chunk.group.setVisible(false);
      this.activeChunks.delete(key);
    }
  }
  
  getChunk(chunkX: number, chunkY: number): Tile[][] | undefined {
    const key = `${chunkX},${chunkY}`;
    return this.chunks.get(key)?.data;
  }
  
  getChunkSprites(chunkX: number, chunkY: number): Phaser.GameObjects.GameObject[] | undefined {
    const key = `${chunkX},${chunkY}`;
    return this.chunks.get(key)?.group.getChildren();
  }
  
  update(playerX: number, playerY: number) {
    const centerChunkKey = this.getChunkKey(playerX, playerY);
    const [centerChunkX, centerChunkY] = centerChunkKey.split(',').map(Number);
    
    // Mark all chunks for potential unloading
    const previouslyActive = new Set(this.activeChunks);
    this.activeChunks.clear();
    
    // Load/activate chunks in range
    for (let x = centerChunkX - this.loadDistance; x <= centerChunkX + this.loadDistance; x++) {
      for (let y = centerChunkY - this.loadDistance; y <= centerChunkY + this.loadDistance; y++) {
        this.loadChunk(x, y);
      }
    }
    
    // Unload chunks that are now out of range
    for (const key of previouslyActive) {
      if (!this.activeChunks.has(key)) {
        this.unloadChunk(key);
      }
    }
  }
}