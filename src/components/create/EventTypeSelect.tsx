interface EventTypeSelectProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export default function EventTypeSelect({
  selectedType,
  onSelect,
}: EventTypeSelectProps) {
  const eventTypes = [
    { value: "свадьба", label: "Свадьба 💒", emoji: "💒" },
    { value: "день рождения", label: "День рождения 🎂", emoji: "🎂" },
    { value: "юбилей", label: "Юбилей 🎉", emoji: "🎉" },
    { value: "корпоратив", label: "Корпоратив 🏢", emoji: "🏢" },
    { value: "вечеринка", label: "Вечеринка 🎊", emoji: "🎊" },
    { value: "поминки", label: "Поминки 🕊️", emoji: "🕊️" },
    { value: "другое", label: "Другое 🎭", emoji: "🎭" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {eventTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 text-left ${
            selectedType === type.value
              ? "border-blue-500 bg-blue-50 shadow-lg"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{type.emoji}</span>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{type.label}</h3>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
