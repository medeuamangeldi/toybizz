"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">ToyBiz</div>
          <div className="space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.email[0].toUpperCase()}
                  </div>
                  {user.plan && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {user.plan}
                    </span>
                  )}
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                      onClick={() => setShowMenu(false)}
                    >
                      Панель управления
                    </Link>
                    <Link
                      href="/create"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Создать приглашение
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        className="flex items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ✨ ToyBiz - Создавайте незабываемые приглашения
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Используйте силу искусственного интеллекта для создания
            персонализированных приглашений на свадьбы, дни рождения и другие
            важные события с красивыми анимациями и музыкой.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ИИ дизайн
              </h3>
              <p className="text-gray-600 text-sm">
                Создавайте уникальные дизайны с помощью современного ИИ
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Музыка
              </h3>
              <p className="text-gray-600 text-sm">
                Добавляйте собственную музыку для создания атмосферы
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Мобильная адаптация
              </h3>
              <p className="text-gray-600 text-sm">
                Идеально выглядят на любых устройствах
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 mr-4"
            >
              🚀 Выбрать тариф
            </Link>

            <Link
              href="/create"
              className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200"
            >
              🎨 Создать приглашение
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
