import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load essential assets
    this.load.image('player', 'assets/player.webp');
    this.load.image('grass', 'assets/tiles/grass.webp');
    this.load.image('dirt', 'assets/tiles/dirt.webp');
    this.load.image('stone', 'assets/tiles/stone.webp');
    this.load.image('tree', 'assets/objects/tree.webp');
    
    // New assets for crafting/building system
    this.load.image('stone_deposit', 'assets/objects/stone_deposit.webp');
    this.load.image('particle', 'assets/effects/particle.webp');
    
    // Item textures
    this.load.image('item_wood', 'assets/items/wood.webp');
    this.load.image('item_stone', 'assets/items/stone.webp');
    this.load.image('item_axe', 'assets/items/axe.webp');
    this.load.image('item_pickaxe', 'assets/items/pickaxe.webp');
    
    // Building textures
    this.load.image('wooden_wall', 'assets/buildings/wooden_wall.webp');
    this.load.image('crafting_table', 'assets/buildings/crafting_table.webp');
    
    // UI elements
    this.load.image('inventory_slot', 'assets/ui/inventory_slot.webp');
    this.load.image('selected_slot', 'assets/ui/selected_slot.webp');
  }

  create() {
    this.scene.start('WorldScene');
  }
}