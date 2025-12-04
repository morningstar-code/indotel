"use client";

interface CountryFlagProps {
  flag: string; // puede ser emoji o nombre de archivo (ej: "argentina.png")
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

export default function CountryFlag({ flag, size = "md", className = "" }: CountryFlagProps) {
  const isImage = flag.endsWith('.png') || flag.endsWith('.jpg') || flag.endsWith('.jpeg') || flag.endsWith('.svg');

  const pixelSize = size === 'sm' ? 24 : size === 'md' ? 36 : 48;

  if (isImage) {
    // Usa bandera local desde /public/flags/{flag}
    return (
      <span className={className}>
        <img
          src={`/flags/${flag}`}
          alt="Bandera del país"
          style={{
            width: pixelSize,
            height: pixelSize,
            borderRadius: 4,
            objectFit: 'cover',
            boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.6)'
          }}
        />
      </span>
    );
  }

  // Fallback a emoji si no es imagen
  return (
    <span 
      className={`${sizeClasses[size]} ${className} inline-block leading-none`}
      role="img"
      aria-label="bandera"
      style={{ 
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", "EmojiOne Mozilla", "Twemoji Mozilla", "Noto Emoji", sans-serif',
        lineHeight: '1',
        display: 'inline-block',
        fontSize: size === 'sm' ? '1.5rem' : size === 'md' ? '2.5rem' : '3rem',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {flag}
    </span>
  );
}

