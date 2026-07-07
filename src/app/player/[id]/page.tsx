"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PlayerResult {
  place: number;
  score: number;
  createdAt: string;
  disciplineName: string;
  disciplineEmoji: string;
  disciplineSlug: string;
}

interface PlayerData {
  player: {
    id: number;
    name: string;
    avatarUrl: string | null;
    discordId: string;
    createdAt: string;
  };
  results: PlayerResult[];
  totalScore: number;
  rank: number;
  totalPlayers: number;
}

function getMedalEmoji(place: number) {
  if (place === 1) return "👑";
  if (place === 2) return "⚠️";
  if (place === 3) return "🦴";
  return `#${place}`;
}

function getMedalClass(place: number) {
  if (place === 1) return "text-yellow-400";
  if (place === 2) return "text-gray-300";
  if (place === 3) return "text-orange-400";
  return "text-bone/60";
}

function getRankLabel(rank: number) {
  if (rank === 1) return { label: "ЧЕМПИОН ЗОНЫ", color: "text-yellow-400" };
  if (rank === 2) return { label: "ЭЛИТА", color: "text-gray-300" };
  if (rank === 3) return { label: "ВЫЖИВШИЙ", color: "text-orange-400" };
  return { label: "МУТАНТ", color: "text-toxic" };
}

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/player/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Ошибка соединения"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-toxic text-xl font-bold flickering">
          ☢️ ЗАГРУЗКА ДОСЬЕ...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <div className="text-blood text-xl font-bold">⚠️ МУТАНТ НЕ НАЙДЕН</div>
        <Link href="/" className="text-toxic text-sm hover:underline">
          ← Вернуться на базу
        </Link>
      </div>
    );
  }

  const { player, results, totalScore, rank, totalPlayers } = data;
  const rankInfo = getRankLabel(rank);

  const bestResult = results.reduce(
    (best, r) => (r.place < best.place ? r : best),
    results[0] || { place: 999, disciplineName: "—", disciplineEmoji: "" }
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">

        {/* Назад */}
        <Link
          href="/"
          className="text-toxic/60 text-sm hover:text-toxic transition-colors mb-6 inline-block"
        >
          ← Вернуться на базу
        </Link>

        {/* Карточка игрока */}
        <div className="bg-smoke/30 border border-toxic/20 rounded-xl p-6 mb-6 relative overflow-hidden">
          {/* Фоновый декор */}
          <div className="absolute top-0 right-0 text-[120px] opacity-5 select-none leading-none">
            ☢️
          </div>

          <div className="flex items-start gap-4 relative z-10">
            {/* Аватар */}
            <div className="w-16 h-16 rounded-full bg-toxic/20 border-2 border-toxic/40 flex items-center justify-center text-2xl font-bold text-toxic shrink-0">
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                player.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Инфо */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-bone">
                {player.name}
              </h1>
              <span className={`text-sm font-bold ${rankInfo.color}`}>
                {rankInfo.label}
              </span>
              <p className="text-bone/30 text-xs mt-1">
                В зоне с{" "}
                {new Date(player.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Статы */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-toxic">
                {totalScore}
              </div>
              <div className="text-xs text-bone/40 mt-1">ОЧКОВ</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-bone">
                #{rank}
              </div>
              <div className="text-xs text-bone/40 mt-1">
                МЕСТО ИЗ {totalPlayers}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-bone">
                {results.length}
              </div>
              <div className="text-xs text-bone/40 mt-1">ИГР СЫГРАНО</div>
            </div>
          </div>

          {/* Лучший результат */}
          {results.length > 0 && (
            <div className="mt-4 bg-yellow-900/10 border border-yellow-400/20 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">{bestResult.disciplineEmoji}</span>
              <div>
                <p className="text-yellow-400/60 text-xs">ЛУЧШИЙ РЕЗУЛЬТАТ</p>
                <p className="text-bone font-bold text-sm">
                  {getMedalEmoji(bestResult.place)} {bestResult.place} место —{" "}
                  {bestResult.disciplineName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Результаты по дисциплинам */}
        <div className="bg-smoke/30 border border-bone/10 rounded-xl p-6">
          <h2 className="text-toxic font-bold text-lg mb-4">
            📊 Результаты по дисциплинам
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-bone/40">Мутант ещё не вышел на арену</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results
                .slice()
                .sort((a, b) => a.place - b.place)
                .map((r) => (
                  <div
                    key={r.disciplineSlug}
                    className="flex items-center gap-4 bg-black/30 rounded-lg px-4 py-3"
                  >
                    <span className="text-xl">{r.disciplineEmoji}</span>
                    <span className="text-bone font-semibold flex-1 text-sm">
                      {r.disciplineName}
                    </span>
                    <span className={`font-bold text-lg ${getMedalClass(r.place)}`}>
                      {getMedalEmoji(r.place)}
                    </span>
                    <span className="text-toxic font-bold text-sm w-16 text-right">
                      +{r.score} очк.
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}