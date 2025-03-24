import { Item, Recipe, ItemSystem } from './ItemSystem';

export interface InventorySlot {
  itemId: string;
  count: number;
}

export class InventorySystem {
  private slots: Array<InventorySlot | null>;
  private maxSlots: number;
  private itemSystem: ItemSystem;
  private selectedSlot: number = 0;
  
  constructor(itemSystem: ItemSystem, maxSlots: number = 20) {
    this.itemSystem = itemSystem;
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
  }
  
  addItem(itemId: string, count: number = 1): boolean {
    const item = this.itemSystem.getItem(itemId);
    if (!item) return false;
    
    if (item.stackable) {
      // Find existing stacks that aren't full
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot && slot.itemId === itemId && slot.count < item.maxStack) {
          const canAdd = Math.min(count, item.maxStack - slot.count);
          slot.count += canAdd;
          count -= canAdd;
          if (count === 0) return true;
        }
      }
    }
    
    // Find empty slots for remaining items
    while (count > 0) {
      const emptySlot = this.slots.findIndex(slot => slot === null);
      if (emptySlot === -1) return false; // Inventory full
      
      const stackSize = Math.min(count, item.stackable ? item.maxStack : 1);
      this.slots[emptySlot] = { itemId, count: stackSize };
      count -= stackSize;
    }
    
    return true;
  }
  
  removeItem(itemId: string, count: number = 1): boolean {
    let remainingToRemove = count;
    
    // Start removing from the end (less important slots first)
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        if (slot.count > remainingToRemove) {
          slot.count -= remainingToRemove;
          return true;
        } else {
          remainingToRemove -= slot.count;
          this.slots[i] = null;
        }
        
        if (remainingToRemove === 0) return true;
      }
    }
    
    return remainingToRemove === 0;
  }
  
  getItemCount(itemId: string): number {
    return this.slots.reduce((count, slot) => {
      if (slot && slot.itemId === itemId) {
        return count + slot.count;
      }
      return count;
    }, 0);
  }
  
  getSlots(): Array<InventorySlot | null> {
    return this.slots;
  }
  
  craft(recipe: Recipe): boolean {
    // Make sure we have all ingredients
    if (!this.itemSystem.canCraft(recipe, this.getItemCounts())) {
      return false;
    }
    
    // Remove ingredients
    for (const ingredient of recipe.ingredients) {
      this.removeItem(ingredient.itemId, ingredient.count);
    }
    
    // Add result
    this.addItem(recipe.result, recipe.count);
    return true;
  }
  
  getItemCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const slot of this.slots) {
      if (slot) {
        counts[slot.itemId] = (counts[slot.itemId] || 0) + slot.count;
      }
    }
    return counts;
  }
  
  setSelectedSlot(index: number) {
    if (index >= 0 && index < this.maxSlots) {
      this.selectedSlot = index;
    }
  }
  
  getSelectedSlot(): number {
    return this.selectedSlot;
  }
  
  getSelectedItem(): InventorySlot | null {
    return this.slots[this.selectedSlot];
  }
}