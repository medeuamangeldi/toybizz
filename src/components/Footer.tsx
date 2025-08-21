import React from "react";

interface FooterProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Footer({
  variant = "dark",
  className = "",
}: FooterProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`w-full py-6 ${
        isDark ? "border-t border-gray-700/30" : "border-t border-gray-200"
      } ${className}`}
    >
      <div className="max-w-4xl mx-auto text-center px-4">
        <div
          className={`flex flex-col space-y-2 text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Создано</span>
            <a
              href="https://barakae.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                isDark
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-blue-600 hover:text-blue-700"
              } transition-colors font-medium`}
            >
              Barakae
            </a>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>Связаться с автором:</span>
            <a
              href="https://t.me/medeuedem"
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                isDark
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-blue-600 hover:text-blue-700"
              } transition-colors font-medium flex items-center space-x-1`}
            >
              <span>📱</span>
              <span>Telegram</span>
            </a>
          </div>
          <div
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            © 2025 Все права защищены
          </div>
        </div>
      </div>
    </div>
  );
}
