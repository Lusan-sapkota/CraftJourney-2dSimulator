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
    this.input.keyboard?.on('keydown-E', () => {
      this.toggleInventory();
    });

    // Add this to your create method
    this.scale.on('resize', this.resizeUI, this);
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
    hotbarBg.setDepth(9); // Set consistent depth for UI
    this.hotbarUI.add(hotbarBg);
    
    // Create 9 slots for items
    for (let i = 0; i < 9; i++) {
      const slot = this.add.image(
        this.cameras.main.centerX - 180 + i * 45,
        this.cameras.main.height - 40,
        'inventory_slot'
      );
      slot.setScrollFactor(0);
      slot.setDepth(10);
      slot.setScale(0.5); // Reduced scale from 0.75 to 0.5
      slot.setInteractive(); // Make it interactive
      slot.setName(`inv_slot_${i}`);
      
      // Add click handler
      slot.on('pointerdown', () => {
        this.inventory.setSelectedSlot(i);
      });
      
      this.hotbarUI.add(slot);
    }
    
    // Selected slot indicator
    const selectedSlot = this.add.image(
      this.cameras.main.centerX - 180,
      this.cameras.main.height - 40,
      'selected_slot'
    );
    selectedSlot.setScrollFactor(0);
    selectedSlot.setDepth(11); // Higher depth to be above slots
    selectedSlot.setScale(0.6); // Reduced scale from 0.85 to 0.6
    selectedSlot.setName('selectedSlot');
    this.hotbarUI.add(selectedSlot);
  }
  
  private updateHotbarUI() {
    // Update selected slot position remains unchanged
    const selectedSlot = this.children.getByName('selectedSlot') as Phaser.GameObjects.Image;
    if (selectedSlot) {
      selectedSlot.x = this.cameras.main.centerX - 180 + this.inventory.getSelectedSlot() * 45;
    }
    
    // Update item icons in slots
    const slots = this.inventory.getSlots();
    for (let i = 0; i < Math.min(slots.length, 9); i++) {
      const slotItem = slots[i];
      const slotIcon = this.children.getByName(`inv_slot_icon_${i}`) as Phaser.GameObjects.Image;
      
      if (slotItem && slotItem.itemId) {
        if (!slotIcon) {
          const newIcon = this.add.image(
            this.cameras.main.centerX - 180 + i * 45,
            this.cameras.main.height - 40,
            `item_${slotItem.itemId}`
          );
          newIcon.setScrollFactor(0);
          newIcon.setDepth(12);
          newIcon.setScale(0.4); // Reduced scale from 0.6 to 0.4
          newIcon.setName(`inv_slot_icon_${i}`);
          
          if (slotItem.count > 1) {
            const countText = this.add.text(
              newIcon.x + 10, 
              newIcon.y + 10,
              slotItem.count.toString(),
              { fontSize: '12px', color: '#ffffff' }
            );
            countText.setScrollFactor(0);
            countText.setDepth(13);
            countText.setName(`inv_slot_count_${i}`);
          }
        } else {
          slotIcon.setTexture(`item_${slotItem.itemId}`);
          slotIcon.setVisible(true);
          const countText = this.children.getByName(`inv_slot_count_${i}`) as Phaser.GameObjects.Text;
          if (countText) {
            if (slotItem.count > 1) {
              countText.setText(slotItem.count.toString());
              countText.setVisible(true);
            } else {
              countText.setVisible(false);
            }
          } else if (slotItem.count > 1) {
            this.add.text(
              slotIcon.x + 10, 
              slotIcon.y + 10,
              slotItem.count.toString(),
              { fontSize: '12px', color: '#ffffff' }
            ).setScrollFactor(0).setDepth(13).setName(`inv_slot_count_${i}`);
          }
        }
      } else if (slotIcon) {
        slotIcon.setVisible(false);
        const countText = this.children.getByName(`inv_slot_count_${i}`) as Phaser.GameObjects.Text;
        if (countText) {
          countText.setVisible(false);
        }
      }
    }
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

  private resizeUI() {
    // Update UI positions based on new screen size
    const hotbarBg = this.children.getChildren()
      .filter(obj => obj instanceof Phaser.GameObjects.Rectangle)
      .find((obj) => this.hotbarUI.contains(obj)) as Phaser.GameObjects.Rectangle;
    if (hotbarBg) {
      hotbarBg.x = this.cameras.main.centerX;
      hotbarBg.y = this.cameras.main.height - 40;
    }
    
    // Update slot positions
    for (let i = 0; i < 9; i++) {
      const slot = this.children.getByName(`inv_slot_${i}`) as Phaser.GameObjects.Image;
      const icon = this.children.getByName(`inv_slot_icon_${i}`) as Phaser.GameObjects.Image;
      const countText = this.children.getByName(`inv_slot_count_${i}`) as Phaser.GameObjects.Text;
      
      if (slot) {
        slot.x = this.cameras.main.centerX - 180 + i * 45;
        slot.y = this.cameras.main.height - 40;
      }
      
      if (icon) {
        icon.x = this.cameras.main.centerX - 180 + i * 45;
        icon.y = this.cameras.main.height - 40;
      }
      
      if (countText) {
        countText.x = this.cameras.main.centerX - 170 + i * 45;
        countText.y = this.cameras.main.height - 30;
      }
    }
    
    // Update selected slot position
    const selectedSlot = this.children.getByName('selectedSlot') as Phaser.GameObjects.Image;
    if (selectedSlot) {
      selectedSlot.x = this.cameras.main.centerX - 180 + this.inventory.getSelectedSlot() * 45;
      selectedSlot.y = this.cameras.main.height - 40;
    }
  }
}