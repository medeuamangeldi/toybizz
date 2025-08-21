export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Политика конфиденциальности
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Общие положения
              </h2>
              <p>
                Настоящая Политика конфиденциальности (далее — «Политика»)
                определяет порядок обработки персональных данных пользователей
                сервиса ToyBiz (далее — «Сервис») компанией ООО «ToyBiz» (далее
                — «Компания»).
              </p>
              <p>
                Мы серьезно относимся к защите ваших персональных данных и
                обеспечиваем их безопасность в соответствии с требованиями
                законодательства Республики Казахстан.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Какие данные мы собираем
              </h2>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                2.1 Личные данные:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>Имя и фамилия</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Платежная информация (в зашифрованном виде)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                2.2 Контент пользователя:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>Загружаемые фотографии</li>
                <li>Музыкальные файлы</li>
                <li>Информация о мероприятиях</li>
                <li>Созданные приглашения</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                2.3 Техническая информация:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>IP-адрес</li>
                <li>Тип браузера и операционной системы</li>
                <li>Данные о действиях в сервисе</li>
                <li>Файлы cookie и аналогичные технологии</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Цели обработки данных
              </h2>
              <p>Мы используем ваши данные для:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Предоставления услуг по созданию приглашений</li>
                <li>Обработки платежей и ведения учета</li>
                <li>Предоставления технической поддержки</li>
                <li>Улучшения качества сервиса</li>
                <li>Отправки уведомлений о статусе заказа</li>
                <li>Соблюдения требований законодательства</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Правовые основания обработки
              </h2>
              <p>Обработка персональных данных осуществляется на основании:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Согласия субъекта персональных данных</li>
                <li>Исполнения договора с пользователем</li>
                <li>Соблюдения правовых обязательств</li>
                <li>Законных интересов Компании</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Хранение данных
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  🗄️ Способы хранения:
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong>Основные данные:</strong> MongoDB Atlas (облачная
                    база данных)
                  </li>
                  <li>
                    <strong>Файлы:</strong> MongoDB GridFS с шифрованием
                  </li>
                  <li>
                    <strong>Резервные копии:</strong> автоматическое
                    резервирование каждые 24 часа
                  </li>
                  <li>
                    <strong>Географическое расположение:</strong> серверы в ЕС с
                    соблюдением GDPR
                  </li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Сроки хранения:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  Данные пользователя: до запроса на удаление или 3 года
                  неактивности
                </li>
                <li>
                  Платежная информация: в соответствии с требованиями
                  финансового законодательства (5 лет)
                </li>
                <li>Созданные приглашения: до запроса на удаление</li>
                <li>Логи и аналитика: 12 месяцев</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Передача данных третьим лицам
              </h2>
              <p>Мы можем передавать ваши данные следующим третьим лицам:</p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                6.1 Партнеры по обработке платежей:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>Kaspi Pay — для обработки платежей через Kaspi</li>
                <li>Halyk Bank — для банковских операций</li>
                <li>Платежные системы Visa/MasterCard</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                6.2 Технические партнеры:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>MongoDB Atlas — хранение данных</li>
                <li>
                  OpenAI — обработка запросов ИИ (без передачи личных данных)
                </li>
                <li>Vercel — хостинг приложения</li>
              </ul>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p>
                  <strong>⚠️ Важно:</strong> Мы никогда не продаем ваши
                  персональные данные третьим лицам!
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Безопасность данных
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    🔒 Технические меры:
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>SSL/TLS шифрование</li>
                    <li>Шифрование базы данных</li>
                    <li>Регулярные обновления безопасности</li>
                    <li>Многофакторная аутентификация</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📋 Организационные меры:
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Ограниченный доступ к данным</li>
                    <li>Обучение сотрудников</li>
                    <li>Регулярный аудит безопасности</li>
                    <li>План реагирования на инциденты</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Ваши права
              </h2>
              <p>В соответствии с законодательством, вы имеете право:</p>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📋 Права доступа:
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Получать информацию о обработке данных</li>
                    <li>Получать копию ваших данных</li>
                    <li>Знать, кому передаются данные</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ✏️ Права управления:
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Изменять неточные данные</li>
                    <li>Удалять ваши данные</li>
                    <li>Ограничивать обработку</li>
                    <li>Отозвать согласие</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p>
                  <strong>📧 Для реализации прав обращайтесь:</strong>
                </p>
                <p>Email: privacy@toybiz.kz</p>
                <p>Срок рассмотрения: до 30 дней</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Cookies и аналогичные технологии
              </h2>
              <p>Мы используем следующие типы cookies:</p>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">🍪 Необходимые cookies</h4>
                  <p className="text-sm text-gray-600">
                    Обеспечивают работу основных функций сайта
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">📊 Аналитические cookies</h4>
                  <p className="text-sm text-gray-600">
                    Помогают анализировать использование сайта (можно отключить)
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">🎯 Функциональные cookies</h4>
                  <p className="text-sm text-gray-600">
                    Запоминают ваши предпочтения и настройки
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Изменения в политике
              </h2>
              <p>
                При изменении Политики конфиденциальности мы уведомим вас по
                электронной почте не менее чем за 10 дней до вступления
                изменений в силу.
              </p>
              <p>Существенные изменения требуют вашего повторного согласия.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Контакты по вопросам конфиденциальности
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">
                  Ответственный за обработку персональных данных:
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Компания:</strong> ООО «ToyBiz»
                  </p>
                  <p>
                    <strong>Адрес:</strong> 050000, г. Алматы, ул. Абая 150,
                    офис 25
                  </p>
                  <p>
                    <strong>Email по вопросам конфиденциальности:</strong>{" "}
                    privacy@toybiz.kz
                  </p>
                  <p>
                    <strong>Email технической поддержки:</strong>{" "}
                    support@toybiz.kz
                  </p>
                  <p>
                    <strong>Телефон:</strong> +7 (727) 123-45-67
                  </p>
                  <p>
                    <strong>Время работы:</strong> Пн-Пт 9:00-18:00 (GMT+6)
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center border-t pt-8">
            <p className="text-gray-500 text-sm mb-2">
              <strong>Дата последнего обновления:</strong>{" "}
              {new Date().toLocaleDateString("ru-RU")}
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Версия документа:</strong> 1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
