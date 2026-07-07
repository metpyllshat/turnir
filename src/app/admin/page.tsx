"use client";

import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "koryazhma2026"; // поменяй на свой пароль

interface Discipline {
  id: number;
  slug: string;
  name: string;
  emoji: string;
}

interface Player {
  id: number;
  discordId: string;
  name: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState("");

  // Форма результата
  const [discordId, setDiscordId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [disciplineSlug, setDisciplineSlug] = useState("");
  const [place, setPlace] = useState("");
  const [participantsCount, setParticipantsCount] = useState("");

  useEffect(() => {
      if (!authed) return;
    
      fetch("/api/disciplines")
        .then((r) => r.json())
        .then((d) => {
          if (d.disciplines) setDisciplines(d.disciplines);
          else console.error("disciplines error:", d);
        })
        .catch((e) => console.error("fetch disciplines failed:", e));
    
      fetch("/api/admin/players")
        .then((r) => r.json())
        .then((d) => {
          if (d.players) setPlayers(d.players);
          else console.error("players error:", d);
        })
        .catch((e) => console.error("fetch players failed:", e));
    }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="bg-smoke/30 border border-toxic/20 rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-toxic text-2xl font-bold text-center mb-6">
            ☢️ БУНКЕР АДМИНИСТРАТОРА
          </h1>
          <input
            type="password"
            placeholder="Пароль..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && password === ADMIN_PASSWORD)
                setAuthed(true);
            }}
            className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone mb-4 focus:border-toxic outline-none"
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASSWORD) setAuthed(true);
              else setStatus("❌ Неверный пароль");
            }}
            className="w-full bg-toxic/20 border border-toxic text-toxic font-bold py-2 rounded hover:bg-toxic/30 transition-all"
          >
            ВОЙТИ В БУНКЕР
          </button>
          {status && (
            <p className="text-blood text-sm text-center mt-3">{status}</p>
          )}
        </div>
      </div>
    );
  }

  async function submitResult(e: React.FormEvent) {
    e.preventDefault();
    setStatus("⏳ Отправка...");

    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: "koryazhma-secret-2026",
        discord_id: discordId,
        player_name: playerName,
        discipline_slug: disciplineSlug,
        place: parseInt(place)
      }),
    });

    const data = await res.json();
    if (data.ok) {
      setStatus(`✅ Готово! ${playerName} — ${place} место (+${data.score} очков)`);
      setDiscordId("");
      setPlayerName("");
      setPlace("");
      setParticipantsCount("");
      // Обновить список игроков
      fetch("/api/admin/players")
        .then((r) => r.json())
        .then((d) => { if (d.players) setPlayers(d.players); });
    } else {
      setStatus(`❌ Ошибка: ${data.error}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-toxic text-3xl font-bold mb-2">
          ☢️ БУНКЕР АДМИНИСТРАТОРА
        </h1>
        <p className="text-bone/30 text-sm mb-8">
          Только для своих. Не делись ссылкой.
        </p>

        {/* Форма добавления результата */}
        <div className="bg-smoke/30 border border-toxic/20 rounded-xl p-6 mb-6">
          <h2 className="text-toxic font-bold text-xl mb-4">
            📊 Добавить результат
          </h2>

          <form onSubmit={submitResult} className="space-y-4">
            {/* Выбор игрока */}
            <div>
              <label className="text-bone/60 text-xs mb-1 block">
                ИГРОК (выбери существующего или введи нового)
              </label>
              <select
                className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone mb-2 focus:border-toxic outline-none"
                onChange={(e) => {
                  const p = players.find(
                    (x) => x.id === parseInt(e.target.value)
                  );
                  if (p) {
                    setDiscordId(p.discordId);
                    setPlayerName(p.name);
                  }
                }}
              >
                <option value="">— Выбрать существующего игрока —</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Или введи Discord ID (любое уникальное число)"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone mb-2 focus:border-toxic outline-none text-sm"
                required
              />
              <input
                type="text"
                placeholder="Имя игрока"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone focus:border-toxic outline-none text-sm"
                required
              />
            </div>

            {/* Дисциплина */}
            <div>
              <label className="text-bone/60 text-xs mb-1 block">
                ДИСЦИПЛИНА
              </label>
              <select
                value={disciplineSlug}
                onChange={(e) => setDisciplineSlug(e.target.value)}
                className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone focus:border-toxic outline-none"
                required
              >
                <option value="">— Выбрать дисциплину —</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.emoji} {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Место и участники */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-bone/60 text-xs mb-1 block">
                  ЗАНЯТОЕ МЕСТО
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full bg-black/50 border border-bone/20 rounded px-4 py-2 text-bone focus:border-toxic outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-toxic/20 border-2 border-toxic text-toxic font-bold py-3 rounded hover:bg-toxic/30 transition-all text-lg"
            >
              ✅ ЗАПИСАТЬ РЕЗУЛЬТАТ
            </button>
          </form>

          {status && (
            <div
              className={`mt-4 p-3 rounded border text-sm font-bold ${
                status.startsWith("✅")
                  ? "bg-toxic/10 border-toxic/30 text-toxic"
                  : status.startsWith("❌")
                    ? "bg-blood/10 border-blood/30 text-blood"
                    : "bg-bone/10 border-bone/20 text-bone"
              }`}
            >
              {status}
            </div>
          )}
        </div>

        {/* Список игроков */}
        <div className="bg-smoke/30 border border-bone/10 rounded-xl p-6">
          <h2 className="text-bone font-bold text-lg mb-4">
            👥 Зарегистрированные мутанты ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-bone/30 text-sm">Пока никого нет</p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-black/30 rounded px-4 py-2"
                >
                  <span className="text-bone font-semibold">{p.name}</span>
                  <span className="text-bone/30 text-xs">ID: {p.discordId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}