"use client";

import { useEffect, useState, useCallback } from "react";

interface OverallEntry {
  playerId: number;
  playerName: string;
  playerAvatar: string | null;
  discordId: string;
  totalScore: number;
  gamesPlayed: number;
}

interface Discipline {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  isActive: boolean;
  scheduledAt: string | null;
}

interface DisciplineEntry {
  playerId: number;
  playerName: string;
  playerAvatar: string | null;
  place: number;
  score: number;
}

interface LeaderboardData {
  overall: OverallEntry[];
  disciplines: Discipline[];
  disciplineLeaderboards: Record<string, DisciplineEntry[]>;
  lastUpdate: string | null;
}

function getMedalEmoji(place: number): string {
  if (place === 1) return "☢️";
  if (place === 2) return "⚠️";
  if (place === 3) return "🦴";
  return "";
}

function getMedalClass(place: number): string {
  if (place === 1) return "text-gold-medal";
  if (place === 2) return "text-silver-medal";
  if (place === 3) return "text-bronze-medal";
  return "text-bone";
}

function getRowBg(place: number): string {
  if (place === 1)
    return "bg-gradient-to-r from-yellow-900/30 to-transparent border-l-2 border-gold-medal";
  if (place === 2)
    return "bg-gradient-to-r from-gray-600/20 to-transparent border-l-2 border-silver-medal";
  if (place === 3)
    return "bg-gradient-to-r from-orange-900/20 to-transparent border-l-2 border-bronze-medal";
  return "border-l-2 border-transparent";
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overall");
  const [isConnected, setIsConnected] = useState(false);
  const [updateFlash, setUpdateFlash] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      if (!json.error) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SSE for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      eventSource = new EventSource("/api/updates");

      eventSource.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "connected") {
            setIsConnected(true);
          } else if (msg.type === "update") {
            // Flash effect and refetch
            setUpdateFlash(true);
            setTimeout(() => setUpdateFlash(false), 1000);
            fetchData();
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        // Retry after 5s
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(retryTimeout);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-toxic toxic-glow text-2xl font-bold flickering">
          ☢️ ЗАГРУЗКА ДАННЫХ ИЗ ЗОНЫ... ☢️
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-blood text-xl font-bold">
          ⚠️ ОШИБКА СВЯЗИ С БУНКЕРОМ ⚠️
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overall", label: "☢️ ОБЩИЙ ЗАЧЁТ", isOverall: true },
    ...data.disciplines.map((d) => ({
      id: d.slug,
      label: `${d.emoji} ${d.name}`,
      isOverall: false,
    })),
  ];

  return (
    <div
      className={`transition-all duration-500 ${updateFlash ? "ring-2 ring-toxic rounded-xl" : ""}`}
    >
      {/* Connection status */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? "bg-toxic animate-pulse" : "bg-blood"
            }`}
          />
          <span className={isConnected ? "text-toxic" : "text-blood"}>
            {isConnected ? "КАНАЛ СВЯЗИ АКТИВЕН" : "НЕТ СВЯЗИ С БУНКЕРОМ"}
          </span>
        </div>
        {data.lastUpdate && (
          <span className="text-bone/50">
            Последнее обновление:{" "}
            {new Date(data.lastUpdate).toLocaleString("ru-RU")}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-toxic/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-bold rounded transition-all glitch-hover whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-toxic/20 text-toxic border border-toxic radiation-border"
                : "bg-smoke/50 text-bone/70 border border-bone/10 hover:border-toxic/30 hover:text-toxic/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overall" ? (
        <OverallTable entries={data.overall} disciplines={data.disciplines} results={data} />
      ) : (
        <DisciplineTable
          discipline={data.disciplines.find((d) => d.slug === activeTab)!}
          entries={data.disciplineLeaderboards[activeTab] || []}
        />
      )}
    </div>
  );
}

function OverallTable({
  entries,
  disciplines,
  results,
}: {
  entries: OverallEntry[];
  disciplines: Discipline[];
  results: LeaderboardData;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">☢️</div>
        <p className="text-bone/50 text-lg">
          МУТАНТЫ ЕЩЁ НЕ ВЫШЛИ НА АРЕНУ
        </p>
        <p className="text-bone/30 text-sm mt-2">
          Результаты появятся после первых игр
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      {entries.length >= 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {entries.slice(0, 3).map((entry, idx) => {
            const place = idx + 1;
            const podiumColors = [
              "from-yellow-600/20 to-yellow-900/10 border-gold-medal",
              "from-gray-500/20 to-gray-700/10 border-silver-medal",
              "from-orange-600/20 to-orange-900/10 border-bronze-medal",
            ];
            const sizes = ["text-5xl", "text-4xl", "text-3xl"];
            const medals = ["☢️", "⚠️", "🦴"];
            return (
              <div
                key={entry.playerId}
                className={`slide-up bg-gradient-to-b ${podiumColors[idx]} border rounded-lg p-6 text-center radiation-border`}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className={`${sizes[idx]} mb-2`}>{medals[idx]}</div>
                <div className="text-lg font-bold text-bone mb-1">
                  {entry.playerName}
                </div>
                <div className="text-3xl font-extrabold text-toxic toxic-glow">
                  {entry.totalScore}
                </div>
                <div className="text-xs text-bone/40 mt-2">
                  Игр сыграно: {entry.gamesPlayed} /{" "}
                  {disciplines.length}
                </div>
                <div className="text-xs text-bone/30 mt-1">
                  {place === 1 && "🏆 300 КОРЯЖМА КОИНОВ"}
                  {place === 2 && "🥈 200 КОРЯЖМА КОИНОВ"}
                  {place === 3 && "🥉 100 КОРЯЖМА КОИНОВ"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-toxic/30">
              <th className="text-left py-3 px-4 text-toxic font-bold text-xs">
                #
              </th>
              <th className="text-left py-3 px-4 text-toxic font-bold text-xs">
                МУТАНТ
              </th>
              <th className="text-center py-3 px-4 text-toxic font-bold text-xs">
                ОЧКИ
              </th>
              <th className="text-center py-3 px-4 text-toxic font-bold text-xs">
                ДИСЦИПЛИНЫ
              </th>
              {disciplines.map((d) => (
                <th
                  key={d.id}
                  className="text-center py-3 px-2 text-toxic/60 font-bold text-xs"
                  title={d.name}
                >
                  {d.emoji}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const place = idx + 1;
              return (
                <tr
                  key={entry.playerId}
                  className={`${getRowBg(place)} hover:bg-toxic/5 transition-colors border-b border-bone/5`}
                >
                  <td className={`py-3 px-4 font-bold ${getMedalClass(place)}`}>
                    {getMedalEmoji(place)} {place}
                  </td>
                  <td className="py-3 px-4 font-semibold text-bone">
                    {entry.playerName}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-toxic text-lg">
                    {entry.totalScore}
                  </td>
                  <td className="py-3 px-4 text-center text-bone/50">
                    {entry.gamesPlayed}
                  </td>
                  {disciplines.map((d) => {
                    const r = results.disciplineLeaderboards[d.slug]?.find(
                      (x) => x.playerId === entry.playerId
                    );
                    return (
                      <td
                        key={d.id}
                        className="py-3 px-2 text-center text-xs"
                      >
                        {r ? (
                          <span
                            className={
                              r.place === 1
                                ? "text-gold-medal font-bold"
                                : r.place === 2
                                  ? "text-silver-medal"
                                  : r.place === 3
                                    ? "text-bronze-medal"
                                    : "text-bone/40"
                            }
                          >
                            {r.place === 1 ? "👑" : `#${r.place}`}
                          </span>
                        ) : (
                          <span className="text-bone/10">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisciplineTable({
  discipline,
  entries,
}: {
  discipline: Discipline;
  entries: DisciplineEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">{discipline.emoji}</div>
        <p className="text-bone/50 text-lg">{discipline.name}</p>

        {/* ДОБАВЬ ВОТ ЭТО */}
        {!discipline.isActive && discipline.scheduledAt ? (
          <div className="mt-4 inline-block bg-blood/10 border border-blood/30 rounded-lg px-6 py-3">
            <p className="text-blood font-bold text-sm">⏳ ДАТА ПРОВЕДЕНИЯ</p>
            <p className="text-bone/70 text-lg font-bold mt-1">
              {new Date(discipline.scheduledAt).toLocaleString("ru-RU", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ) : (
          <p className="text-bone/30 text-sm mt-2">
            АРЕНА ПУСТА. МУТАНТЫ НЕ ЯВИЛИСЬ.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{discipline.emoji}</div>
        <h3 className="text-xl font-bold text-toxic toxic-glow">
          {discipline.name}
        </h3>
        <p className="text-bone/30 text-xs mt-1">
          ТОП-1 получает банку Добрый Кола 🥤
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-toxic/30">
              <th className="text-left py-3 px-4 text-toxic font-bold text-xs">
                МЕСТО
              </th>
              <th className="text-left py-3 px-4 text-toxic font-bold text-xs">
                МУТАНТ
              </th>
              <th className="text-center py-3 px-4 text-toxic font-bold text-xs">
                ОЧКИ
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.playerId}
                className={`${getRowBg(entry.place)} hover:bg-toxic/5 transition-colors border-b border-bone/5`}
              >
                <td
                  className={`py-3 px-4 font-bold ${getMedalClass(entry.place)}`}
                >
                  {entry.place === 1 ? "👑" : getMedalEmoji(entry.place)}{" "}
                  {entry.place}
                </td>
                <td className="py-3 px-4">
                  <a
                    href={`/player/${entry.playerId}`}
                    className="font-semibold text-bone hover:text-toxic transition-colors hover:underline"
                  >
                    {entry.playerName}
                  </a>
                </td>
                <td className="py-3 px-4 text-center font-bold text-toxic">
                  +{entry.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
