export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Пользовательское соглашение
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Общие положения
              </h2>
              <p>
                Настоящее Пользовательское соглашение (далее — «Соглашение»)
                регулирует отношения между ООО «ToyBiz» (далее — «Компания») и
                пользователем сервиса создания приглашений (далее —
                «Пользователь»).
              </p>
              <p>
                Использование сервиса означает полное и безоговорочное принятие
                условий данного Соглашения.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Описание сервиса
              </h2>
              <p>
                Сервис предоставляет возможность создания персонализированных
                приглашений на мероприятия с использованием технологий
                искусственного интеллекта.
              </p>
              <p>Основные функции сервиса:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Создание HTML-приглашений с индивидуальным дизайном</li>
                <li>Загрузка и обработка фотографий</li>
                <li>Добавление музыкального сопровождения</li>
                <li>Сбор регистраций гостей</li>
                <li>Аналитика и статистика</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Права и обязанности пользователя
              </h2>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пользователь имеет право:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>
                  Использовать сервис в соответствии с выбранным тарифным планом
                </li>
                <li>Получать техническую поддержку в рамках тарифа</li>
                <li>Запрашивать удаление своих данных</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пользователь обязуется:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Предоставлять достоверную информацию при регистрации</li>
                <li>Не нарушать авторские права при загрузке контента</li>
                <li>Не использовать сервис в противоправных целях</li>
                <li>Соблюдать условия выбранного тарифного плана</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Тарифные планы и оплата
              </h2>
              <p>
                Сервис предоставляется на основе тарифных планов. Стоимость и
                условия каждого плана указаны на странице тарифов.
              </p>
              <p>Условия оплаты:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Базовый план: разовый платеж 990₸</li>
                <li>Профессиональный план: ежемесячная подписка 2 990₸</li>
                <li>Корпоративный план: ежемесячная подписка 9 990₸</li>
                <li>Автопродление подписки происходит автоматически</li>
                <li>Возврат средств возможен в течение 14 дней</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Интеллектуальная собственность
              </h2>
              <p>
                Все права на программное обеспечение, дизайн интерфейса и
                технологии принадлежат Компании. Пользователь сохраняет права на
                загружаемый им контент (фотографии, музыку).
              </p>
              <p>
                Сгенерированные приглашения принадлежат Пользователю. Компания
                не претендует на права на созданный контент.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Ограничение ответственности
              </h2>
              <p>Компания не несет ответственности за:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Временную недоступность сервиса</li>
                <li>Потерю данных вследствие технических сбоев</li>
                <li>
                  Ущерб от использования загруженного пользователем контента
                </li>
                <li>Несоответствие результата ожиданиям пользователя</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Конфиденциальность
              </h2>
              <p>
                Обработка персональных данных осуществляется в соответствии с
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Политикой конфиденциальности
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Изменение условий
              </h2>
              <p>
                Компания оставляет за собой право изменять условия Соглашения. О
                существенных изменениях пользователи уведомляются за 7 дней.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Контактная информация
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p>
                  <strong>ООО «ToyBiz»</strong>
                </p>
                <p>Адрес: г. Алматы, ул. Абая 150</p>
                <p>Email: support@toybiz.kz</p>
                <p>Телефон: +7 (727) 123-45-67</p>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Дата последнего обновления:{" "}
              {new Date().toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
