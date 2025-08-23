"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import GiftRegistry from "@/components/GiftRegistry";

interface ScheduleItem {
  time: string;
  event: string;
}

interface EventData {
  type: string;
  name: string;
  language: string;
  date: string;
  time: string;
  location: string;
  style: string;
  customStyle: string;
  photos: string[]; // Changed from File[] to string[] to store URLs
  melody: File | null;
  schedule: ScheduleItem[];
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
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
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
    schedule: [],
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
    { value: "поминки", label: "Поминки 🕊️", emoji: "🕊️" },
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
      value: "elegant",
      label: "✨ Элегантный",
      desc: "Классическая элегантность с четкими линиями и серифными шрифтами",
    },
    {
      value: "romantic",
      label: "💕 Романтический",
      desc: "Нежные тона, сердечки и круглые формы",
    },
    {
      value: "modern",
      label: "🚀 Современный",
      desc: "Минималистский дизайн с неоновыми акцентами и моноширинными шрифтами",
    },
    {
      value: "luxury",
      label: "👑 Роскошный",
      desc: "Премиальный дизайн с золотыми акцентами и орнаментами",
    },
    {
      value: "nature",
      label: "🌿 Природный",
      desc: "Естественные зеленые оттенки и органичные формы",
    },
    {
      value: "vintage",
      label: "📜 Винтажный",
      desc: "Ретро стиль с декоративными рамками и классическими шрифтами",
    },
    {
      value: "minimalist",
      label: "⚪ Минималистский",
      desc: "Чистый белый дизайн с тонкими линиями и простотой",
    },
    {
      value: "festive",
      label: "🎉 Праздничный",
      desc: "Яркие цвета, анимации и праздничная атмосфера",
    },
    {
      value: "cosmic",
      label: "✨ Космический",
      desc: "Темная тема с градиентами и футуристичными эффектами",
    },
    {
      value: "bohemian",
      label: "🌸 Богемный",
      desc: "Художественный стиль с теплыми тонами и креативными формами",
    },
    {
      value: "custom",
      label: "🎨 Кастомный",
      desc: "Опишите свой уникальный стиль",
    },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + eventData.photos.length > 10) {
      alert("Максимум 10 фотографий");
      return;
    }

    setUploadingPhotos(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
        } else {
          console.error("Upload failed for file:", file.name);
          alert(`Ошибка загрузки файла: ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setEventData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...uploadedUrls],
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Ошибка при загрузке фото");
    } finally {
      setUploadingPhotos(false);
      // Clear the input to allow uploading the same files again and fix preview issues
      if (e.target) {
        e.target.value = "";
      }
    }
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

  const addScheduleItem = () => {
    setEventData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { time: "", event: "" }],
    }));
  };

  const updateScheduleItem = (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => {
    setEventData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeScheduleItem = (index: number) => {
    setEventData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
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
        if (
          key !== "photos" &&
          key !== "melody" &&
          key !== "schedule" &&
          value
        ) {
          formData.append(key, value.toString());
        }
      });

      // Add schedule as JSON
      if (eventData.schedule && eventData.schedule.length > 0) {
        formData.append("schedule", JSON.stringify(eventData.schedule));
      }

      setProgress(10);
      setProgressStep("Загрузка фотографий...");

      // Add photos (already uploaded, just pass URLs)
      if (eventData.photos.length > 0) {
        formData.append("photos", JSON.stringify(eventData.photos));
      }

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

  const handleCreateAndSetupGifts = async () => {
    setLoading(true);
    setProgress(0);
    setProgressStep("Подготовка данных...");

    try {
      const formData = new FormData();

      // Add event details
      Object.entries(eventData).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "melody" &&
          key !== "schedule" &&
          value
        ) {
          formData.append(key, value.toString());
        }
      });

      // Add schedule as JSON
      if (eventData.schedule && eventData.schedule.length > 0) {
        formData.append("schedule", JSON.stringify(eventData.schedule));
      }

      setProgress(10);
      setProgressStep("Загрузка фотографий...");

      // Add photos (already uploaded, just pass URLs)
      if (eventData.photos.length > 0) {
        formData.append("photos", JSON.stringify(eventData.photos));
      }

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
            setProgressStep("Переход к настройке подарков...");

            setTimeout(() => {
              setStep(6); // Go to gift registry step
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
        return true; // Schedule is optional
      case 4:
        return (
          eventData.style &&
          (eventData.style !== "custom" || eventData.customStyle.trim())
        );
      case 5:
        return true; // Photos and melody are optional
      case 6:
        return true; // Gift registry is optional
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
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Мои приглашения
                  </Link>
                  <span className="text-gray-700 text-sm">
                    👋 {user.email?.split("@")[0]}
                  </span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {3 - (user.freeTrialCount || 0)}/3
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                    title="Выйти"
                  >
                    🚪
                  </button>
                </div>
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
                    value={`${window.location.origin}/invitation/${createdEventId}`}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/invitation/${createdEventId}`
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
                      schedule: [],
                    });
                    setCreatedEventId(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Создать еще
                </button>
                <Link
                  href={`/edit-invitation/${createdEventId}`}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-center"
                >
                  Редактировать
                </Link>
                <button
                  onClick={() =>
                    window.open(`/invitation/${createdEventId}`, "_blank")
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
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

              {/* Step 3: Schedule/Agenda */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Программа мероприятия (необязательно)
                  </h2>

                  <div className="space-y-4">
                    {eventData.schedule.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <input
                          type="time"
                          value={item.time}
                          onChange={(e) =>
                            updateScheduleItem(index, "time", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="text"
                          value={item.event}
                          onChange={(e) =>
                            updateScheduleItem(index, "event", e.target.value)
                          }
                          placeholder="Описание события"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeScheduleItem(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={addScheduleItem}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + Добавить событие в программу
                    </button>
                  </div>

                  <p className="text-sm text-gray-500">
                    Добавьте временную программу мероприятия для удобства
                    гостей. Например: 15:00 - Регистрация гостей, 16:00 -
                    Церемония, и т.д.
                  </p>
                </div>
              )}

              {/* Step 4: Style Selection */}
              {step === 4 && (
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

              {/* Step 5: Photos and Melody */}
              {step === 5 && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Фотографии и музыка
                  </h2>

                  {/* Photos Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фотографии (до 10 шт., необязательно):
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhotos}
                        className="hidden"
                        id="photos"
                      />
                      <label
                        htmlFor="photos"
                        className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                          uploadingPhotos
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        📸{" "}
                        {uploadingPhotos ? "Загрузка..." : "Выбрать фотографии"}
                      </label>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">
                        Поддерживаются JPG, PNG (макс. 5MB каждая)
                      </p>
                      {uploadingPhotos && (
                        <p className="text-blue-600 text-sm mt-2">
                          Загрузка фото...
                        </p>
                      )}
                    </div>

                    {eventData.photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {eventData.photos.map((photoUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={photoUrl}
                              alt={`Photo ${index + 1}`}
                              width={100}
                              height={80}
                              unoptimized
                              className="w-full h-20 sm:h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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

              {/* Step 6: Gift Registry (Optional) */}
              {step === 6 && createdEventId && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      🎁 Реестр подарков
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm">
                        ✨ <strong>Этот шаг необязательный!</strong> Вы можете
                        добавить подарки, которые хотели бы получить от гостей,
                        или пропустить этот шаг.
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Реестр подарков поможет гостям выбрать то, что вам
                      действительно нужно
                    </p>
                  </div>

                  <GiftRegistry
                    eventId={createdEventId}
                    isOwner={true}
                    editMode={true}
                  />
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

                {step < 5 ? (
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
                ) : step === 5 ? (
                  <div
                    className={`${
                      step > 1 ? "sm:ml-auto" : "ml-auto"
                    } flex flex-col gap-3`}
                  >
                    <div className="text-center mb-2">
                      <p className="text-sm text-gray-600">
                        Выберите один из вариантов завершения:
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {eventData.type !== "поминки" && (
                        <button
                          onClick={handleCreateAndSetupGifts}
                          disabled={loading || !isStepValid(step)}
                          className={`px-6 py-3 rounded-lg font-medium text-sm sm:text-base ${
                            loading
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {loading
                            ? "Создание..."
                            : "🎁 Создать + добавить подарки"}
                        </button>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !isStepValid(step)}
                        className={`px-6 py-3 rounded-lg font-medium text-sm sm:text-base ${
                          loading
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {loading ? "Создание..." : "✅ Создать без подарков"}
                      </button>
                    </div>
                  </div>
                ) : step === 6 ? (
                  <div className={`${step > 1 ? "sm:ml-auto" : "ml-auto"}`}>
                    <button
                      onClick={() => setShowSuccessModal(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-green-700"
                    >
                      🎉 Завершить создание
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Progress Bar - moved outside navigation to fix container issue */}
              {loading && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
