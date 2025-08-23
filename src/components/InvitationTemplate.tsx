"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { themes } from "./themes";
import GiftRegistry from "./GiftRegistry";

export interface InvitationData {
  title: string;
  date: string;
  location: string;
  description: string;
  schedule: Array<{ time: string; event: string }>;
  photos?: string[];
  rsvpText?: string;
  eventId: string;
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
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    peopleCount: "1",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setSubmitMessage("Пожалуйста, введите ваше имя");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: data.eventId,
          fullName: formData.fullName,
          phone: formData.phone,
          peopleCount: parseInt(formData.peopleCount),
        }),
      });

      if (response.ok) {
        setSubmitMessage("Спасибо! Ваша регистрация принята.");
        setFormData({ fullName: "", phone: "", peopleCount: "1" });
      } else {
        setSubmitMessage("Произошла ошибка. Попробуйте еще раз.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage("Произошла ошибка. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} overflow-x-hidden`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 ${theme.gradient} opacity-10 rounded-full animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 ${theme.gradient} opacity-5 rounded-full animate-pulse delay-1000`}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
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

              {/* Theme-specific divider */}
              <div className={`${theme.divider} my-8`}>
                {theme.dividerStyle === "hearts" && (
                  <span className="text-rose-600">♥</span>
                )}
                {theme.dividerStyle === "natural" && (
                  <span className="text-green-600">🌿</span>
                )}
                {theme.dividerStyle === "festive" && (
                  <span className="text-purple-600">🎉</span>
                )}
                {theme.dividerStyle === "cosmic" && (
                  <span className="text-purple-400">✨</span>
                )}
                {theme.dividerStyle === "bohemian" && (
                  <span className="text-orange-600">🌸</span>
                )}
                {theme.dividerStyle === "vintage" && (
                  <span className="text-amber-800">❦</span>
                )}
                {theme.dividerStyle === "ornate" && (
                  <span className="text-yellow-700">◈</span>
                )}
              </div>

              <div
                className={`${theme.subtitleSize} space-y-4 ${theme.accent}`}
              >
                <p className={`${theme.font} font-semibold`}>{data.date}</p>
                <p className={`${theme.font} opacity-90`}>{data.location}</p>
              </div>
            </div>

            {/* Description */}
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

            {/* RSVP Button */}
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

        {/* Schedule Section */}
        {data.schedule && data.schedule.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2
                className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
              >
                Программа
              </h2>

              {/* Theme-specific divider */}
              <div className={`${theme.divider} mb-12`}>
                {theme.dividerStyle === "hearts" && (
                  <span className="text-rose-600">♥</span>
                )}
                {theme.dividerStyle === "natural" && (
                  <span className="text-green-600">🌿</span>
                )}
                {theme.dividerStyle === "festive" && (
                  <span className="text-purple-600">🎉</span>
                )}
                {theme.dividerStyle === "cosmic" && (
                  <span className="text-purple-400">✨</span>
                )}
                {theme.dividerStyle === "bohemian" && (
                  <span className="text-orange-600">🌸</span>
                )}
                {theme.dividerStyle === "vintage" && (
                  <span className="text-amber-800">❦</span>
                )}
                {theme.dividerStyle === "ornate" && (
                  <span className="text-yellow-700">◈</span>
                )}
              </div>

              <div className={`${theme.card} p-8 max-w-2xl mx-auto`}>
                <div className="space-y-6">
                  {data.schedule.map((item, i) => (
                    <div
                      key={i}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 transform hover:scale-105`}
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
                        {item.event}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {data.photos && data.photos.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2
                className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
              >
                Галерея
              </h2>

              {/* Theme-specific divider */}
              <div className={`${theme.divider} mb-12`}>
                {theme.dividerStyle === "hearts" && (
                  <span className="text-rose-600">♥</span>
                )}
                {theme.dividerStyle === "natural" && (
                  <span className="text-green-600">🌿</span>
                )}
                {theme.dividerStyle === "festive" && (
                  <span className="text-purple-600">🎉</span>
                )}
                {theme.dividerStyle === "cosmic" && (
                  <span className="text-purple-400">✨</span>
                )}
                {theme.dividerStyle === "bohemian" && (
                  <span className="text-orange-600">🌸</span>
                )}
                {theme.dividerStyle === "vintage" && (
                  <span className="text-amber-800">❦</span>
                )}
                {theme.dividerStyle === "ornate" && (
                  <span className="text-yellow-700">◈</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {data.photos.map((url, i) => (
                  <div
                    key={i}
                    className={`group relative overflow-hidden ${theme.photoFrame} transition-all duration-500`}
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <div className="aspect-square">
                      <Image
                        src={url}
                        alt={`Фото ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gift Registry Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <GiftRegistry
              eventId={data.eventId}
              isOwner={isOwner}
              editMode={false}
            />
          </div>
        </section>

        {/* RSVP Form Section */}
        <section id="rsvp-form" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className={`${theme.card} p-8`}>
              <h3
                className={`${theme.subtitleSize} ${theme.titleFont} font-bold mb-6 text-center ${theme.accent}`}
              >
                Подтвердите участие
              </h3>

              {/* Theme-specific divider */}
              <div className={`${theme.divider} mb-6`}>
                {theme.dividerStyle === "hearts" && (
                  <span className="text-rose-600">♥</span>
                )}
                {theme.dividerStyle === "natural" && (
                  <span className="text-green-600">🌿</span>
                )}
                {theme.dividerStyle === "festive" && (
                  <span className="text-purple-600">🎉</span>
                )}
                {theme.dividerStyle === "cosmic" && (
                  <span className="text-purple-400">✨</span>
                )}
                {theme.dividerStyle === "bohemian" && (
                  <span className="text-orange-600">🌸</span>
                )}
                {theme.dividerStyle === "vintage" && (
                  <span className="text-amber-800">❦</span>
                )}
                {theme.dividerStyle === "ornate" && (
                  <span className="text-yellow-700">◈</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {submitMessage && (
                  <div
                    className={`text-center p-4 rounded-xl transition-all duration-300 ${
                      theme.font
                    } ${
                      submitMessage.includes("Спасибо")
                        ? "bg-green-500/20 text-green-800 border border-green-300"
                        : "bg-red-500/20 text-red-800 border border-red-300"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm ${theme.font} font-semibold mb-3 opacity-90`}
                  >
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-xl ${theme.border} ${theme.font} border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 transition-all duration-300`}
                    placeholder="Введите ваше полное имя"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm ${theme.font} font-semibold mb-3 opacity-90`}
                  >
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-xl ${theme.border} ${theme.font} border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 transition-all duration-300`}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm ${theme.font} font-semibold mb-3 opacity-90`}
                  >
                    Количество гостей
                  </label>
                  <select
                    name="peopleCount"
                    value={formData.peopleCount}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/30 backdrop-blur-sm rounded-xl ${theme.border} ${theme.font} border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 transition-all duration-300`}
                  >
                    <option value="1">1 человек</option>
                    <option value="2">2 человека</option>
                    <option value="3">3 человека</option>
                    <option value="4">4 человека</option>
                    <option value="5">5+ человек</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${theme.button} text-lg font-semibold ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Отправляется...
                    </span>
                  ) : (
                    "Отправить"
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center opacity-60">
          <p className="text-sm">Создано с ❤️ в ToyBiz</p>
        </footer>
      </div>
    </div>
  );
}
