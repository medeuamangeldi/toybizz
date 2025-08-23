"use client";

import { useState, useEffect } from "react";
import { themes } from "./themes";
import GiftRegistry from "./GiftRegistry";
import CountdownTimer from "./CountdownTimer";
import EventSchedule from "./EventSchedule";
import PhotoGallery from "./PhotoGallery";
import RSVPForm from "./RSVPForm";
import QRShareSection from "./QRShareSection";
import MusicPlayer from "./MusicPlayer";
import ThemeDivider from "./ThemeDivider";

export interface InvitationData {
  _id?: string;
  eventId?: string;
  title: string;
  type: string;
  eventType?: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  hosts?: string;
  photos?: string[];
  theme: string;
  schedule?: Array<{ time: string; activity?: string; event?: string }>;
  rsvpRequired?: boolean;
  rsvpText?: string;
  melody?: string;
  contactInfo?: {
    organizer?: string;
    phone?: string;
    email?: string;
  };
  dressCode?: string;
  specialInstructions?: string;
}

interface InvitationTemplateProps {
  data: InvitationData;
  themeName: string;
  isOwner?: boolean;
}

export function InvitationTemplate({
  data,
  themeName,
  isOwner = false,
}: InvitationTemplateProps) {
  const theme = themes[themeName as keyof typeof themes] || themes.elegant;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRSVP = () => {
    const rsvpSection = document.getElementById("rsvp-form");
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} overflow-x-hidden`}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${theme.gradient} opacity-10 rounded-full animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 ${theme.gradient} opacity-5 rounded-full animate-pulse delay-1000`}
        ></div>
      </div>

      <div className="relative z-10">
        <section
          className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`mb-8 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1
                className={`${theme.titleSize} ${theme.titleFont} font-bold mb-6 leading-tight`}
              >
                {data.title}
              </h1>

              <ThemeDivider theme={theme} />

              <div
                className={`${theme.subtitleSize} space-y-4 ${theme.accent}`}
              >
                <p className={`${theme.font} font-semibold`}>{data.date}</p>
                <p className={`${theme.font} opacity-90`}>{data.location}</p>
              </div>

              <CountdownTimer date={data.date} theme={theme} />
            </div>

            <div
              className={`mb-12 transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <p
                className={`${theme.bodySize} ${theme.font} leading-relaxed max-w-2xl mx-auto`}
              >
                {data.description}
              </p>
            </div>

            <div
              className={`transition-all duration-1000 delay-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <button
                onClick={handleRSVP}
                className={`${theme.button} text-lg font-semibold`}
              >
                {data.rsvpText || "Подтвердить участие"}
              </button>
            </div>
          </div>
        </section>

        <EventSchedule schedule={data.schedule || []} theme={theme} />

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2
              className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
            >
              Место проведения
            </h2>

            <ThemeDivider theme={theme} />

            <div className={`${theme.card} p-8 text-center`}>
              <div className="mb-6">
                <p
                  className={`${theme.bodySize} ${theme.font} leading-relaxed`}
                >
                  📍 {data.location}
                </p>
              </div>

              <div className="mb-6">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    data.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 ${theme.button} text-sm`}
                >
                  🗺️ Посмотреть на карте
                </a>
              </div>

              <div className="text-center">
                <p className={`${theme.font} text-sm opacity-75`}>
                  Нажмите на кнопку выше, чтобы построить маршрут
                </p>
              </div>
            </div>
          </div>
        </section>

        {(data.dressCode || data.specialInstructions || data.contactInfo) && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2
                className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
              >
                Дополнительная информация
              </h2>

              <ThemeDivider theme={theme} />

              <div className="grid gap-6 md:grid-cols-2">
                {data.dressCode && (
                  <div className={`${theme.card} p-6`}>
                    <h3
                      className={`${theme.font} font-semibold text-lg mb-3 ${theme.accent}`}
                    >
                      👔 Дресс-код
                    </h3>
                    <p className={`${theme.font} text-sm opacity-90`}>
                      {data.dressCode}
                    </p>
                  </div>
                )}

                {data.contactInfo && (
                  <div className={`${theme.card} p-6`}>
                    <h3
                      className={`${theme.font} font-semibold text-lg mb-3 ${theme.accent}`}
                    >
                      📞 Контакты
                    </h3>
                    {data.contactInfo.organizer && (
                      <p className={`${theme.font} text-sm mb-2`}>
                        <strong>Организатор:</strong>{" "}
                        {data.contactInfo.organizer}
                      </p>
                    )}
                    {data.contactInfo.phone && (
                      <p className={`${theme.font} text-sm mb-2`}>
                        <strong>Телефон:</strong> {data.contactInfo.phone}
                      </p>
                    )}
                    {data.contactInfo.email && (
                      <p className={`${theme.font} text-sm`}>
                        <strong>Email:</strong> {data.contactInfo.email}
                      </p>
                    )}
                  </div>
                )}

                {data.specialInstructions && (
                  <div
                    className={`${theme.card} p-6 ${
                      !data.dressCode && !data.contactInfo
                        ? "md:col-span-2"
                        : ""
                    }`}
                  >
                    <h3
                      className={`${theme.font} font-semibold text-lg mb-3 ${theme.accent}`}
                    >
                      ℹ️ Важная информация
                    </h3>
                    <p className={`${theme.font} text-sm opacity-90`}>
                      {data.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <PhotoGallery photos={data.photos || []} theme={theme} />
        <MusicPlayer melody={data.melody || ""} theme={theme} />
        <QRShareSection data={data} theme={theme} />

        {data.eventType !== "поминки" && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <GiftRegistry
                eventId={data.eventId || data._id || ""}
                isOwner={isOwner}
                editMode={false}
              />
            </div>
          </section>
        )}

        <RSVPForm eventId={data.eventId || data._id || ""} theme={theme} />

        <footer className="py-8 text-center opacity-60">
          <p className="text-sm">Создано с ❤️ в ToyBiz</p>
        </footer>
      </div>
    </div>
  );
}
