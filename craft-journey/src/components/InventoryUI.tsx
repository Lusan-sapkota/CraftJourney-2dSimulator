import React from 'react';
import { IonGrid, IonRow, IonCol, IonButton, IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import './InventoryUI.css';

interface InventoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface InventoryUIProps {
  items: InventoryItem[];
  selectedSlot: number;
  onSelectSlot: (index: number) => void;
  onClose: () => void;
  onCraft: (itemId: string) => void;
  recipes: Array<{
    result: string;
    resultName: string;
    count: number;
    ingredients: Array<{name: string, count: number}>;
    canCraft: boolean;
  }>;
}

const InventoryUI: React.FC<InventoryUIProps> = ({ 
  items, 
  selectedSlot,
  onSelectSlot,
  onClose,
  onCraft,
  recipes
}) => {
  return (
    <div className="inventory-ui">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <IonButton fill="clear" onClick={onClose}>
          <IonIcon icon={close} />
        </IonButton>
      </div>
      
      <div className="inventory-content">
        <div className="inventory-slots">
          <IonGrid>
            <IonRow>
              {items.map((item, index) => (
                <IonCol size="2" key={index}>
                  <div 
                    className={`inventory-slot ${selectedSlot === index ? 'selected' : ''}`}
                    onClick={() => onSelectSlot(index)}
                  >
                    {item ? (
                      <>
                        <img src={item.icon} alt={item.name} />
                        <span className="item-count">{item.count}</span>
                      </>
                    ) : null}
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
        
        <div className="crafting-section">
          <h3>Crafting</h3>
          <div className="recipe-list">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-item">
                <div className="recipe-result">
                  <h4>{recipe.resultName} x{recipe.count}</h4>
                </div>
                <div className="recipe-ingredients">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i}>{ing.name} x{ing.count}</span>
                  ))}
                </div>
                <IonButton 
                  expand="block" 
                  disabled={!recipe.canCraft}
                  onClick={() => onCraft(recipe.result)}
                >
                  Craft
                </IonButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryUI;