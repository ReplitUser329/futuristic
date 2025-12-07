'use client';

import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Search, Trophy, Zap, CalendarDays, Newspaper, Flame 
} from 'lucide-react';

const fetcher = url => axios.get(url).then(res => res.data);

export default function Home() {
  const [query, setQuery] = useState('');
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: games } = useSWR(`https://www.balldontlie.io/api/v1/games?dates[]=${today}`, fetcher, { refreshInterval: 10000 });
  const { data: leaders } = {} } = useSWR('https://www.balldontlie.io/api/v1/stats?season=2024&per_page=15&sort=-pts', fetcher, { refreshInterval: 60000 });
  const { data: news } = useSWR('https://api.rss2json.com/v1/api.json?rss_url=https://www.espn.com/espn/rss/nba/news', fetcher, { refreshInterval: 300000 });

  const searchPlayer = async () => {
    if (!query.trim()) return;
    setError('');
    try {
      const res = await axios.get(`https://www.balldontlie.io/api/v1/players?search=${encodeURIComponent(query)}&per_page=1`);
      const p = res.data.data[0];
      if (!p) return setError('No player found – try full name');
      const statsRes = await axios.get(`https://www.balldontlie.io/api/v1/season_averages?season=2024&player_ids[]=${p.id}`);
      setPlayer({ ...p, stats: statsRes.data.data[0] || {} });
    } catch (e) {
      setError('Search failed – try again');
    }
  };

  return (
    <>
      <div className="min-h-screen relative">
        {/* HERO */}
        <motion.header className="glass border-b border-white/10 py-12 text-center">
          <motion.h1 
            initial={{ y: -100 }} 
            animate={{ y: 0 }}
            className="text-7xl md:text-9xl font-black bg-gradient-to-r from-neon via-purple to-pink bg-clip-text text-transparent"
          >
            NBA 2025
          </motion.h1>
          <p className="mt-4 text-2xl text-cyan-300">Live • Raw • Futuristic</p>
        </motion.header>

        {/* SEARCH */}
        <section className="max-w-5xl mx-auto px-6 my-12">
          <motion.div className="glass p-10 rounded-3xl shadow-2xl shadow-neon/20">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <input
                type="text"
                placeholder="LeBron James, Victor Wembanyama, Curry..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPlayer()}
                className="flex-1 w-full px-8 py-6 bg-black/40 border border-neon/40 rounded-2xl text-xl focus:outline-none focus:border-neon transition"
              />
              <button onClick={searchPlayer} className="px-12 py-6 bg-gradient-to-r from-neon to-purple rounded-2xl font-bold text-xl hover:scale-105 transition">
                <Search className="inline mr-2" /> SEARCH
              </button>
            </div>

            <AnimatePresence>
              {player && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-10"
                >
                  {[
                    { l: "PPG", v: player.stats?.pts ?? "—", c: "text-orange-400" },
                    { l: "RPG", v: player.stats?.reb ?? "—", c: "text-green-400" },
                    { l: "APG", v: player.stats?.ast ?? "—", c: "text-blue-400" },
                    { l: "FG%", v: player.stats?.fg_pct ? `${(player.stats.fg_pct*100).toFixed(1)}%` : "—", c: "text-pink-400" },
                    { l: "TEAM", v: player.team?.full_name || "—", c: "text-purple-400" },
                  ].map((s, i) => (
                    <div key={i} className="glass p-6 text-center rounded-2xl">
                      <p className="text-gray-400 text-sm">{s.l}</p>
                      <p className={`text-4xl font-black ${s.c}`}>{s.v}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 pb-20">
          {/* GAMES */}
          <motion.div className="glass p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 text-neon">
              <CalendarDays /> Today’s Games
            </h2>
            {games?.data?.length ? games.data.map(g => (
              <div key={g.id} className="my-6 pb-6 border-b border-white/10 last:border-0">
                <div className="flex justify-between text-lg">
                  <div className="text-right">
                    <p>{g.home_team.full_name}</p>
                    <p className="text-3xl font-bold text-neon">{g.home_team_score || '-'}</p>
                  </div>
                  <span className="mx-6 self-center text-gray-500">vs</span>
                  <div>
                    <p>{g.visitor_team.full_name}</p>
                    <p className="text-3xl font-bold text-neon">{g.visitor_team_score || '-'}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">{g.status}</p>
              </div>
            )) : <p className="text-center text-gray-400 mt-8">No games scheduled today</p>}
          </motion.div>

          {/* LEADERS */}
          <motion.div className="glass p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-yellow-400">
              <Trophy /> Scoring Leaders
            </h2>
            {leaders.data?.slice(0,10).map((s, i) => (
              <div key={i} className="flex justify-between py-3">
                <span>{i+1}. {s.player.first_name} {s.player.last_name}</span>
                <span className="font-bold text-2xl text-neon">{s.pts} PPG</span>
              </div>
            ))}
          </motion.div>

          {/* NEWS */}
          <motion.div className="glass p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-pink-400">
              <Newspaper /> Latest News
            </h2>
            {news?.items?.slice(0,7).map((item, i) => (
              <a key={i} href={item.link} target="_blank" className="block py-4 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg transition">
                <p className="font-medium text-neon">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(item.pubDate), 'MMM d, h:mm a')}</p>
              </a>
            ))}
          </motion.div>
        </section>
      </div>
    </>
  );
}
