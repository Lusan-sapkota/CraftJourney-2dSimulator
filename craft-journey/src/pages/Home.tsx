import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonActionSheet
} from '@ionic/react';
import { menu, pause } from 'ionicons/icons';
import Game from '../components/Game';
import './Home.css';

const Home: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Craft Journey</IonTitle>
          {gameStarted && (
            <IonButton slot="end" fill="clear" onClick={() => setShowMenu(true)}>
              <IonIcon icon={pause} />
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="game-content" fullscreen>
        {!gameStarted ? (
          <div className="start-screen">
            <h1>Craft Journey</h1>
            <p>A 2D open-world simulator game</p>
            <IonButton 
              expand="block" 
              className="start-button"
              onClick={() => setGameStarted(true)}
            >
              Start Game
            </IonButton>
          </div>
        ) : (
          <Game onGameReady={() => console.log('Game ready')} />
        )}

        <IonActionSheet
          isOpen={showMenu}
          onDidDismiss={() => setShowMenu(false)}
          header="Game Menu"
          buttons={[
            {
              text: 'Resume',
              role: 'cancel',
            },
            {
              text: 'Save Game',
              handler: () => {
                console.log('Save game');
              },
            },
            {
              text: 'Settings',
              handler: () => {
                console.log('Settings');
              },
            },
            {
              text: 'Exit to Main Menu',
              role: 'destructive',
              handler: () => {
                setGameStarted(false);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
