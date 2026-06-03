import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { apiGetLeaderboard, apiGetScores, LeaderboardEntry, ScoreEntry } from '../lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function resultBadge(result: string) {
  if (result === 'win') return <Badge className="bg-green-500 hover:bg-green-500">Win</Badge>;
  if (result === 'loss') return <Badge variant="destructive">Loss</Badge>;
  return <Badge variant="secondary">Tie</Badge>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function ScoreHistoryPanel({ open, onOpenChange }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([apiGetScores(), apiGetLeaderboard()])
      .then(([s, l]) => { setScores(s); setLeaderboard(l); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-amber-900">🏆 Scores</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">My Games</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : scores.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No games yet. Play one!</p>
            ) : (
              <ScrollArea className="h-[300px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium text-right">Score</th>
                      <th className="pb-2 font-medium text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2 text-muted-foreground">{formatDate(s.played_at)}</td>
                        <td className={`py-2 text-right font-medium ${s.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${s.score}
                        </td>
                        <td className="py-2 text-right">{resultBadge(s.result)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No scores yet!</p>
            ) : (
              <ScrollArea className="h-[300px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Player</th>
                      <th className="pb-2 font-medium text-right">Best Score</th>
                      <th className="pb-2 font-medium text-right">Games</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={entry.username} className="border-b last:border-0">
                        <td className="py-2 text-muted-foreground">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </td>
                        <td className="py-2 font-medium">{entry.username}</td>
                        <td className={`py-2 text-right font-medium ${entry.best_score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${entry.best_score}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{entry.games_played}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
