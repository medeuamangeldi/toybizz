interface LanguageSelectProps {
  selectedLanguage: string;
  onSelect: (language: string) => void;
}

export default function LanguageSelect({
  selectedLanguage,
  onSelect,
}: LanguageSelectProps) {
  const languageOptions = [
    {
      value: "русский",
      label: "Русский 🇷🇺",
      desc: "Приглашение на русском языке",
    },
    { value: "казахский", label: "Қазақша 🇰🇿", desc: "Шақыру қазақ тілінде" },
    { value: "английский", label: "English 🇺🇸", desc: "Invitation in English" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {languageOptions.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onSelect(lang.value)}
          className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 text-left ${
            selectedLanguage === lang.value
              ? "border-blue-500 bg-blue-50 shadow-lg"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-800">{lang.label}</h3>
            <p className="text-gray-600 text-sm">{lang.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
