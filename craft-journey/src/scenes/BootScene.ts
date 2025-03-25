import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load essential assets
    this.load.image('player', 'assets/player.webp');
    this.load.image('grass', 'assets/tiles/grass.webp');
    this.load.image('dirt', 'assets/tiles/dirt.png');
    this.load.image('stone', 'assets/tiles/stone.png');
    this.load.image('tree', 'assets/objects/tree.png');
    
    // New assets for crafting/building system
    this.load.image('stone_deposit', 'assets/objects/stone_deposit.png');
    this.load.image('particle', 'assets/effects/particle.png');
    
    // Item textures
    this.load.image('item_wood', 'assets/items/wood.png');
    this.load.image('item_stone', 'assets/items/stone.png');
    this.load.image('item_axe', 'assets/items/axe.png');
    this.load.image('item_pickaxe', 'assets/items/pickaxe.png');
    
    // Building textures
    this.load.image('wooden_wall', 'assets/buildings/wooden_wall.png');
    this.load.image('crafting_table', 'assets/buildings/crafting_table.png');
    
    // UI elements
    this.load.image('inventory_slot', 'assets/ui/inventory_slot.png');
    this.load.image('selected_slot', 'assets/ui/selected_slot.png');
  }

  create() {
    this.scene.start('WorldScene');
  }
}