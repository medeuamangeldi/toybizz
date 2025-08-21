/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Invitation {
  _id: string;
  title: string;
  eventType: string;
  date: string;
  language: string;
  style: string;
  createdAt: string;
  registrations?: number;
  htmlContent?: string;
  eventId: string; // Custom eventId field
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchInvitations();
    }
  }, [user, loading, router]);

  const fetchInvitations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/invitations/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        setError("Не удалось загрузить приглашения");
        return;
      }

      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (err) {
      console.error("Fetch invitations error:", err);
      setError("Что-то пошло не так");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyInvitationLink = async (eventId: string) => {
    const invitationUrl = `${window.location.origin}/invitation/${eventId}`;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedId(eventId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = invitationUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedId(eventId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between py-3 sm:py-0 sm:h-16 sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <Link href="/" className="text-xl font-bold text-white">
                Toybiz Панель
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-white text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                  <span className="truncate max-w-48 sm:max-w-none">
                    Добро пожаловать, {user?.email}
                  </span>
                  <div className="flex space-x-2">
                    {user?.plan && user.plan !== "free" && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {user.plan}
                      </span>
                    )}
                    {(!user?.plan || user.plan === "free") && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Бесплатно: {3 - (user?.freeTrialCount || 0)} из 3
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-white hover:text-red-300 transition-colors text-sm self-start sm:self-auto"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ваши приглашения
            </h2>
            {invitations.length > 0 && (
              <Link
                href="/create"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-lg transition-colors text-center font-medium"
              >
                Создать новое приглашение
              </Link>
            )}
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm bg-red-900/30 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 sm:p-8 text-center">
            <div className="text-white/60 text-base sm:text-lg mb-4">
              Вы еще не создали ни одного приглашения.
            </div>
            <Link
              href="/create"
              className="inline-block w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Создать первое приглашение
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {invitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-white truncate pr-4">
                    {invitation.title}
                  </h3>
                  <Link
                    href={`/invitation/${invitation.eventId}/stats`}
                    className="text-indigo-400 hover:text-indigo-300 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Статистика
                  </Link>
                </div>

                <div className="space-y-2 text-sm text-gray-300 mb-4">
                  <div className="flex justify-between items-start">
                    <span>Тип события:</span>
                    <span className="capitalize text-right ml-2 break-words">
                      {invitation.eventType}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Дата:</span>
                    <span className="text-right ml-2 break-words">
                      {new Date(invitation.date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Язык:</span>
                    <span className="uppercase text-right ml-2">
                      {invitation.language}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Стиль:</span>
                    <span className="capitalize text-right ml-2 break-words">
                      {invitation.style}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Регистраций:</span>
                    <span className="text-green-400 font-semibold text-right ml-2">
                      {invitation.registrations || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs text-gray-400">
                    Создано: {formatDate(invitation.createdAt)}
                  </div>
                </div>

                <br />

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => copyInvitationLink(invitation.eventId)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 sm:py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    {copiedId === invitation.eventId
                      ? "Скопировано!"
                      : "Копировать ссылку"}
                  </button>
                  <Link
                    href={`/invitation/${invitation.eventId}/stats`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 sm:py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Аналитика
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
