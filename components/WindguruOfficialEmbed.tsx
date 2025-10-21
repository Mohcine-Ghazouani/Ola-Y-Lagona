// components/WindguruOfficialEmbed.tsx
"use client";

type Props = {
  title?: string;
  embedUrl: string;
  height?: number | string;
};

export default function WindguruOfficialEmbed({
  title = "Morocco – Dakhla, WG",
  embedUrl,
  height = 350,
}: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">Powered by Windguru</span>
      </div>

      <div className="overflow-x-auto rounded border bg-background">
        <iframe
          
          src={embedUrl}
          width="100%"
          height={typeof height === "number" ? `${height}px` : height}
          frameBorder="0"
          scrolling="yes"
          loading="lazy"
          style={{ minWidth: 900 }}
          title={title}
        />
      </div>
    </div>
  );
}
