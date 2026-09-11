import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '../build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Generate an SVG for Lucky Dangle Icon
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a0d0d"/>
      <stop offset="70%" stop-color="#140606"/>
      <stop offset="100%" stop-color="#080202"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2a3"/>
      <stop offset="35%" stop-color="#e6b422"/>
      <stop offset="70%" stop-color="#c59218"/>
      <stop offset="100%" stop-color="#845b08"/>
    </linearGradient>
    <radialGradient id="rubyGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff6b6b"/>
      <stop offset="40%" stop-color="#d90429"/>
      <stop offset="85%" stop-color="#7a0014"/>
      <stop offset="100%" stop-color="#3d000a"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background circle -->
  <rect width="256" height="256" rx="60" fill="url(#bgGrad)"/>
  <rect width="252" height="252" x="2" y="2" rx="58" fill="none" stroke="url(#goldGrad)" stroke-width="3" opacity="0.6"/>

  <!-- Hanging Cord -->
  <path d="M 128 0 L 128 70" stroke="url(#goldGrad)" stroke-width="4" stroke-linecap="round"/>
  <path d="M 125 0 L 125 70" stroke="#b22222" stroke-width="2"/>
  <path d="M 131 0 L 131 70" stroke="#b22222" stroke-width="2"/>

  <!-- Top Golden Bead -->
  <circle cx="128" cy="40" r="10" fill="url(#goldGrad)" filter="url(#glow)"/>
  <circle cx="125" cy="37" r="3" fill="#ffffff" opacity="0.8"/>

  <!-- Center Crimson Bead -->
  <circle cx="128" cy="62" r="14" fill="url(#rubyGrad)"/>
  <circle cx="128" cy="62" r="14" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>
  <circle cx="124" cy="58" r="4" fill="#ffffff" opacity="0.7"/>

  <!-- Lower Golden Bead -->
  <circle cx="128" cy="84" r="9" fill="url(#goldGrad)"/>
  <circle cx="126" cy="82" r="2.5" fill="#ffffff" opacity="0.8"/>

  <!-- Connector Ring -->
  <circle cx="128" cy="100" r="8" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>

  <!-- Main Auspicious Medallion -->
  <g transform="translate(128, 155)">
    <!-- Outer Glow -->
    <circle cx="0" cy="0" r="48" fill="none" stroke="#e6b422" stroke-width="4" opacity="0.4" filter="url(#glow)"/>
    <!-- Outer Ring -->
    <circle cx="0" cy="0" r="46" fill="url(#goldGrad)"/>
    <circle cx="0" cy="0" r="41" fill="url(#rubyGrad)"/>
    <circle cx="0" cy="0" r="41" fill="none" stroke="url(#goldGrad)" stroke-width="2"/>

    <!-- Filigree Petals -->
    <g stroke="url(#goldGrad)" stroke-width="2" fill="none">
      <circle cx="0" cy="-24" r="8"/>
      <circle cx="17" cy="-17" r="8"/>
      <circle cx="24" cy="0" r="8"/>
      <circle cx="17" cy="17" r="8"/>
      <circle cx="0" cy="24" r="8"/>
      <circle cx="-17" cy="17" r="8"/>
      <circle cx="-24" cy="0" r="8"/>
      <circle cx="-17" cy="-17" r="8"/>
    </g>

    <!-- Center Ruby -->
    <circle cx="0" cy="0" r="18" fill="url(#goldGrad)"/>
    <circle cx="0" cy="0" r="14" fill="url(#rubyGrad)"/>
    <circle cx="-4" cy="-4" r="4" fill="#ffffff" opacity="0.9"/>
  </g>

  <!-- Hanging Bells / Tassels -->
  <g stroke="url(#goldGrad)" stroke-width="2">
    <!-- Center Bell -->
    <line x1="128" y1="202" x2="128" y2="225"/>
    <path d="M 122 225 C 122 220, 134 220, 134 225 Z" fill="url(#goldGrad)"/>
    <circle cx="128" cy="229" r="4" fill="url(#rubyGrad)"/>

    <!-- Left Bell -->
    <line x1="102" y1="192" x2="102" y2="215"/>
    <circle cx="102" cy="218" r="4" fill="url(#goldGrad)"/>

    <!-- Right Bell -->
    <line x1="154" y1="192" x2="154" y2="215"/>
    <circle cx="154" cy="218" r="4" fill="url(#goldGrad)"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(buildDir, 'icon.svg'), iconSvg);
console.log('Saved build/icon.svg');
