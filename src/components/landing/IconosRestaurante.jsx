import React from "react";

// Ilustraciones de línea propias para la landing de restaurantes.
// Usan currentColor: toman el color del texto que las rodea.
const base = (size, children, extra = {}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...extra}
  >
    {children}
  </svg>
);

const ICONOS = {
  coctel: (s) =>
    base(
      s,
      <>
        <path d="M9 10h30L24 27z" />
        <path d="M24 27v13" />
        <path d="M16 41h16" />
        <path d="M13.5 15h21" />
        <circle cx="31" cy="8" r="3" />
        <path d="M29 11l-4 5" />
      </>,
    ),
  mundo: (s) =>
    base(
      s,
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="M8 24h32" />
        <path d="M24 8c4.5 4.5 6.5 10 6.5 16s-2 11.5-6.5 16" />
        <path d="M24 8c-4.5 4.5-6.5 10-6.5 16s2 11.5 6.5 16" />
        <path d="M11 15h26M11 33h26" />
      </>,
    ),
  huella: (s) =>
    base(
      s,
      <>
        <path d="M24 26c-5 0-10 5.5-10 10 0 3 2.5 4.5 5 4 2-.4 3.2-1.5 5-1.5s3 1.1 5 1.5c2.5.5 5-1 5-4 0-4.5-5-10-10-10z" />
        <ellipse cx="14" cy="20" rx="3.2" ry="4.2" />
        <ellipse cx="34" cy="20" rx="3.2" ry="4.2" />
        <ellipse cx="19.5" cy="12" rx="3" ry="4" />
        <ellipse cx="28.5" cy="12" rx="3" ry="4" />
      </>,
    ),
  reloj: (s) =>
    base(
      s,
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="M24 14v10l7 4" />
      </>,
    ),
  ubicacion: (s) =>
    base(
      s,
      <>
        <path d="M24 42s13-11.5 13-22a13 13 0 1 0-26 0c0 10.5 13 22 13 22z" />
        <circle cx="24" cy="20" r="4.5" />
      </>,
    ),
  carta: (s) =>
    base(
      s,
      <>
        <path d="M10 9h20a6 6 0 0 1 6 6v24H16a6 6 0 0 1-6-6z" />
        <path d="M36 15h2v24" />
        <path d="M16 17h14M16 23h14M16 29h9" />
      </>,
    ),
  calendario: (s) =>
    base(
      s,
      <>
        <rect x="8" y="11" width="32" height="29" rx="4" />
        <path d="M8 19h32M17 7v8M31 7v8" />
        <path d="M18 29l4 4 8-8" />
      </>,
    ),
  pastel: (s) =>
    base(
      s,
      <>
        <rect x="10" y="24" width="28" height="15" rx="3" />
        <path d="M10 31c3 2 6 2 9 0s6-2 9 0 6 2 10 0" />
        <path d="M18 24v-5M24 24v-5M30 24v-5" />
        <path d="M18 14.5c-1-1.5 0-3 0-3s1 1.5 0 3zM24 14.5c-1-1.5 0-3 0-3s1 1.5 0 3zM30 14.5c-1-1.5 0-3 0-3s1 1.5 0 3z" />
      </>,
    ),
  telefono: (s) =>
    base(
      s,
      <path d="M17 8l-6 3c-1.5 10 10 25.5 26 26l3-6-7-4-3.5 3.5c-4-1.5-8.5-6-10-10L23 17z" />,
    ),
};

const IconoRestaurante = ({ nombre, size = 40, className = "" }) => {
  const dibujar = ICONOS[nombre];
  if (!dibujar) return null;
  return <span className={className}>{dibujar(size)}</span>;
};

export default IconoRestaurante;
