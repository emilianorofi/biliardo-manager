import clsx from "clsx";

export default function CountryFlag({
  code,
  label,
  className,
}: {
  code: string;
  label: string;
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={`Bandiera di ${label}`}
      viewBox="0 0 24 16"
      className={clsx(
        "h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/20",
        className
      )}
      shapeRendering="geometricPrecision"
    >
      <FlagArtwork code={code} />
    </svg>
  );
}

function FlagArtwork({ code }: { code: string }) {
  switch (code) {
    case "ITA":
      return <Vertical colors={["#009246", "#fff", "#ce2b37"]} />;
    case "ARG":
      return (
        <>
          <Horizontal colors={["#74acdf", "#fff", "#74acdf"]} />
          <circle cx="12" cy="8" r="1.6" fill="#f6b40e" />
        </>
      );
    case "GER":
      return <Horizontal colors={["#111", "#dd0000", "#ffce00"]} />;
    case "URU":
      return (
        <>
          <rect width="24" height="16" fill="#fff" />
          {[3.2, 6.4, 9.6, 12.8].map((y) => (
            <rect key={y} y={y} width="24" height="1.6" fill="#0038a8" />
          ))}
          <rect width="8" height="8" fill="#fff" />
          <circle cx="4" cy="4" r="1.7" fill="#fcd116" />
        </>
      );
    case "FRA":
      return <Vertical colors={["#002395", "#fff", "#ed2939"]} />;
    case "DEN":
      return <Nordic base="#c60c30" cross="#fff" />;
    case "BEL":
      return <Vertical colors={["#111", "#fdda24", "#ef3340"]} />;
    case "LUX":
      return <Horizontal colors={["#ed2939", "#fff", "#00a1de"]} />;
    case "SUI":
      return (
        <>
          <rect width="24" height="16" fill="#d52b1e" />
          <rect x="10" y="3" width="4" height="10" fill="#fff" />
          <rect x="7" y="6" width="10" height="4" fill="#fff" />
        </>
      );
    case "CZE":
      return (
        <>
          <Horizontal colors={["#fff", "#d7141a"]} />
          <path d="M0 0 10 8 0 16Z" fill="#11457e" />
        </>
      );
    case "AUT":
      return <Horizontal colors={["#ed2939", "#fff", "#ed2939"]} />;
    case "SMR":
      return (
        <>
          <Horizontal colors={["#fff", "#5eb6e4"]} />
          <circle cx="12" cy="8" r="1.7" fill="#d4af37" />
          <circle cx="12" cy="8" r="1" fill="#4b8b3b" />
        </>
      );
    case "BRA":
      return (
        <>
          <rect width="24" height="16" fill="#009c3b" />
          <path d="M12 2 21 8 12 14 3 8Z" fill="#ffdf00" />
          <circle cx="12" cy="8" r="3" fill="#002776" />
        </>
      );
    case "NED":
      return <Horizontal colors={["#ae1c28", "#fff", "#21468b"]} />;
    case "ESP":
      return <Horizontal colors={["#aa151b", "#f1bf00", "#aa151b"]} />;
    case "NOR":
      return <Nordic base="#ba0c2f" cross="#fff" inner="#00205b" />;
    case "POR":
      return (
        <>
          <rect width="9.5" height="16" fill="#046a38" />
          <rect x="9.5" width="14.5" height="16" fill="#da291c" />
          <circle cx="9.5" cy="8" r="2.2" fill="#ffcd00" />
          <circle cx="9.5" cy="8" r="1.2" fill="#fff" />
        </>
      );
    case "SWE":
      return <Nordic base="#006aa7" cross="#fecc02" />;
    case "ALB":
      return (
        <>
          <rect width="24" height="16" fill="#e41e20" />
          <path d="m12 3 1.3 2.2 2.6-.7-1.2 2.2 1.9 1.7-2.7.2.4 3-2.3-1.5-2.3 1.5.4-3-2.7-.2 1.9-1.7-1.2-2.2 2.6.7Z" fill="#111" />
        </>
      );
    case "LIE":
      return (
        <>
          <Horizontal colors={["#002b7f", "#ce1126"]} />
          <path d="M3 3.2h4l-.6 2.2H3.6Z" fill="#ffd83d" />
          <circle cx="3.4" cy="2.8" r=".5" fill="#ffd83d" />
          <circle cx="5" cy="2.4" r=".5" fill="#ffd83d" />
          <circle cx="6.6" cy="2.8" r=".5" fill="#ffd83d" />
        </>
      );
    case "TUR":
      return (
        <>
          <rect width="24" height="16" fill="#e30a17" />
          <circle cx="9" cy="8" r="4" fill="#fff" />
          <circle cx="10.5" cy="8" r="3.2" fill="#e30a17" />
          <path d="m15 5.6.7 1.4 1.6.2-1.2 1 .4 1.6-1.5-.8-1.4.8.3-1.6-1.1-1 1.6-.2Z" fill="#fff" />
        </>
      );
    case "COL":
      return (
        <>
          <rect width="24" height="8" fill="#fcd116" />
          <rect y="8" width="24" height="4" fill="#003893" />
          <rect y="12" width="24" height="4" fill="#ce1126" />
        </>
      );
    case "KOR":
      return (
        <>
          <rect width="24" height="16" fill="#fff" />
          <path d="M8.8 8a3.2 3.2 0 0 1 6.4 0Z" fill="#cd2e3a" />
          <path d="M8.8 8a3.2 3.2 0 0 0 6.4 0Z" fill="#0047a0" />
          <path d="M3 3h4M3 4.2h4M17 11.8h4M17 13h4" stroke="#111" strokeWidth=".7" />
        </>
      );
    case "JPN":
      return (
        <>
          <rect width="24" height="16" fill="#fff" />
          <circle cx="12" cy="8" r="4" fill="#bc002d" />
        </>
      );
    case "EGY":
      return (
        <>
          <Horizontal colors={["#ce1126", "#fff", "#111"]} />
          <circle cx="12" cy="8" r="1.2" fill="#c09300" />
        </>
      );
    default:
      return (
        <>
          <rect width="24" height="16" fill="#64748b" />
          <path d="M4 12 12 4l8 8" fill="none" stroke="#fff" strokeWidth="2" />
        </>
      );
  }
}

function Horizontal({ colors }: { colors: string[] }) {
  const height = 16 / colors.length;

  return (
    <>
      {colors.map((color, index) => (
        <rect
          key={`${color}-${index}`}
          y={index * height}
          width="24"
          height={height}
          fill={color}
        />
      ))}
    </>
  );
}

function Vertical({ colors }: { colors: string[] }) {
  const width = 24 / colors.length;

  return (
    <>
      {colors.map((color, index) => (
        <rect
          key={`${color}-${index}`}
          x={index * width}
          width={width}
          height="16"
          fill={color}
        />
      ))}
    </>
  );
}

function Nordic({
  base,
  cross,
  inner,
}: {
  base: string;
  cross: string;
  inner?: string;
}) {
  return (
    <>
      <rect width="24" height="16" fill={base} />
      <rect x="7" width="4" height="16" fill={cross} />
      <rect y="6" width="24" height="4" fill={cross} />
      {inner && (
        <>
          <rect x="8" width="2" height="16" fill={inner} />
          <rect y="7" width="24" height="2" fill={inner} />
        </>
      )}
    </>
  );
}
