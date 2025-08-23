interface CountdownTimerProps {
  date: string;
  theme: {
    font: string;
    titleFont: string;
    accent: string;
  };
}

export default function CountdownTimer({ date, theme }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const eventDate = new Date(date);
    const now = new Date();
    const difference = eventDate.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      return { days, hours, minutes, seconds };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const timeLeft = calculateTimeLeft();

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
      <p className={`${theme.font} text-sm opacity-75 mb-4 text-center`}>
        До события осталось:
      </p>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className={`${theme.accent}`}>
          <div className={`${theme.titleFont} text-2xl md:text-3xl font-bold`}>
            {timeLeft.days}
          </div>
          <div className={`${theme.font} text-xs opacity-75`}>
            {timeLeft.days === 1 ? "день" : timeLeft.days < 5 ? "дня" : "дней"}
          </div>
        </div>
        <div className={`${theme.accent}`}>
          <div className={`${theme.titleFont} text-2xl md:text-3xl font-bold`}>
            {timeLeft.hours}
          </div>
          <div className={`${theme.font} text-xs opacity-75`}>
            {timeLeft.hours === 1
              ? "час"
              : timeLeft.hours < 5
              ? "часа"
              : "часов"}
          </div>
        </div>
        <div className={`${theme.accent}`}>
          <div className={`${theme.titleFont} text-2xl md:text-3xl font-bold`}>
            {timeLeft.minutes}
          </div>
          <div className={`${theme.font} text-xs opacity-75`}>
            {timeLeft.minutes === 1
              ? "минута"
              : timeLeft.minutes < 5
              ? "минуты"
              : "минут"}
          </div>
        </div>
        <div className={`${theme.accent}`}>
          <div className={`${theme.titleFont} text-2xl md:text-3xl font-bold`}>
            {timeLeft.seconds}
          </div>
          <div className={`${theme.font} text-xs opacity-75`}>
            {timeLeft.seconds === 1
              ? "секунда"
              : timeLeft.seconds < 5
              ? "секунды"
              : "секунд"}
          </div>
        </div>
      </div>
    </div>
  );
}
