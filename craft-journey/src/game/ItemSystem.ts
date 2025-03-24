export interface Item {
  id: string;
  name: string;
  description: string;
  stackable: boolean;
  maxStack: number;
  texture: string;
  type: 'resource' | 'tool' | 'building' | 'consumable';
}

export interface Recipe {
  result: string;
  count: number;
  ingredients: Array<{itemId: string, count: number}>;
}

export class ItemSystem {
  private items: Map<string, Item> = new Map();
  private recipes: Recipe[] = [];
  
  constructor() {
    this.registerItems();
    this.registerRecipes();
  }
  
  private registerItems() {
    // Resources
    this.registerItem({
      id: 'wood',
      name: 'Wood',
      description: 'Raw wood from trees',
      stackable: true,
      maxStack: 99,
      texture: 'item_wood',
      type: 'resource'
    });
    
    this.registerItem({
      id: 'stone',
      name: 'Stone',
      description: 'Raw stone material',
      stackable: true,
      maxStack: 99,
      texture: 'item_stone',
      type: 'resource'
    });
    
    // Tools
    this.registerItem({
      id: 'axe',
      name: 'Wooden Axe',
      description: 'Useful for chopping trees',
      stackable: false,
      maxStack: 1,
      texture: 'item_axe',
      type: 'tool'
    });
    
    this.registerItem({
      id: 'pickaxe',
      name: 'Stone Pickaxe',
      description: 'Mine stone faster',
      stackable: false,
      maxStack: 1,
      texture: 'item_pickaxe',
      type: 'tool'
    });
    
    // Buildings
    this.registerItem({
      id: 'wooden_wall',
      name: 'Wooden Wall',
      description: 'A simple wooden wall',
      stackable: true,
      maxStack: 99,
      texture: 'building_wooden_wall',
      type: 'building'
    });
    
    this.registerItem({
      id: 'crafting_table',
      name: 'Crafting Table',
      description: 'Used for advanced crafting',
      stackable: true,
      maxStack: 5,
      texture: 'building_crafting_table',
      type: 'building'
    });
  }
  
  private registerRecipes() {
    // Tool recipes
    this.recipes.push({
      result: 'axe',
      count: 1,
      ingredients: [
        { itemId: 'wood', count: 3 }
      ]
    });
    
    this.recipes.push({
      result: 'pickaxe',
      count: 1,
      ingredients: [
        { itemId: 'wood', count: 2 },
        { itemId: 'stone', count: 3 }
      ]
    });
    
    // Building recipes
    this.recipes.push({
      result: 'wooden_wall',
      count: 4,
      ingredients: [
        { itemId: 'wood', count: 6 }
      ]
    });
    
    this.recipes.push({
      result: 'crafting_table',
      count: 1,
      ingredients: [
        { itemId: 'wood', count: 10 }
      ]
    });
  }
  
  registerItem(item: Item) {
    this.items.set(item.id, item);
  }
  
  getItem(id: string): Item | undefined {
    return this.items.get(id);
  }
  
  getRecipes(): Recipe[] {
    return this.recipes;
  }
  
  getRecipesByResult(itemId: string): Recipe[] {
    return this.recipes.filter(recipe => recipe.result === itemId);
  }
  
  canCraft(recipe: Recipe, inventory: Record<string, number>): boolean {
    for (const ingredient of recipe.ingredients) {
      const available = inventory[ingredient.itemId] || 0;
      if (available < ingredient.count) {
        return false;
      }
    }
    return true;
  }
}