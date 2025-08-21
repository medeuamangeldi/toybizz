"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface EventData {
  type: string;
  name: string;
  language: string;
  date: string;
  time: string;
  location: string;
  style: string;
  customStyle: string;
  photos: File[];
  melody: File | null;
}

export default function CreateInvitation() {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [eventData, setEventData] = useState<EventData>({
    type: "",
    name: "",
    language: "",
    date: "",
    time: "",
    location: "",
    style: "",
    customStyle: "",
    photos: [],
    melody: null,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  const eventTypes = [
    { value: "свадьба", label: "Свадьба 💒", emoji: "💒" },
    { value: "день рождения", label: "День рождения 🎂", emoji: "🎂" },
    { value: "юбилей", label: "Юбилей 🎉", emoji: "🎉" },
    { value: "корпоратив", label: "Корпоратив 🏢", emoji: "🏢" },
    { value: "вечеринка", label: "Вечеринка 🎊", emoji: "🎊" },
    { value: "другое", label: "Другое 🎭", emoji: "🎭" },
  ];

  const languageOptions = [
    {
      value: "русский",
      label: "Русский 🇷🇺",
      desc: "Приглашение на русском языке",
    },
    { value: "казахский", label: "Қазақша 🇰🇿", desc: "Шақыру қазақ тілінде" },
    { value: "английский", label: "English 🇺🇸", desc: "Invitation in English" },
  ];

  const styleOptions = [
    {
      value: "классический",
      label: "🖤 Классический",
      desc: "Элегантный черно-белый",
    },
    {
      value: "нежный_розовый",
      label: "🌸 Нежный розовый",
      desc: "Романтические пастельные тона",
    },
    {
      value: "яркий_синий",
      label: "🌈 Яркий синий",
      desc: "Насыщенные синие оттенки",
    },
    { value: "золотой", label: "✨ Золотой", desc: "Роскошная золотая тема" },
    {
      value: "фиолетовый",
      label: "💜 Фиолетовый",
      desc: "Элегантные фиолетовые тона",
    },
    {
      value: "зеленый",
      label: "🌿 Зеленый",
      desc: "Естественные зеленые цвета",
    },
    {
      value: "оранжевый",
      label: "🧡 Оранжевый",
      desc: "Теплые оранжевые оттенки",
    },
    { value: "красный", label: "❤️ Красный", desc: "Смелый красный дизайн" },
    {
      value: "морской",
      label: "🌊 Морской",
      desc: "Океанические сине-бирюзовые тона",
    },
    {
      value: "минимальный",
      label: "🤍 Минимальный",
      desc: "Ультра чистый белый дизайн",
    },
    {
      value: "неон",
      label: "⚡ Неон",
      desc: "Электрические неоновые эффекты",
    },
    {
      value: "звездные_войны",
      label: "🌌 Звездные Войны",
      desc: "Галактический стиль из далекой галактики",
    },
    {
      value: "кибер_панк",
      label: "🤖 Кибер-панк",
      desc: "Футуристический мир будущего",
    },
    {
      value: "ретро_вейв",
      label: "🌈 Ретро-вейв",
      desc: "Стиль 80-х с синтвейв эстетикой",
    },
    {
      value: "custom",
      label: "🎨 Кастомный",
      desc: "Опишите свой уникальный стиль",
    },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + eventData.photos.length > 5) {
      alert("Максимум 5 фотографий");
      return;
    }
    setEventData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const handleMelodyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert("Размер файла не должен превышать 10MB");
        return;
      }
      setEventData((prev) => ({ ...prev, melody: file }));
    }
  };

  const removePhoto = (index: number) => {
    setEventData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setProgressStep("Подготовка данных...");

    try {
      const formData = new FormData();

      // Add event details
      Object.entries(eventData).forEach(([key, value]) => {
        if (key !== "photos" && key !== "melody" && value) {
          formData.append(key, value.toString());
        }
      });

      setProgress(10);
      setProgressStep("Загрузка фотографий...");

      // Add photos
      eventData.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      setProgress(30);

      // Add melody
      if (eventData.melody) {
        setProgressStep("Загрузка музыки...");
        formData.append("melody", eventData.melody);
        setProgress(40);
      }

      setProgressStep("Создание приглашения с помощью ИИ...");
      setProgress(50);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const uploadProgress = Math.round((e.loaded / e.total) * 30); // 30% for upload
            setProgress(50 + uploadProgress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setProgress(90);
            setProgressStep("Финализация...");

            const result = JSON.parse(xhr.responseText);
            setCreatedEventId(result.eventId);
            setProgress(100);
            setProgressStep("Готово!");

            setTimeout(() => {
              setShowSuccessModal(true);
              resolve();
            }, 500);
          } else {
            const result = JSON.parse(xhr.responseText);
            if (result.freeTrialEnded) {
              alert(
                `${
                  result.message || "Пробный период закончен"
                }\n\nВы использовали все 3 бесплатных приглашения. Пожалуйста, приобретите план для продолжения создания приглашений.`
              );
            } else {
              alert(result.error || "Произошла ошибка");
            }
            reject(new Error(`HTTP ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          alert("Произошла ошибка при создании приглашения");
          reject(new Error("Network error"));
        });

        xhr.open("POST", "/api/create-invitation");

        // Add Authorization header if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressStep("");
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return eventData.type && eventData.name && eventData.language;
      case 2:
        return eventData.date && eventData.time && eventData.location;
      case 3:
        return (
          eventData.style &&
          (eventData.style !== "custom" || eventData.customStyle.trim())
        );
      case 4:
        return true; // Photos and melody are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 py-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-gray-900"
            >
              ToyBiz
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                  >
                    Мои приглашения
                  </Link>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="text-gray-700 text-sm">{user.email}</span>
                    <div className="flex gap-2">
                      {user.plan && user.plan !== "free" && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full w-fit">
                          {user.plan}
                        </span>
                      )}
                      {(!user.plan || user.plan === "free") && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">
                          Бесплатно: {3 - (user.freeTrialCount || 0)} из 3
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-700 text-sm sm:text-base"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-4">🎉</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Приглашение готово!
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Ваше красивое приглашение создано и готово к отправке гостям
              </p>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Ссылка на приглашение:
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/event/${createdEventId}`}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/event/${createdEventId}`
                      );
                      alert("Ссылка скопирована в буфер обмена!");
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium whitespace-nowrap"
                  >
                    Копировать
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setStep(1);
                    setEventData({
                      type: "",
                      name: "",
                      language: "",
                      date: "",
                      time: "",
                      location: "",
                      style: "",
                      customStyle: "",
                      photos: [],
                      melody: null,
                    });
                    setCreatedEventId(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Создать еще
                </button>
                <button
                  onClick={() =>
                    window.open(`/event/${createdEventId}`, "_blank")
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  Посмотреть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-4">🔒</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Вход требуется
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Для создания приглашений необходимо войти в аккаунт или
                зарегистрироваться
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-center"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium text-center"
                >
                  Регистрация
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Создать приглашение
          </h1>
          <div className="flex justify-center space-x-2 mb-4 sm:mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i}
              </div>
            ))}
          </div>
        </div>

        {/* Content only shown when user is logged in */}
        {user && (
          <React.Fragment>
            {/* Free Trial Warning Banner */}
            {(!user.plan || user.plan === "free") && (
              <div
                className={`rounded-xl p-4 mb-6 ${
                  (user.freeTrialCount || 0) >= 2
                    ? "bg-red-50 border border-red-200"
                    : (user.freeTrialCount || 0) >= 1
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg">
                    {(user.freeTrialCount || 0) >= 2
                      ? "⚠️"
                      : (user.freeTrialCount || 0) >= 1
                      ? "💡"
                      : "ℹ️"}
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        (user.freeTrialCount || 0) >= 2
                          ? "text-red-800"
                          : (user.freeTrialCount || 0) >= 1
                          ? "text-yellow-800"
                          : "text-blue-800"
                      }`}
                    >
                      {(user.freeTrialCount || 0) >= 2
                        ? "Последнее бесплатное приглашение!"
                        : (user.freeTrialCount || 0) >= 1
                        ? `Осталось ${
                            3 - (user.freeTrialCount || 0)
                          } бесплатных приглашений`
                        : "У вас есть 3 бесплатных приглашения"}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        (user.freeTrialCount || 0) >= 2
                          ? "text-red-600"
                          : (user.freeTrialCount || 0) >= 1
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    >
                      {(user.freeTrialCount || 0) >= 2
                        ? "После этого приглашения нужно будет приобрести план для создания новых приглашений."
                        : "После использования всех бесплатных приглашений вам потребуется приобрести план."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              {/* Step 1: Event Type and Name */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Тип мероприятия и язык приглашения
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Выберите язык приглашения:
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {languageOptions.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() =>
                            setEventData((prev) => ({
                              ...prev,
                              language: lang.value,
                            }))
                          }
                          className={`p-3 sm:p-4 border rounded-lg text-center transition-colors ${
                            eventData.language === lang.value
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <div className="font-medium text-sm sm:text-base">
                            {lang.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {lang.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Выберите тип мероприятия:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() =>
                            setEventData((prev) => ({
                              ...prev,
                              type: type.value,
                            }))
                          }
                          className={`p-3 sm:p-4 border rounded-lg text-left transition-colors ${
                            eventData.type === type.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mr-2">
                            {type.emoji}
                          </span>
                          <span className="text-sm sm:text-base">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название мероприятия:
                    </label>
                    <input
                      type="text"
                      value={eventData.name}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Например: Свадьба Анны и Дмитрия"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Date, Time, Location */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Дата, время и место
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата:
                    </label>
                    <input
                      type="date"
                      value={eventData.date}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время:
                    </label>
                    <input
                      type="time"
                      value={eventData.time}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Место проведения:
                    </label>
                    <textarea
                      value={eventData.location}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Например: Ресторан 'Казна', ул. Абая 150, Алматы"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Style Selection */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Выберите стиль
                  </h2>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {styleOptions.map((style) => (
                      <button
                        key={style.value}
                        onClick={() =>
                          setEventData((prev) => ({
                            ...prev,
                            style: style.value,
                          }))
                        }
                        className={`p-3 sm:p-4 border rounded-lg text-left transition-colors ${
                          eventData.style === style.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {style.label}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          {style.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Style Input */}
                  {eventData.style === "custom" && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Опишите ваш кастомный стиль:
                      </label>
                      <textarea
                        value={eventData.customStyle}
                        onChange={(e) =>
                          setEventData((prev) => ({
                            ...prev,
                            customStyle: e.target.value,
                          }))
                        }
                        placeholder="Например: космическая тематика с темно-синим фоном и золотыми звездами, или винтажный стиль с сепией и старинными узорами..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Детально опишите цвета, настроение, декоративные
                        элементы и общую атмосферу вашего идеального приглашения
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Photos and Melody */}
              {step === 4 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Фотографии и музыка
                  </h2>

                  {/* Photos Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фотографии (до 5 шт., необязательно):
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photos"
                      />
                      <label
                        htmlFor="photos"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        📸 Выбрать фотографии
                      </label>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">
                        Поддерживаются JPG, PNG (макс. 5MB каждая)
                      </p>
                    </div>

                    {eventData.photos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {eventData.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2">
                              {photo.name}
                            </span>
                            <button
                              onClick={() => removePhoto(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Melody Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Мелодия (необязательно):
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleMelodyUpload}
                        className="hidden"
                        id="melody"
                      />
                      <label
                        htmlFor="melody"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                      >
                        🎵 Выбрать мелодию
                      </label>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">
                        Поддерживаются MP3, WAV (макс. 10MB)
                      </p>
                    </div>

                    {eventData.melody && (
                      <div className="mt-4 p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2">
                            {eventData.melody.name}
                          </span>
                          <button
                            onClick={() =>
                              setEventData((prev) => ({
                                ...prev,
                                melody: null,
                              }))
                            }
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 space-y-3 sm:space-y-0">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Назад
                  </button>
                )}

                {step < 4 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid(step)}
                    className={`${
                      step > 1 ? "sm:ml-auto" : "ml-auto"
                    } px-6 py-3 rounded-lg font-medium text-sm sm:text-base ${
                      isStepValid(step)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Далее
                  </button>
                ) : (
                  <div className={`${step > 1 ? "sm:ml-auto" : "ml-auto"}`}>
                    {loading && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            {progressStep}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                        loading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Создаем приглашение...
                        </div>
                      ) : (
                        "🎉 Создать приглашение"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
