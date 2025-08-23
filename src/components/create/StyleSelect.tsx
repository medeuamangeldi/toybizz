interface StyleSelectProps {
  selectedStyle: string;
  customStyle: string;
  onStyleSelect: (style: string) => void;
  onCustomStyleChange: (style: string) => void;
}

export default function StyleSelect({
  selectedStyle,
  customStyle,
  onStyleSelect,
  onCustomStyleChange,
}: StyleSelectProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {styleOptions.map((style) => (
        <div key={style.value}>
          <button
            onClick={() => onStyleSelect(style.value)}
            className={`w-full p-4 rounded-2xl border-2 transition-all transform hover:scale-105 text-left ${
              selectedStyle === style.value
                ? "border-blue-500 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <h3 className="font-bold text-md text-gray-800 mb-2">
              {style.label}
            </h3>
            <p className="text-gray-600 text-sm">{style.desc}</p>
          </button>

          {selectedStyle === "custom" && style.value === "custom" && (
            <div className="mt-4">
              <textarea
                value={customStyle}
                onChange={(e) => onCustomStyleChange(e.target.value)}
                placeholder="Опишите желаемый стиль приглашения..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
