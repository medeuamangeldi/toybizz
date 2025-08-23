import Image from "next/image";
import { getFileUrl } from "@/lib/url-utils";

interface PhotoGalleryProps {
  photos: string[];
  theme: {
    subtitleSize: string;
    titleFont: string;
    accent: string;
    divider: string;
    dividerStyle: string;
    photoFrame: string;
  };
}

import ThemeDivider from "./ThemeDivider";

export default function PhotoGallery({ photos, theme }: PhotoGalleryProps) {
  if (!photos?.length) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`${theme.subtitleSize} ${theme.titleFont} font-bold text-center mb-8 ${theme.accent}`}
        >
          Галерея
        </h2>

        <ThemeDivider theme={theme} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {photos.map((url, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden ${theme.photoFrame} transition-all duration-500`}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="aspect-square">
                <Image
                  src={getFileUrl(url, "photos")}
                  alt={`Фото ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
