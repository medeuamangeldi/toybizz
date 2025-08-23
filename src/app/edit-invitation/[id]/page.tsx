"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  InvitationTemplate,
  InvitationData,
} from "@/components/InvitationTemplate";
import { themeNames } from "@/components/themes";
import { getPhotoUrl } from "@/lib/url-utils";

const themeDisplayNames = {
  elegant: "Элегантная",
  romantic: "Романтическая",
  modern: "Современная",
  luxury: "Роскошная",
  nature: "Природная",
  vintage: "Винтажная",
  minimalist: "Минималистская",
  festive: "Праздничная",
  cosmic: "Космическая",
  bohemian: "Богемная",
} as const;

export default function EditInvitationPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null
  );
  const [selectedTheme, setSelectedTheme] = useState<string>("elegant");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchInvitation = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Не удалось загрузить приглашение");
        return;
      }

      const invitation = await response.json();

      // Build content data from document fields instead of parsing htmlContent
      const contentData: InvitationData = {
        title: invitation.title || invitation.name || "Приглашение",
        type: invitation.eventType || invitation.type || "событие",
        date: invitation.date || "Дата не указана",
        time: invitation.time || "00:00",
        location: invitation.location || "Место не указано",
        theme: invitation.theme || invitation.style || "elegant",
        description:
          invitation.description || "Присоединяйтесь к нашему празднику!",
        schedule: invitation.schedule || [
          {
            time: invitation.time || "00:00",
            activity: "Основное мероприятие",
          },
        ],
        // Photos come from photoUrls array, not from contentData
        photos: invitation.photoUrls?.map((photoId: string) => photoId) || [],
        melody: invitation.melodyUrl
          ? invitation.melodyUrl.startsWith("/")
            ? invitation.melodyUrl
            : `/api/files/melodies/${invitation.melodyUrl}`
          : undefined,
        rsvpText: invitation.rsvpText || "Подтвердить участие",
        eventId: eventId,
      };

      setInvitationData(contentData);
      setSelectedTheme(invitation.theme || invitation.style || "elegant");
    } catch (err) {
      console.error("Fetch invitation error:", err);
      setError("Что-то пошло не так");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user && eventId) {
      fetchInvitation();
    }
  }, [user, loading, eventId, router, fetchInvitation]);

  const handleSave = async () => {
    if (!invitationData) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentData: invitationData,
          theme: selectedTheme,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Не удалось сохранить изменения");
        return;
      }

      setSuccessMessage("Изменения сохранены!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Что-то пошло не так при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  const addScheduleItem = () => {
    if (!invitationData) return;

    const newScheduleItem = {
      time: "19:00",
      activity: "Новое мероприятие",
    };

    setInvitationData({
      ...invitationData,
      schedule: [...(invitationData.schedule || []), newScheduleItem],
    });
  };

  const removeScheduleItem = (index: number) => {
    if (!invitationData || !invitationData.schedule) return;

    const newSchedule = invitationData.schedule.filter((_, i) => i !== index);
    setInvitationData({
      ...invitationData,
      schedule: newSchedule,
    });
  };

  const updateScheduleItem = (
    index: number,
    field: "time" | "activity",
    value: string
  ) => {
    if (!invitationData || !invitationData.schedule) return;

    const newSchedule = [...invitationData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setInvitationData({
      ...invitationData,
      schedule: newSchedule,
    });
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !invitationData) return;

    const filesArray = Array.from(files);

    // Check for HEIC files and inform user about conversion
    const heicFiles = filesArray.filter(
      (file) =>
        file.type.toLowerCase().includes("heic") ||
        file.type.toLowerCase().includes("heif") ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
    );

    if (heicFiles.length > 0) {
      alert(
        `Обнаружены HEIC файлы (${heicFiles.map((f) => f.name).join(", ")}). ` +
          `Они будут автоматически конвертированы в JPEG для лучшей совместимости.`
      );
    }

    setIsUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const uploadedUrls: string[] = [];

      for (const file of filesArray) {
        const formData = new FormData();
        formData.append("file", file);

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
        }
      }

      if (uploadedUrls.length > 0) {
        setInvitationData({
          ...invitationData,
          photos: [...(invitationData.photos || []), ...uploadedUrls],
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Ошибка при загрузке фото");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    if (!invitationData) return;

    const newPhotos =
      invitationData.photos?.filter((_, i) => i !== index) || [];
    setInvitationData({
      ...invitationData,
      photos: newPhotos,
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Приглашение не найдено</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          >
            Назад к панели
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-lg sm:text-xl font-bold text-white"
              >
                Toybiz
              </Link>
              <nav className="hidden sm:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Мои приглашения
                </Link>
                <Link
                  href="/create"
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Создать
                </Link>
              </nav>
              <span className="text-white/60 text-sm">/ Редактировать</span>
            </div>
            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white hover:text-gray-300 text-sm sm:text-base"
              >
                Назад
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-8">
        {error && (
          <div className="mb-6 text-red-400 text-sm bg-red-900/30 p-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 text-green-400 text-sm bg-green-900/30 p-3 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 lg:p-6 space-y-4 lg:space-y-6 order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-white mb-4">Настройки</h2>

            {/* Theme Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Выберите тему
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {themeNames.map((key) => (
                  <option key={key} value={key} className="text-gray-900">
                    {themeDisplayNames[key as keyof typeof themeDisplayNames]}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Название события
              </label>
              <input
                type="text"
                value={invitationData.title}
                onChange={(e) =>
                  setInvitationData({
                    ...invitationData,
                    title: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Дата
              </label>
              <input
                type="text"
                value={invitationData.date}
                onChange={(e) =>
                  setInvitationData({ ...invitationData, date: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Место проведения
              </label>
              <input
                type="text"
                value={invitationData.location}
                onChange={(e) =>
                  setInvitationData({
                    ...invitationData,
                    location: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Описание
              </label>
              <textarea
                rows={4}
                value={invitationData.description}
                onChange={(e) =>
                  setInvitationData({
                    ...invitationData,
                    description: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Фотографии
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {isUploading && (
                <p className="text-blue-300 text-sm mt-2">Загрузка фото...</p>
              )}
              {invitationData.photos && invitationData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {invitationData.photos.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={getPhotoUrl(url)}
                        alt={`Uploaded photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg"
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

            {/* Schedule */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-white text-sm font-medium">
                  Расписание
                </label>
                <button
                  onClick={addScheduleItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Добавить
                </button>
              </div>
              <div className="space-y-2">
                {(invitationData.schedule || []).map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Время"
                      value={item.time}
                      onChange={(e) =>
                        updateScheduleItem(index, "time", e.target.value)
                      }
                      className="w-24 p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Мероприятие"
                      value={item.activity || item.event || ""}
                      onChange={(e) =>
                        updateScheduleItem(index, "activity", e.target.value)
                      }
                      className="flex-1 p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeScheduleItem(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RSVP Text */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Текст кнопки RSVP
              </label>
              <input
                type="text"
                value={invitationData.rsvpText || "Подтвердить участие"}
                onChange={(e) =>
                  setInvitationData({
                    ...invitationData,
                    rsvpText: e.target.value,
                  })
                }
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Загрузить фото
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                multiple
              />
              {isUploading && (
                <div className="text-white text-sm mt-2">Загрузка...</div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl order-1 lg:order-2">
            <div className="bg-gray-800 text-white px-4 py-2 text-sm">
              Предварительный просмотр -{" "}
              {
                themeDisplayNames[
                  selectedTheme as keyof typeof themeDisplayNames
                ]
              }
            </div>
            <div className="h-80 lg:h-96 overflow-y-auto">
              <InvitationTemplate
                data={invitationData}
                themeName={selectedTheme}
                isOwner={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
