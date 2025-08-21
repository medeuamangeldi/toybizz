"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("kaspi");

  const plans = [
    {
      id: "basic",
      name: "Базовый",
      price: 990,
      currency: "₸",
      type: "one-time",
      features: [
        "Создание 1 приглашения",
        "До 5 фотографий",
        "Загрузка собственной музыки",
        "10 цветовых стилей",
        "Scroll анимации",
        "Форма регистрации гостей",
        "Мобильная адаптация",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Профессиональный",
      price: 2990,
      currency: "₸",
      type: "monthly",
      features: [
        "До 100 приглашений в месяц",
        "Безлимит фотографий",
        "Собственная музыка",
        "Все цветовые стили",
        "Премиум анимации",
        "Аналитика переходов",
        "Приоритетная поддержка",
        "Без водяных знаков",
        "Экспорт статистики",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Корпоративный",
      price: 9990,
      currency: "₸",
      type: "monthly",
      features: [
        "Безлимитное количество приглашений",
        "Кастомные дизайны",
        "API интеграция",
        "Белый лейбл",
        "Персональный менеджер",
        "SLA поддержка 24/7",
        "Резервное копирование",
        "Многопользовательские аккаунты",
      ],
      popular: false,
    },
  ];

  const paymentMethods = [
    {
      id: "kaspi",
      name: "Kaspi Pay",
      icon: "💳",
      description: "Быстрая оплата через Kaspi",
    },
    {
      id: "card",
      name: "Банковская карта",
      icon: "💰",
      description: "Visa, MasterCard",
    },
    {
      id: "halyk",
      name: "Halyk Bank",
      icon: "🏪",
      description: "Оплата через Halyk",
    },
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert("Выберите тарифный план");
      return;
    }

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock success
      alert(
        `✅ Оплата прошла успешно!\nПлан: ${plan.name}\nСумма: ${plan.price}${
          plan.currency
        }\nМетод: ${paymentMethods.find((m) => m.id === paymentMethod)?.name}`
      );

      // Redirect to create invitation
      router.push("/create");
    } catch {
      alert("❌ Ошибка при обработке платежа. Попробуйте еще раз.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Выберите тарифный план
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Создавайте красивые приглашения с помощью ИИ. Выберите план, который
            подходит именно вам.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id
                  ? "ring-2 ring-blue-500 shadow-2xl"
                  : ""
              } ${plan.popular ? "scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Популярный
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex justify-center items-baseline mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-xl text-gray-500 ml-1">
                      {plan.currency}
                    </span>
                  </div>
                  <p className="text-gray-500">
                    {plan.type === "monthly" ? "в месяц" : "разовый платеж"}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {selectedPlan === plan.id ? "Выбрано ✓" : "Выбрать план"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Способ оплаты
            </h3>

            <div className="grid gap-4 mb-8">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-3xl mr-4">{method.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {method.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {method.description}
                    </div>
                  </div>
                  {paymentMethod === method.id && (
                    <span className="ml-auto text-blue-500">✓</span>
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedPlan}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💳 Оплатить {plans.find((p) => p.id === selectedPlan)?.price}
              {plans.find((p) => p.id === selectedPlan)?.currency}
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="max-w-2xl mx-auto text-center text-gray-500 text-sm">
          <p className="mb-2">🔒 Все платежи защищены SSL-шифрованием</p>
          <p>
            Нажимая &quot;Оплатить&quot;, вы соглашаетесь с{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              пользовательским соглашением
            </a>{" "}
            и{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              политикой конфиденциальности
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
