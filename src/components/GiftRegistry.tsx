"use client";

import { useState, useEffect } from "react";

interface IGift {
  _id?: string;
  eventId: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  link?: string;
  image?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  isReserved?: boolean;
  reservedBy?: {
    name: string;
    email: string;
    phone?: string;
    reservedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface GiftRegistryProps {
  eventId: string;
  isOwner: boolean;
  editMode?: boolean; // New prop to control if we can add/edit gifts
}

const GiftRegistry: React.FC<GiftRegistryProps> = ({
  eventId,
  isOwner,
  editMode = false,
}) => {
  const [gifts, setGifts] = useState<IGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState<string | null>(null);
  const [newGift, setNewGift] = useState<{
    name: string;
    description: string;
    price: string;
    currency: string;
    link: string;
    image: string;
    category: string;
    priority: "low" | "medium" | "high";
  }>({
    name: "",
    description: "",
    price: "",
    currency: "₸",
    link: "",
    image: "",
    category: "Другое",
    priority: "medium",
  });
  const [reserveData, setReserveData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const categories = [
    "Дом",
    "Кухня",
    "Техника",
    "Украшения",
    "Одежда",
    "Хобби",
    "Другое",
  ];
  const currencies = ["₸", "$", "€", "₽"];
  const priorities = [
    { value: "low", label: "Низкий", emoji: "🟢" },
    { value: "medium", label: "Средний", emoji: "🟡" },
    { value: "high", label: "Высокий", emoji: "🔴" },
  ];

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const response = await fetch(`/api/gifts?eventId=${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setGifts(data.gifts);
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, [eventId]);

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          ...newGift,
          price: newGift.price ? parseFloat(newGift.price) : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGifts([data.gift, ...gifts]);
        setNewGift({
          name: "",
          description: "",
          price: "",
          currency: "₸",
          link: "",
          image: "",
          category: "Другое",
          priority: "medium",
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error adding gift:", error);
    }
  };

  const handleReserveGift = async (e: React.FormEvent, giftId: string) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/gifts/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          giftId,
          ...reserveData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGifts(gifts.map((gift) => (gift._id === giftId ? data.gift : gift)));
        setReserveData({ name: "", email: "", phone: "" });
        setShowReserveForm(null);
      } else {
        const error = await response.json();
        alert(error.error || "Ошибка при резервировании подарка");
      }
    } catch (error) {
      console.error("Error reserving gift:", error);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm("Удалить этот подарок?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/gifts?giftId=${giftId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGifts(gifts.filter((gift) => gift._id !== giftId));
      }
    } catch (error) {
      console.error("Error deleting gift:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render anything if there are no gifts and user is not owner and not in edit mode
  if (gifts.length === 0 && !isOwner && !editMode) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          🎁 Реестр подарков
        </h2>
        {isOwner && editMode && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {showAddForm ? "Отмена" : "Добавить подарок"}
          </button>
        )}
      </div>

      {/* Add Gift Form */}
      {isOwner && editMode && showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Добавить подарок</h3>
          <form onSubmit={handleAddGift} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={newGift.name}
                  onChange={(e) =>
                    setNewGift({ ...newGift, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={newGift.category}
                  onChange={(e) =>
                    setNewGift({ ...newGift, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={newGift.priority}
                    onChange={(e) =>
                      setNewGift({
                        ...newGift,
                        priority: e.target.value as "low" | "medium" | "high",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.emoji} {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена <span className="text-gray-400">(необязательно)</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={newGift.price}
                      onChange={(e) =>
                        setNewGift({ ...newGift, price: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10000"
                    />
                    <select
                      value={newGift.currency}
                      onChange={(e) =>
                        setNewGift({ ...newGift, currency: e.target.value })
                      }
                      className="px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={newGift.description}
                onChange={(e) =>
                  setNewGift({ ...newGift, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Описание подарка..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ссылка на товар
              </label>
              <input
                type="url"
                value={newGift.link}
                onChange={(e) =>
                  setNewGift({ ...newGift, link: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Добавить
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gifts List */}
      {gifts.length ===
      0 ? // Don't show empty state for anyone - just render nothing
      null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map((gift) => {
            const priorityInfo = priorities.find(
              (p) => p.value === gift.priority
            );

            return (
              <div
                key={gift._id}
                className={`border rounded-lg p-4 ${
                  gift.isReserved
                    ? "bg-gray-50 border-gray-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">{gift.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{priorityInfo?.emoji}</span>
                    {isOwner && editMode && (
                      <button
                        onClick={() => handleDeleteGift(gift._id!)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {gift.description && (
                    <p className="text-gray-600 text-sm">{gift.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {gift.category}
                    </span>
                    {gift.price && (
                      <span className="font-medium text-green-600 text-sm">
                        {gift.price.toLocaleString()} {gift.currency}
                      </span>
                    )}
                  </div>

                  {gift.link && (
                    <a
                      href={gift.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
                    >
                      🔗 Посмотреть в магазине
                    </a>
                  )}
                </div>

                {/* Reservation Status */}
                {gift.isReserved ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800 font-medium text-sm flex items-center gap-1">
                      ✅ Зарезервировано
                    </p>
                    {isOwner && gift.reservedBy && (
                      <div className="text-green-700 text-xs mt-1">
                        <p>{gift.reservedBy.name}</p>
                        <p>{gift.reservedBy.email}</p>
                        {gift.reservedBy.phone && (
                          <p>{gift.reservedBy.phone}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {showReserveForm === gift._id ? (
                      <form
                        onSubmit={(e) => handleReserveGift(e, gift._id!)}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          placeholder="Ваше имя"
                          value={reserveData.name}
                          onChange={(e) =>
                            setReserveData({
                              ...reserveData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded text-sm"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={reserveData.email}
                          onChange={(e) =>
                            setReserveData({
                              ...reserveData,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded text-sm"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Телефон (необязательно)"
                          value={reserveData.phone}
                          onChange={(e) =>
                            setReserveData({
                              ...reserveData,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600"
                          >
                            Зарезервировать
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReserveForm(null);
                              setReserveData({
                                name: "",
                                email: "",
                                phone: "",
                              });
                            }}
                            className="px-3 bg-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-400"
                          >
                            Отмена
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowReserveForm(gift._id!)}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        Зарезервировать
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GiftRegistry;
