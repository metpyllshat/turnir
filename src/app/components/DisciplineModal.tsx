"use client";

interface Discipline {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  isActive: boolean;
  scheduledAt: string | null;
  description: string | null;
  downloadUrl: string | null;
  completedAt: string | null;
  isOver: boolean;
}

interface Props {
  discipline: Discipline | null;
  onClose: () => void;
}

export default function DisciplineModal({ discipline, onClose }: Props) {
  if (!discipline) return null;

  return (
    // Затемнённый фон
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Само окошко */}
      <div
        className="relative bg-[#0f0f0f] border border-toxic/30 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl shadow-toxic/10"
        onClick={(e) => e.stopPropagation()} // клик внутри не закрывает
      >
        {/* Шапка */}
        <div className="sticky top-0 bg-[#0f0f0f] border-b border-toxic/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{discipline.emoji}</span>
            <div>
              <h2 className="text-toxic font-extrabold text-xl leading-tight">
                {discipline.name}
              </h2>
              {discipline.isOver ? (
                <p className="text-bone/60 text-xs font-bold mt-0.5">
                  🏁 ЗАВЕРШЕНА
                  {discipline.completedAt && (
                    <span className="text-bone/40">
                      {" • "}
                      {new Date(discipline.completedAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
              ) : discipline.isActive ? (
                <p className="text-toxic/60 text-xs font-bold mt-0.5">
                  ✅ АКТИВНА
                  {discipline.scheduledAt && (
                    <span className="text-bone/40">
                      {" • "}
                      {new Date(discipline.scheduledAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
              ) : discipline.scheduledAt ? (
                <p className="text-blood text-xs font-bold mt-0.5">
                  ⏳{" "}
                  {new Date(discipline.scheduledAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-bone/40 hover:text-bone text-2xl transition-colors w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="px-6 py-5 space-y-5">
          {/* Описание */}
          {discipline.description && (
            <div>
              <h3 className="text-bone/60 text-xs font-bold uppercase tracking-widest mb-2">
                📖 О дисциплине
              </h3>
              <p className="text-bone/80 text-sm leading-relaxed">
                {discipline.description}
              </p>
            </div>
          )}


          {/* Если нет ни описания ни правил */}
          {!discipline.description && (
            <div className="text-center py-6">
              <p className="text-bone/30 text-sm">
                Описание и правила скоро появятся
              </p>
            </div>
          )}

          {/* Кнопка скачать */}
          {discipline.downloadUrl && (
            <div className="pt-2">
              <a
                href={discipline.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-toxic/10 border-2 border-toxic text-toxic font-bold py-3 rounded-lg hover:bg-toxic/20 transition-all text-sm"
              >
                ⬇️ СКАЧАТЬ / ОТКРЫТЬ ИГРУ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}