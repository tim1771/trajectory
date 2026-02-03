// Nature soundscapes for focus and meditation
export const SOUNDSCAPES = [
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: '🌊',
    url: 'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3',
    pillar: 'mental',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: '🌧️',
    url: 'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3',
    pillar: 'mental',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: '🌲',
    url: 'https://assets.mixkit.co/active_storage/sfx/134/134-preview.mp3',
    pillar: 'spiritual',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    icon: '🔥',
    url: 'https://assets.mixkit.co/active_storage/sfx/2382/2382-preview.mp3',
    pillar: 'environmental',
  },
  {
    id: 'wind',
    name: 'Gentle Wind',
    icon: '🍃',
    url: 'https://assets.mixkit.co/active_storage/sfx/2394/2394-preview.mp3',
    pillar: 'environmental',
  },
] as const;

export type SoundscapeId = typeof SOUNDSCAPES[number]['id'];
