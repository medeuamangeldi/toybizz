export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎉 Создайте приглашение
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Красивые приглашения на свадьбу, день рождения и любые мероприятия
              с помощью ИИ
            </p>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              🤖 Используйте Telegram бот
            </h2>
            <a
              href="https://t.me/toybizz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Открыть @toybizz_bot
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <span className="text-purple-700 font-medium">
                ✨ Отправьте /start боту для начала
              </span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <span className="text-blue-700 font-medium">
                🎨 ИИ создаст красивое приглашение
              </span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <span className="text-green-700 font-medium">
                📝 Гости смогут регистрироваться онлайн
              </span>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <span className="text-orange-700 font-medium">
                📊 Просматривайте статистику регистраций
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
