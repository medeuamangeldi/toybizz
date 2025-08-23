interface EventScheduleProps {
  schedule: Array<{ time: string; activity?: string; event?: string }>;
  theme: {
    subtitleSize: string;
    titleFont: string;
    accent: string;
    divider: string;
    dividerStyle: string;
    card: string;
    font: string;
    bodySize: string;
  };
}

import ThemeDivider from "./ThemeDivider";

export default function EventSchedule({ schedule, theme }: EventScheduleProps) {
  if (!schedule?.length) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2
          className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
        >
          Программа
        </h2>

        <ThemeDivider theme={theme} />

        <div className={`${theme.card} p-8 max-w-2xl mx-auto`}>
          <div className="space-y-6">
            {schedule.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 transform hover:scale-105"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span
                  className={`${theme.font} font-bold text-lg ${theme.accent} mb-2 sm:mb-0`}
                >
                  {item.time}
                </span>
                <span
                  className={`${theme.bodySize} ${theme.font} flex-1 sm:ml-4`}
                >
                  {item.activity || item.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
