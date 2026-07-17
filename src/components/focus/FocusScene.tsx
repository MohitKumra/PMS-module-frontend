/**
 * Decorative misty mountain-lake scene with reflection.
 * Anchored to the right edge of the fullscreen focus mode.
 */
export function FocusScene() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-[62%] min-w-[520px]"
      viewBox="0 0 900 1000"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Fade the whole scene into the page background on its left edge */}
        <linearGradient id="fs-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="fs-fade-mask">
          <rect x="0" y="0" width="900" height="1000" fill="url(#fs-fade)" />
        </mask>

        <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcd6f7" />
          <stop offset="0.55" stopColor="#cfc4ef" />
          <stop offset="1" stopColor="#c3b4e8" />
        </linearGradient>

        <radialGradient id="fs-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fdf6e6" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#f8ecd9" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f8ecd9" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="fs-mtn-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b3a5e3" />
          <stop offset="1" stopColor="#c4b7ec" />
        </linearGradient>
        <linearGradient id="fs-mtn-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9d8cd9" />
          <stop offset="1" stopColor="#b2a2e3" />
        </linearGradient>
        <linearGradient id="fs-mtn-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8672cc" />
          <stop offset="1" stopColor="#9f8dda" />
        </linearGradient>

        <linearGradient id="fs-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4c9f1" />
          <stop offset="0.5" stopColor="#ddd4f4" />
          <stop offset="1" stopColor="#e6def7" />
        </linearGradient>

        <filter id="fs-reflect-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g mask="url(#fs-fade-mask)">
        {/* Sky */}
        <rect x="0" y="0" width="900" height="620" fill="url(#fs-sky)" />

        {/* Sun with glow, sitting just above the ridge line */}
        <circle cx="560" cy="470" r="210" fill="url(#fs-sun-glow)" />
        <circle cx="560" cy="470" r="72" fill="#faf0dd" opacity="0.9" />

        {/* Birds */}
        <g stroke="#7d6bbd" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M470 210 q10 -10 20 0 q10 -10 20 0" />
          <path d="M560 168 q8 -8 16 0 q8 -8 16 0" opacity="0.8" />
          <path d="M780 260 q9 -9 18 0 q9 -9 18 0" opacity="0.6" />
        </g>

        {/* Everything that reflects in the lake */}
        <g id="fs-hills">
          {/* Far mountains */}
          <path
            d="M0 620 L60 540 L150 590 L260 470 L360 570 L470 460 L580 560 L700 430 L820 555 L900 480 L900 620 Z"
            fill="url(#fs-mtn-far)"
            opacity="0.85"
          />
          {/* Mid mountains */}
          <path
            d="M120 620 L240 500 L340 590 L480 470 L620 600 L740 480 L860 590 L900 545 L900 620 L120 620 Z"
            fill="url(#fs-mtn-mid)"
            opacity="0.9"
          />
          {/* Near ridge */}
          <path
            d="M300 620 L420 545 L540 610 L680 520 L810 605 L900 560 L900 620 Z"
            fill="url(#fs-mtn-near)"
          />
          {/* Pine trees on the near ridge */}
          <g fill="#6d59b8">
            <path d="M395 620 l14 -52 l14 52 Z" />
            <path d="M401 596 l8 -30 l8 30 Z" />
            <path d="M440 620 l11 -40 l11 40 Z" />
            <path d="M445 601 l6 -22 l6 22 Z" />
            <path d="M362 620 l9 -32 l9 32 Z" />
            <path d="M735 620 l13 -48 l13 48 Z" />
            <path d="M741 598 l7 -27 l7 27 Z" />
            <path d="M778 620 l10 -36 l10 36 Z" />
            <path d="M700 620 l8 -28 l8 28 Z" />
          </g>
        </g>

        {/* Lake */}
        <rect x="0" y="620" width="900" height="380" fill="url(#fs-lake)" />

        {/* Reflection: mirrored hills, blurred + faded */}
        <g transform="translate(0 1240) scale(1 -1)" opacity="0.3" filter="url(#fs-reflect-blur)">
          <use href="#fs-hills" />
        </g>
        {/* Sun reflection shimmer */}
        <ellipse cx="560" cy="660" rx="90" ry="14" fill="#faf0dd" opacity="0.35" />
        <ellipse cx="560" cy="690" rx="60" ry="8" fill="#faf0dd" opacity="0.22" />

        {/* Soft ripple lines */}
        <g stroke="#b9a9e6" strokeWidth="3" strokeLinecap="round" opacity="0.35">
          <line x1="420" y1="730" x2="530" y2="730" />
          <line x1="600" y1="770" x2="740" y2="770" />
          <line x1="480" y1="825" x2="580" y2="825" />
          <line x1="680" y1="880" x2="820" y2="880" />
        </g>

        {/* Fade lake into page bg at the bottom */}
        <rect x="0" y="880" width="900" height="120" fill="#e9e4f8" opacity="0.6" />
      </g>
    </svg>
  );
}
