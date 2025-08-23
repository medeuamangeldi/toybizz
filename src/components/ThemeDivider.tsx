interface ThemeDividerProps {
  theme: {
    divider: string;
    dividerStyle: string;
  };
}

type DividerStyle =
  | "hearts"
  | "natural"
  | "festive"
  | "cosmic"
  | "bohemian"
  | "vintage"
  | "ornate";

export default function ThemeDivider({ theme }: ThemeDividerProps) {
  const dividerIcon: Record<DividerStyle, string> = {
    hearts: "♥",
    natural: "🌿",
    festive: "🎉",
    cosmic: "✨",
    bohemian: "🌸",
    vintage: "❦",
    ornate: "◈",
  };

  const dividerColor: Record<DividerStyle, string> = {
    hearts: "text-rose-600",
    natural: "text-green-600",
    festive: "text-purple-600",
    cosmic: "text-purple-400",
    bohemian: "text-orange-600",
    vintage: "text-amber-800",
    ornate: "text-yellow-700",
  };

  const style = theme.dividerStyle as DividerStyle;

  return (
    <div className={`${theme.divider}`}>
      <span className={dividerColor[style]}>{dividerIcon[style]}</span>
    </div>
  );
}
