import Phaser from 'phaser';
import { WorldGenerator } from './WorldGenerator';
import { InventorySystem } from './InventorySystem';
import { ChunkManager } from './ChunkManager';

export class InteractionSystem {
  private scene: Phaser.Scene;
  private worldGenerator: WorldGenerator;
  private inventory: InventorySystem;
  private chunkManager: ChunkManager;
  private interactionDistance: number = 32; // 2 tiles
  private buildingObjects: Phaser.GameObjects.Sprite[] = [];
  
  constructor(scene: Phaser.Scene, worldGenerator: WorldGenerator, inventory: InventorySystem, chunkManager: ChunkManager) {
    this.scene = scene;
    this.worldGenerator = worldGenerator;
    this.inventory = inventory;
    this.chunkManager = chunkManager;
    
    // Set up interaction events
    this.setupInteraction();
  }
  
  private setupInteraction() {
    // Add click/tap interaction
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      
      // Get the player sprite from the scene
      const player = this.scene.children.getByName('player') as Phaser.GameObjects.Sprite;
      if (!player) return;
      
      // Check if click is within interaction distance
      const distance = Phaser.Math.Distance.Between(
        player.x, player.y, 
        worldPoint.x, worldPoint.y
      );
      
      if (distance <= this.interactionDistance) {
        // Determine if gathering or building
        const selectedItem = this.inventory.getSelectedItem();
        
        if (selectedItem && this.isItemBuilding(selectedItem.itemId)) {
          this.placeBuilding(worldPoint.x, worldPoint.y, selectedItem.itemId);
        } else {
          this.gatherResource(worldPoint.x, worldPoint.y);
        }
      }
    });
    
    // Add keyboard shortcuts for item selection (1-9)
    this.scene.input.keyboard.on('keydown-ONE', () => this.inventory.setSelectedSlot(0));
    this.scene.input.keyboard.on('keydown-TWO', () => this.inventory.setSelectedSlot(1));
    this.scene.input.keyboard.on('keydown-THREE', () => this.inventory.setSelectedSlot(2));
    this.scene.input.keyboard.on('keydown-FOUR', () => this.inventory.setSelectedSlot(3));
    this.scene.input.keyboard.on('keydown-FIVE', () => this.inventory.setSelectedSlot(4));
    this.scene.input.keyboard.on('keydown-SIX', () => this.inventory.setSelectedSlot(5));
    this.scene.input.keyboard.on('keydown-SEVEN', () => this.inventory.setSelectedSlot(6));
    this.scene.input.keyboard.on('keydown-EIGHT', () => this.inventory.setSelectedSlot(7));
    this.scene.input.keyboard.on('keydown-NINE', () => this.inventory.setSelectedSlot(8));
  }
  
  private isItemBuilding(itemId: string): boolean {
    // Check if the item is a building type
    // This would be better to check from ItemSystem directly
    return itemId.includes('wooden_wall') || itemId.includes('crafting_table');
  }
  
  gatherResource(x: number, y: number) {
    // Convert world coordinates to tile coordinates
    const [chunkX, chunkY, tileX, tileY] = this.worldGenerator.worldToChunkCoordinates(x, y, 16);
    
    // Get the chunk from chunk manager
    const chunk = this.chunkManager.getChunk(chunkX, chunkY);
    if (!chunk) return;
    
    const tile = chunk[tileY]?.[tileX];
    if (!tile || !tile.resources) return;
    
    // Gather the resource
    const resourceType = tile.resources.type;
    const amount = tile.resources.amount;
    
    // Add to inventory
    if (this.inventory.addItem(resourceType, amount)) {
      // Resource gathered successfully, remove the object from the tile
      delete tile.object;
      delete tile.resources;
      
      // Update visual representation
      const worldX = chunkX * 16 * 16 + tileX * 16;
      const worldY = chunkY * 16 * 16 + tileY * 16;
      
      // Find and remove the object sprite
      const sprites = this.chunkManager.getChunkSprites(chunkX, chunkY);
      if (sprites) {
        const objectSprite = sprites.find(sprite => 
          sprite.x === worldX && 
          sprite.y === worldY && 
          (sprite.texture.key === 'tree' || sprite.texture.key === 'stone_deposit')
        );
        
        if (objectSprite) {
          objectSprite.destroy();
        }
      }
      
      // Show gathering effect
      this.showGatherEffect(x, y);
      
      // Play sound
      // this.scene.sound.play('gather_sound');
    }
  }
  
  placeBuilding(x: number, y: number, buildingId: string) {
    // Get the building from inventory
    const selectedItem = this.inventory.getSelectedItem();
    if (!selectedItem || selectedItem.count <= 0) return;
    
    // Round to the nearest tile
    const tileX = Math.floor(x / 16) * 16;
    const tileY = Math.floor(y / 16) * 16;
    
    // Check if the tile is empty
    const [chunkX, chunkY, localTileX, localTileY] = this.worldGenerator.worldToChunkCoordinates(x, y, 16);
    const chunk = this.chunkManager.getChunk(chunkX, chunkY);
    
    if (!chunk) return;
    
    const tile = chunk[localTileY]?.[localTileX];
    if (!tile || tile.object) return; // Can't build where there's already an object
    
    // Place the building
    const building = this.scene.add.sprite(tileX, tileY, buildingId);
    building.setOrigin(0, 0);
    building.setData('buildingId', buildingId);
    this.buildingObjects.push(building);
    
    // Update the tile data
    tile.object = buildingId;
    
    // Remove the item from inventory
    this.inventory.removeItem(buildingId, 1);
    
    // Play building sound
    // this.scene.sound.play('build_sound');
  }
  
  private showGatherEffect(x: number, y: number) {
    // Create a simple particle effect for gathering
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 40 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      gravityY: 50,
      quantity: 10
    });
    
    // Auto-destroy the emitter after animation completes
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }
  
  update() {
    // Update any interaction-related logic here
    // For example, highlighting interactable objects near the player
  }
}