import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { AuthModal } from './components/AuthModal';
import { UserBar } from './components/UserBar';
import { useAuth } from './context/AuthContext';
import { apiSaveScore } from './lib/api';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyIcon from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'guest' | 'error';

export default function App() {
  const { user, isGuest, loading } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setSaveStatus('idle');
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleGameEnd = async (finalScore: number, result: 'win' | 'loss' | 'tie') => {
    if (user && !isGuest) {
      setSaveStatus('saving');
      try {
        await apiSaveScore(finalScore, result);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
        toast.error('Could not save score — is the server running?');
      }
    } else {
      setSaveStatus('guest');
    }
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const clickedBox = prevBoxes.find(box => box.id === boxId);
      if (clickedBox && !clickedBox.isOpen) {
        new Audio(clickedBox.hasTreasure ? chestOpenSound : evilLaughSound).play();
      }

      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          return { ...box, isOpen: true };
        }
        return box;
      });

      const newScore = updatedBoxes.reduce((acc, box) =>
        box.isOpen ? acc + (box.hasTreasure ? 100 : -50) : acc, 0);
      setScore(newScore);

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
        const result: 'win' | 'loss' | 'tie' = newScore > 0 ? 'win' : newScore === 0 ? 'tie' : 'loss';
        handleGameEnd(newScore, result);
      }

      return updatedBoxes;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-800 text-lg">Loading…</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-700 mb-8">Sign in to save your scores!</p>
        <AuthModal open={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <UserBar />

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400 flex items-center justify-center gap-4">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          {gameEnded && (
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${
              score > 0
                ? 'bg-green-200 text-green-800'
                : score === 0
                ? 'bg-yellow-200 text-yellow-800'
                : 'bg-red-200 text-red-800'
            }`}>
              {score > 0 ? 'Win' : score === 0 ? 'Tie' : 'Loss'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={!box.isOpen ? { cursor: `url(${keyIcon}) 16 16, pointer` } : { cursor: 'default' }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$100' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            <div className="mt-3 text-xs text-amber-600">
              {saveStatus === 'saving' && <span>💾 Saving score…</span>}
              {saveStatus === 'saved' && <span className="text-green-600">✓ Score saved!</span>}
              {saveStatus === 'guest' && <span>🐭 Playing as guest — score not saved</span>}
              {saveStatus === 'error' && <span className="text-red-500">⚠ Score could not be saved</span>}
            </div>
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
