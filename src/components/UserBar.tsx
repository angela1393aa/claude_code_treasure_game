import { useState } from 'react';
import { LogOut, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { ScoreHistoryPanel } from './ScoreHistoryPanel';

export function UserBar() {
  const { user, isGuest, logout } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        {isGuest ? (
          <div className="flex items-center gap-2 bg-amber-200/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400">
            <span className="text-sm text-amber-900">🐭 Guest Mole</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-amber-700 hover:text-amber-900 p-1"
              onClick={logout}
            >
              Exit
            </Button>
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 bg-amber-200/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400">
            <span className="text-sm font-medium text-amber-900">⚓ {user.username}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-amber-700 hover:text-amber-900 p-1"
              onClick={() => setHistoryOpen(true)}
              title="My Scores"
            >
              <Trophy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-amber-700 hover:text-amber-900 p-1"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}
      </div>

      {user && (
        <ScoreHistoryPanel open={historyOpen} onOpenChange={setHistoryOpen} />
      )}
    </>
  );
}

export { Badge };
