import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** light = dark sidebar (white plate); dark = light surfaces. */
  variant?: "light" | "dark";
  className?: string;
  linked?: boolean;
};

const LOGO_SRC = "/branding/dba-logo.jpg";
const LOGO_WIDTH = 2442;
const LOGO_HEIGHT = 808;

export function Logo({
  variant = "light",
  className = "",
  linked = true,
}: LogoProps) {
  const isSidebar = variant === "light";

  const image = (
    <Image
      src={LOGO_SRC}
      alt="DBA advies"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className="h-auto w-full object-contain"
    />
  );

  const plate = isSidebar ? (
    <span className="block w-full rounded-lg bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      {image}
    </span>
  ) : (
    <span className="block w-full max-w-[220px]">{image}</span>
  );

  if (!linked) {
    return <span className={`inline-block ${className}`}>{plate}</span>;
  }

  return (
    <Link
      href="/"
      className={`inline-block w-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isSidebar
          ? "focus-visible:ring-dba-lime/80 focus-visible:ring-offset-dba-dark-green"
          : "focus-visible:ring-dba-dark-green focus-visible:ring-offset-white"
      } ${className}`}
      aria-label="DBA advies"
    >
      {plate}
    </Link>
  );
}
