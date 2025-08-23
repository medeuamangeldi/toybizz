interface MusicPlayerProps {
  melody: string;
  theme: {
    subtitleSize: string;
    titleFont: string;
    accent: string;
    divider: string;
    dividerStyle: string;
    card: string;
    font: string;
  };
}

import ThemeDivider from "./ThemeDivider";

export default function MusicPlayer({ melody, theme }: MusicPlayerProps) {
  if (!melody) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`${theme.subtitleSize} ${theme.titleFont} font-bold mb-8 ${theme.accent}`}
        >
          Музыкальное сопровождение
        </h2>

        <ThemeDivider theme={theme} />

        <div className={`${theme.card} p-8 max-w-md mx-auto`}>
          <div className="mb-6">
            <div className="text-6xl mb-4">🎵</div>
            <p className={`${theme.font} text-sm opacity-75 mb-4`}>
              Специальная мелодия для этого события
            </p>
          </div>

          <audio controls className="w-full mb-4" preload="metadata">
            <source src={melody} type="audio/mpeg" />
            <source src={melody} type="audio/wav" />
            <source src={melody} type="audio/ogg" />
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>

          <p className={`${theme.font} text-xs opacity-60`}>
            Включите звук для лучшего восприятия приглашения
          </p>
        </div>
      </div>
    </section>
  );
}
