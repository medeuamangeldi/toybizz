import Image from "next/image";
import { useState, useEffect } from "react";

interface QRShareSectionProps {
  data: {
    type: string;
    title: string;
  };
  theme: {
    subtitleSize: string;
    titleFont: string;
    accent: string;
    divider: string;
    dividerStyle: string;
    card: string;
    font: string;
    button: string;
  };
}

import ThemeDivider from "./ThemeDivider";

export default function QRShareSection({ data, theme }: QRShareSectionProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        window.location.href
      )}`;
      setQrCodeUrl(url);
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Приглашение на ${data.type}`,
        text: `Приглашаю вас на ${data.type}! ${data.title}`,
        url: window.location.href,
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`${theme.subtitleSize} ${theme.titleFont} font-bold mb-8 ${theme.accent}`}
        >
          Поделиться приглашением
        </h2>

        <ThemeDivider theme={theme} />

        <div className={`${theme.card} p-8 max-w-md mx-auto`}>
          <div className="mb-6">
            <div className="w-40 h-40 mx-auto bg-white border-2 border-gray-300 rounded-lg p-2">
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="QR код приглашения"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="text-xs text-gray-600">
                      QR код
                      <br />
                      загружается...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className={`${theme.font} text-sm opacity-75 mb-4`}>
            Отсканируйте QR-код, чтобы поделиться приглашением
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleShare}
              className={`${theme.button} text-sm w-full`}
            >
              📤 Поделиться
            </button>
            <button
              onClick={handleCopyLink}
              className={`${theme.button} text-sm w-full opacity-80 hover:opacity-100`}
            >
              🔗 Копировать ссылку
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
