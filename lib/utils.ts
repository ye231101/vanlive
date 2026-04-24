import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatMileage(mileage: number): string {
  if (mileage === 0) return '0 miles';
  return `${mileage.toLocaleString('en-US')} miles`;
}

export function formatSlideouts(slideOutsCount: number): string {
  if (slideOutsCount === 0) return '0 Slideout';
  return `${slideOutsCount} Slideout${slideOutsCount === 1 ? '' : 's'}`;
}

export function rebateEndsLabel(enddate: number): string | null {
  if (!enddate) return null;
  const d = new Date(enddate * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return `Rebate ends on ${d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export const makes = [
  { label: 'Airstream', value: 'airstream' },
  { label: 'Coachmen', value: 'coachmen' },
  { label: 'Grech RV', value: 'grech-rv' },
  { label: 'Leisure Travel Vans', value: 'leisure-travel-vans' },
  { label: 'Midwest Automotive Designs', value: 'midwest-automotive-designs' },
  { label: 'Pleasure Way', value: 'pleasure-way' },
  { label: 'Regency', value: 'regency' },
  { label: 'Roadtrek', value: 'roadtrek' },
  { label: 'Storyteller Overland', value: 'storyteller-overland' },
  { label: 'Thor Motor Coach', value: 'thor-motor-coach' },
  { label: 'Winnebago', value: 'winnebago' },
  { label: 'Other Make', value: 'other-make' },
];

export const models = [
  { label: 'ADVENTUROUS', value: 'adventurous' },
  { label: 'AMERICAN PATRIOT', value: 'american-patriot' },
  { label: 'ASCENT', value: 'ascent' },
  { label: 'BOLDT', value: 'boldt' },
  { label: 'ERA', value: 'era' },
  { label: 'ETHOS', value: 'ethos' },
  { label: 'EXPANSE', value: 'expanse' },
  { label: 'EXPANSE LI', value: 'expanse-li' },
  { label: 'GALLERIA', value: 'galleria' },
  { label: 'INTERSTATE', value: 'interstate' },
  { label: 'LEXOR TS', value: 'lexor-ts' },
  { label: 'MODE', value: 'mode' },
  { label: 'MODEL G', value: 'model-g' },
  { label: 'MODEL GX', value: 'model-gx' },
  { label: 'ONTOUR', value: 'ontour' },
  { label: 'PASSAGE', value: 'passage' },
  { label: 'PATRIOT', value: 'patriot' },
  { label: 'PATRIOT 144', value: 'patriot-144' },
  { label: 'PATRIOT CRUISER', value: 'patriot-cruiser' },
  { label: 'PLATEAU', value: 'plateau' },
  { label: 'PLATEAU FL', value: 'plateau-fl' },
  { label: 'PLATEAU TS', value: 'plateau-ts' },
  { label: 'PLATEAU XL', value: 'plateau-xl' },
  { label: 'PLAY', value: 'play' },
  { label: 'REVEL', value: 'revel' },
  { label: 'REVEL SPORT', value: 'revel-sport' },
  { label: 'RIZE', value: 'rize' },
  { label: 'ROADTREK', value: 'roadtrek' },
  { label: 'SANCTUARY', value: 'sanctuary' },
  { label: 'SCOPE', value: 'scope' },
  { label: 'SEQUENCE', value: 'sequence' },
  { label: 'SOLIS', value: 'solis' },
  { label: 'SOLIS POCKET', value: 'solis-pocket' },
  { label: 'STRADA ION TOUR', value: 'strada-ion-tour' },
  { label: 'STRADA-ION', value: 'strada-ion' },
  { label: 'STRADA-ION AWD', value: 'strada-ion-awd' },
  { label: 'SWIFT', value: 'swift' },
  { label: 'TELLARO', value: 'tellaro' },
  { label: 'TERRENO ION', value: 'terreno-ion' },
  { label: 'TRANQUILITY', value: 'tranquility' },
  { label: 'TRAVATO', value: 'travato' },
  { label: 'TURISMO-I', value: 'turismo-i' },
  { label: 'TURISMO-ION', value: 'turismo-ion' },
  { label: 'VACANZA-ION', value: 'vacanza-ion' },
  { label: 'WONDER', value: 'wonder' },
  { label: 'ZION', value: 'zion' },
];

export const inventoryTypes = [
  { label: 'New', value: 'new' },
  { label: 'Used', value: 'used' },
];

export const locations = [
  { label: 'San Diego, CA', value: 'san-diego-ca' },
  { label: 'West Sacramento, CA', value: 'west-sacramento-ca' },
  { label: 'Fremont, CA', value: 'fremont-ca' },
  { label: 'Davie, FL', value: 'davie-fl' },
  { label: 'Orlando (Sanford), FL', value: 'orlando-sanford-fl' },
  { label: 'Port St. Lucie, FL', value: 'port-st-lucie-fl' },
  { label: 'Ft. Myers, FL', value: 'ft-myers-fl' },
  { label: 'Phoenix, AZ', value: 'phoenix-az' },
  { label: 'Mesa, AZ', value: 'mesa-az' },
  { label: 'Tucson, AZ', value: 'tucson-az' },
  { label: 'Albuquerque, NM', value: 'albuquerque-nm' },
];

export function locationLabelFromValue(value: string): string {
  return locations.find((l) => l.value === value)?.label ?? '';
}

export function labelFromValue(value: string): string {
  const parts = value.split(/[-_\s]+/).filter(Boolean);
  if (parts.length === 0) return value.trim();
  return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function labelFromCustomTags(customTags: string[] | undefined, key: string): string | null {
  if (!customTags?.length) return null;
  const tag = customTags.find((t) => t.startsWith(`${key}:`));
  if (!tag) return null;
  const value = tag.split(':')[1].trim();
  if (!value) return null;
  return labelFromValue(value);
}
