"use client";

import { useEffect, useState } from "react";
import Leaderboard from "./components/Leaderboard";
import DisciplineModal from "./components/DisciplineModal";
import Image from "next/image";

interface Discipline {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  isActive: boolean;
  scheduledAt: string | null;
  description: string | null;
  rules: string | null;
  downloadUrl: string | null;
  isOver: boolean;
  completedAt: string | null;
}

export default function Home() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);

  useEffect(() => {
    fetch("/api/disciplines")
      .then((r) => r.json())
      .then((d) => setDisciplines(d.disciplines || []));
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Модалка */}
      <DisciplineModal
        discipline={selectedDiscipline}
        onClose={() => setSelectedDiscipline(null)}
      />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Koryazhma wasteland"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-toxic/5 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto drop-shadow-[0_0_30px_rgba(57,255,20,0.5)]"
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-toxic toxic-glow mb-4 tracking-tight">
            КОРЯЖЕМСКИЕ
            <br />
            <span className="text-bone">ОЛИМПИЙСКИЕ ИГРЫ</span>
          </h1>

          <div className="inline-block bg-blood/20 border border-blood/50 rounded px-4 py-2 mb-6">
            <span className="text-blood font-bold text-lg md:text-xl flickering">
              ☢️ ЗОНА ОТЧУЖДЕНИЯ • 16.07.2026 ☢️
            </span>
          </div>

          <p className="text-bone/60 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Токсичные отходы комбината превращают людей в мутантов.
            <br />
            На улицах аномалии и зомби. Выживают только сильнейшие.
            <br />
            <span className="text-toxic font-bold">
              Хватит кататься на казуальных членах. Покажи на что ты способен.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-smoke/80 border border-toxic/20 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gold-medal">300</div>
              <div className="text-xs text-bone/40">КОРЯЖМА КОИНОВ</div>
              <div className="text-xs text-bone/20">1-е место</div>
            </div>
            <div className="bg-smoke/80 border border-bone/10 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-silver-medal">200</div>
              <div className="text-xs text-bone/40">КОРЯЖМА КОИНОВ</div>
              <div className="text-xs text-bone/20">2-е место</div>
            </div>
            <div className="bg-smoke/80 border border-bronze-medal/20 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-bronze-medal">100</div>
              <div className="text-xs text-bone/40">КОРЯЖМА КОИНОВ</div>
              <div className="text-xs text-bone/20">3-е место</div>
            </div>
          </div>

          <a
            href="#leaderboard"
            className="inline-block bg-toxic/10 border-2 border-toxic text-toxic font-bold px-8 py-3 rounded hover:bg-toxic/20 transition-all radiation-border glitch-hover text-sm"
          >
            ▼ ТАБЛИЦА МУТАНТОВ ▼
          </a>
        </div>
      </section>

      {/* Games list */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-toxic toxic-glow text-center mb-2">
          🎮 ДИСЦИПЛИНЫ АРЕНЫ
        </h2>
        <p className="text-center text-bone/30 text-xs mb-8">
          Нажми на дисциплину чтобы узнать подробности
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {disciplines.map((discipline) => (
            <button
              key={discipline.slug}
              onClick={() => setSelectedDiscipline(discipline)}
              className="bg-smoke/50 border border-bone/10 rounded-lg p-3 text-center hover:border-toxic/30 hover:bg-toxic/5 transition-all glitch-hover group relative cursor-pointer"
            >
              {/* Бейдж активности */}
              <div
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                  discipline.isOver 
                    ? "bg-bone/40" 
                    : discipline.isActive 
                      ? "bg-toxic animate-pulse" 
                      : "bg-blood/60"
                }`}
              />

              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {discipline.emoji}
              </div>
              <div className="text-xs font-semibold text-bone/70 group-hover:text-toxic transition-colors">
                {discipline.name}
              </div>
              <div className="text-[10px] text-bone/30 mt-1 group-hover:text-toxic/50 transition-colors">
                подробнее →
              </div>
            </button>
          ))}
        </div>

        {/* Легенда */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-bone/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-toxic animate-pulse" />
            <span>Активна</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blood/60" />
            <span>Запланирована</span>
          </div>
        </div>
      </section>

      {/* Rules section */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <div className="bg-smoke/30 border border-blood/20 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-blood mb-4 flex items-center gap-2">
            <span>⚠️</span> ПРАВИЛА ЗОНЫ
          </h2>
          <div className="space-y-4 text-sm text-bone/60 leading-relaxed">
            <div className="flex gap-3">
              <span className="text-toxic font-bold shrink-0">01.</span>
              <p>
                Участвовать во всех играх{" "}
                <span className="text-bone font-bold">НЕ ОБЯЗАТЕЛЬНО</span>. Но
                если пропускаешь — сливаешь потенциальные очки.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-toxic font-bold shrink-0">02.</span>
              <p>
                <span className="text-bone font-bold">ОБЩИЙ РЕЙТИНГ</span> —
                суммируются очки во всех играх. Призы получают ТОП-3.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-toxic font-bold shrink-0">03.</span>
              <p>
                <span className="text-bone font-bold">ЛОКАЛЬНЫЙ РЕЙТИНГ</span>{" "}
                — по каждой дисциплине отдельно. ТОП-1 получает банку Добрый Кола. 🥤
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-toxic font-bold shrink-0">04.</span>
              <p>
                Очки за участие зависят от{" "}
                <span className="text-bone font-bold">
                  количества участников
                </span>{" "}
                в дисциплине. Больше народу — больше очков.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-toxic font-bold shrink-0">05.</span>
              <p>
                Если приходите на игру — вы{" "}
                <span className="text-bone font-bold">
                  автоматически участвуете
                </span>
                . Даты будут объявлены за неделю.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-toxic toxic-glow text-center mb-2">
          📊 РЕЙТИНГ МУТАНТОВ
        </h2>
        <p className="text-center text-bone/30 text-xs mb-8">
          Обновляется в реальном времени • Данные из бункера
        </p>
        <div className="bg-smoke/30 border border-toxic/10 rounded-xl p-4 md:p-6">
          <Leaderboard />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-bone/5 text-center">
        <div className="text-bone/20 text-xs space-y-1">
          <p>☢️ КОРЯЖЕМСКИЕ ОЛИМПИЙСКИЕ ИГРЫ 2026 ☢️</p>
          <p>Зона отчуждения • Все права зарезервированы мутантами</p>
          <p className="text-bone/10">
            Бюджет: 1000₽ • Звучит мало? А вы выиграйте сначала!
          </p>
        </div>
      </footer>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-toxic/30 rounded-full animate-ping" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-toxic/20 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-radiation/20 rounded-full animate-ping" style={{ animationDelay: "2s" }} />
      </div>
    </main>
  );
}