import { AppSettings, CharmDefinition } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  selectedCharm: 'mandala',
  positionPreset: 'top-center',
  customOffsetX: 0,
  monitorId: 'primary',
  animationEnabled: true,
  animationIntensity: 'medium',
  stringLength: 260,
  dampingFactor: 0.022,
  soundEnabled: true,
  soundVolume: 65,
  alwaysOnTop: true,
  startWithWindows: false,
  isVisible: true,
  charmScale: 1.0
};

export const CHARM_DEFINITIONS: CharmDefinition[] = [
  {
    id: 'mandala',
    name: 'Imperial Mandala',
    subtitle: 'Prosperity & Divine Harmony',
    description: 'Traditional crimson lacquer medallion with 24K gold filigree floral petals, ruby jewel center, and chiming brass bells.',
    primaryColor: '#d90429',
    accentColor: '#e6b422',
    badge: 'Traditional Indian'
  },
  {
    id: 'mystic-knot',
    name: 'Feng Shui Mystic Knot',
    subtitle: 'Endless Good Fortune & Health',
    description: 'Auspicious endless knot intertwined in scarlet silk cord with an authentic embossed Qing Dynasty brass coin and double silk tassel.',
    primaryColor: '#b22222',
    accentColor: '#d4af37',
    badge: 'Asian Auspicious'
  },
  {
    id: 'ganesha',
    name: 'Royal Golden Ganesha',
    subtitle: 'Remover of Obstacles & Blessings',
    description: 'Exquisite 24K gold relief medallion depicting Lord Ganesha, framed by radiating lotus leaves and hanging lustrous pearl droplets.',
    primaryColor: '#e6b422',
    accentColor: '#ff4d4d',
    badge: 'Sacred Gold'
  },
  {
    id: 'nazar',
    name: 'Protective Nazar Eye',
    subtitle: 'Ward Against Negative Energy',
    description: 'Handcrafted glass amulet with deep cobalt, cyan, and pearl white enamel set within a filigree sunburst gold talisman.',
    primaryColor: '#1d4ed8',
    accentColor: '#38bdf8',
    badge: 'Protective Amulet'
  },
  {
    id: 'blue-nazar',
    name: 'Blue Nazar Eye',
    subtitle: 'Wards Off Jealousy & Negative Gazes',
    description: 'Authentic Mediterranean cobalt glass Nazar talisman with deep sapphire glaze, concentric white and turquoise rings, and dark protective pupil.',
    primaryColor: '#0038a8',
    accentColor: '#00b4d8',
    badge: 'Authentic Glass'
  },
  {
    id: 'horned-mask',
    name: 'Drishti Bommai',
    subtitle: 'Fierce Protector Against Evil',
    description: 'Traditional temple guardian Mahakala / Drishti mask with sacred horns, fierce eyes, third-eye tilak, and protective scorpion tongue.',
    primaryColor: '#0284c7',
    accentColor: '#e11d48',
    badge: 'Temple Guardian'
  }
];

export const WINDOW_CONFIG = {
  DANGLE_WIDTH: 500,
  DANGLE_HEIGHT: 560,
  SETTINGS_WIDTH: 560,
  SETTINGS_HEIGHT: 680
};
