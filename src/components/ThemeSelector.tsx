"use client";

import { themes } from "./themes";

const themeDisplayNames = {
  elegant: "Элегантная",
  romantic: "Романтическая",
  modern: "Современная",
  luxury: "Роскошная",
  nature: "Природная",
  vintage: "Винтажная",
  minimalist: "Минималистская",
  festive: "Праздничная",
  cosmic: "Космическая",
  bohemian: "Богемная",
} as const;

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({
  selectedTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Выберите тему:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(themes).map(([key, theme]) => (
          <div
            key={key}
            onClick={() => onThemeChange(key)}
            className={`
              cursor-pointer rounded-lg p-4 border-2 transition-all duration-300
              ${
                selectedTheme === key
                  ? "border-blue-400 ring-2 ring-blue-400 ring-opacity-50"
                  : "border-gray-600 hover:border-gray-400"
              }
            `}
          >
            {/* Theme Preview */}
            <div className={`w-full h-20 rounded-lg mb-3 ${theme.bg}`}></div>

            {/* Theme Name */}
            <div className="text-center">
              <h4 className="font-medium text-white">
                {themeDisplayNames[key as keyof typeof themeDisplayNames] ||
                  key}
              </h4>

              {/* Sample Button */}
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 text-xs rounded ${theme.button}`}
                >
                  Пример кнопки
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
