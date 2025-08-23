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
            ✨ ToyBiz - Создавайте красивые приглашения
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Создавайте стильные приглашения с уникальными темами, загружайте
            фотографии, управляйте списком подарков и собирайте ответы гостей -
            всё в одном месте.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Уникальные темы
              </h3>
              <p className="text-gray-600 text-sm">
                От элегантных свадебных до ярких детских - каждая тема с
                уникальными шрифтами, формами и украшениями
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Реестр подарков
              </h3>
              <p className="text-gray-600 text-sm">
                Гости могут выбрать и зарезервировать подарки прямо в
                приглашении
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Галерея фото
              </h3>
              <p className="text-gray-600 text-sm">
                Загружайте фотографии для создания личной атмосферы события
              </p>
            </div>
          </div>

          {/* How it works section */}
          <div className="bg-white rounded-2xl p-8 mb-12 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Как это работает
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Создайте событие
                </h3>
                <p className="text-gray-600 text-sm">
                  Выберите тип события и заполните основную информацию
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Настройте дизайн
                </h3>
                <p className="text-gray-600 text-sm">
                  Выберите тему, загрузите фото и добавьте расписание
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Добавьте подарки
                </h3>
                <p className="text-gray-600 text-sm">
                  Создайте список желаемых подарков с описанием и ссылками
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Поделитесь</h3>
                <p className="text-gray-600 text-sm">
                  Отправьте ссылку гостям и получайте ответы в реальном времени
                </p>
              </div>
            </div>
          </div>

          {/* Features showcase */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                💒 Свадебные приглашения
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Элегантные и романтичные темы</li>
                <li>• Реестр свадебных подарков</li>
                <li>• Подтверждение участия гостей</li>
                <li>• Галерея пар и предсвадебных фото</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🎂 Дни рождения и праздники
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Яркие праздничные темы</li>
                <li>• Список подарков для именинника</li>
                <li>• Расписание празднования</li>
                <li>• Семейные фотографии</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 mr-4"
              >
                📋 Мои приглашения
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 mr-4"
              >
                🚀 Начать бесплатно
              </Link>
            )}

            <Link
              href="/create"
              className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200"
            >
              🎨 Создать приглашение
            </Link>

            <div className="mt-4">
              <Link
                href="/demo"
                className="inline-block text-gray-600 hover:text-gray-800 text-sm underline"
              >
                👀 Посмотреть пример приглашения
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Попробуйте бесплатно - 3 приглашения без ограничений
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-xs text-gray-500">Уникальных тем</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-xs text-gray-500">Фото в галерее</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-xs text-gray-500">Подарков в реестре</div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Что говорят наши пользователи
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-600 text-sm mb-3">
                  &ldquo;Создала приглашение на свадьбу за 15 минут! Гости были
                  в восторге от реестра подарков.&rdquo;
                </p>
                <p className="text-gray-900 font-medium">Алия, невеста</p>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-600 text-sm mb-3">
                  &ldquo;Очень удобно собирать ответы гостей. Все в одном месте,
                  красиво и функционально.&rdquo;
                </p>
                <p className="text-gray-900 font-medium">Марат, организатор</p>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 text-2xl mb-2">⭐⭐⭐⭐⭐</div>
                <p className="text-gray-600 text-sm mb-3">
                  &ldquo;Темы просто шикарные! Каждая имеет свой стиль. Выбрала
                  &lsquo;Космическую&rsquo; для юбилея.&rdquo;
                </p>
                <p className="text-gray-900 font-medium">Динара, мама</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
