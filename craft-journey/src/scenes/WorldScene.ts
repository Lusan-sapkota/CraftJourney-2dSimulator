import Phaser from 'phaser';
import { ChunkManager } from '../game/ChunkManager';
import { WorldGenerator } from '../game/WorldGenerator';
import { ItemSystem } from '../game/ItemSystem';
import { InventorySystem } from '../game/InventorySystem';
import { InteractionSystem } from '../game/InteractionSystem';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private chunkManager!: ChunkManager;
  private worldGenerator!: WorldGenerator;
  private itemSystem!: ItemSystem;
  private inventory!: InventorySystem;
  private interactionSystem!: InteractionSystem;
  private hotbarUI!: Phaser.GameObjects.Group;
  private inventoryOpen: boolean = false;
  
  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    // Initialize systems
    this.worldGenerator = new WorldGenerator();
    this.chunkManager = new ChunkManager(this);
    this.itemSystem = new ItemSystem();
    this.inventory = new InventorySystem(this.itemSystem);
    
    // Create player
    this.player = this.physics.add.sprite(
      this.cameras.main.centerX, 
      this.cameras.main.centerY, 
      'player'
    );
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(false);
    this.player.setName('player'); // Name for reference
    
    // Camera follows player
    this.cameras.main.startFollow(this.player, true);
    
    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Initial chunks around player
    this.chunkManager.loadInitialChunks(this.player.x, this.player.y);
    
    // Initialize interaction system
    this.interactionSystem = new InteractionSystem(
      this, this.worldGenerator, this.inventory, this.chunkManager
    );
    
    // Start with some items (for testing)
    this.inventory.addItem('wood', 10);
    this.inventory.addItem('stone', 5);
    
    // Create hotbar UI
    this.createHotbarUI();
    
    // Input for opening inventory (E key)
    this.input.keyboard.on('keydown-E', () => {
      this.toggleInventory();
    });
  }

  update() {
    // Player movement
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(150);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(150);
    }
    
    // Update chunks based on player position
    this.chunkManager.update(this.player.x, this.player.y);
    
    // Update interaction system
    this.interactionSystem.update();
    
    // Update UI
    this.updateHotbarUI();
  }
  
  private createHotbarUI() {
    this.hotbarUI = this.add.group();
    
    // Create background for hotbar
    const hotbarBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.height - 40,
      400, 60,
      0x000000, 0.7
    );
    hotbarBg.setScrollFactor(0); // Fixed to camera
    this.hotbarUI.add(hotbarBg);
    
    // Create 9 slots for items
    for (let i = 0; i < 9; i++) {
      const slot = this.add.image(
        this.cameras.main.centerX - 180 + i * 45,
        this.cameras.main.height - 40,
        'inventory_slot'
      );
      slot.setScrollFactor(0);
      this.hotbarUI.add(slot);
    }
    
    // Selected slot indicator
    const selectedSlot = this.add.image(
      this.cameras.main.centerX - 180,
      this.cameras.main.height - 40,
      'selected_slot'
    );
    selectedSlot.setScrollFactor(0);
    selectedSlot.setName('selectedSlot');
    this.hotbarUI.add(selectedSlot);
  }
  
  private updateHotbarUI() {
    // Update selected slot position
    const selectedSlot = this.children.getByName('selectedSlot') as Phaser.GameObjects.Image;
    if (selectedSlot) {
      selectedSlot.x = this.cameras.main.centerX - 180 + this.inventory.getSelectedSlot() * 45;
    }
    
    // TODO: Update item icons in slots
  }
  
  private toggleInventory() {
    this.inventoryOpen = !this.inventoryOpen;
    
    // This would be handled on the React side
    // The game emits an event that React can listen to
    this.game.events.emit('toggleInventory', {
      open: this.inventoryOpen,
      items: this.inventory.getSlots(),
      recipes: this.itemSystem.getRecipes()
    });
  }
}