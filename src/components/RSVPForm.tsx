import { useState } from "react";

interface RSVPFormProps {
  eventId?: string;
  theme: {
    card: string;
    subtitleSize: string;
    titleFont: string;
    accent: string;
    divider: string;
    dividerStyle: string;
    font: string;
    border: string;
    button: string;
  };
}

import ThemeDivider from "./ThemeDivider";

export default function RSVPForm({ eventId, theme }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    peopleCount: "1",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
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
    } catch {
      setSubmitMessage("Произошла ошибка. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp-form" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className={`${theme.card} p-8`}>
          <h3
            className={`${theme.subtitleSize} ${theme.titleFont} font-bold mb-6 text-center ${theme.accent}`}
          >
            Подтвердите участие
          </h3>

          <ThemeDivider theme={theme} />

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
  );
}
