export interface ThemeColor {
  key: string;
  label: string;
  swatch: string;
  palette: Record<string, string>;
}

export const PRIMARY_COLORS: ThemeColor[] = [
  {
    key: 'black', label: 'Slate', swatch: '#404040',
    palette: { 50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a' }
  },
  {
    key: 'indigo', label: 'Indigo', swatch: '#6366f1',
    palette: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',950:'#1e1b4b' }
  },
  {
    key: 'blue', label: 'Blue', swatch: '#3b82f6',
    palette: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',950:'#172554' }
  },
  {
    key: 'sky', label: 'Sky', swatch: '#0ea5e9',
    palette: { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e',950:'#082f49' }
  },
  {
    key: 'cyan', label: 'Cyan', swatch: '#06b6d4',
    palette: { 50:'#ecfeff',100:'#cffafe',200:'#a5f3fc',300:'#67e8f9',400:'#22d3ee',500:'#06b6d4',600:'#0891b2',700:'#0e7490',800:'#155e75',900:'#164e63',950:'#083344' }
  },
  {
    key: 'teal', label: 'Teal', swatch: '#14b8a6',
    palette: { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a',950:'#042f2e' }
  },
  {
    key: 'green', label: 'Emerald', swatch: '#10b981',
    palette: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b',950:'#022c22' }
  },
  {
    key: 'amber', label: 'Amber', swatch: '#f59e0b',
    palette: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f',950:'#451a03' }
  },
  {
    key: 'orange', label: 'Orange', swatch: '#fb923c',
    palette: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12',950:'#431407' }
  },
  {
    key: 'red', label: 'Rose', swatch: '#f43f5e',
    palette: { 50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337',950:'#4c0519' }
  },
  {
    key: 'hotpink', label: 'Pink', swatch: '#ec4899',
    palette: { 50:'#fdf2f8',100:'#fce7f3',200:'#fbcfe8',300:'#f9a8d4',400:'#f472b6',500:'#ec4899',600:'#db2777',700:'#be185d',800:'#9d174d',900:'#831843',950:'#500724' }
  },
  {
    key: 'pink', label: 'Fuchsia', swatch: '#d946ef',
    palette: { 50:'#fdf4ff',100:'#fae8ff',200:'#f5d0fe',300:'#f0abfc',400:'#e879f9',500:'#d946ef',600:'#c026d3',700:'#a21caf',800:'#86198f',900:'#701a75',950:'#4a044e' }
  },
  {
    key: 'purple', label: 'Violet', swatch: '#8b5cf6',
    palette: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95',950:'#2e1065' }
  },
];

export const DEFAULT_PRIMARY_COLOR_KEY = 'black';

export const SURFACE_COLORS: ThemeColor[] = [
  {
    key: 'slate', label: 'Slate', swatch: '#64748b',
    palette: { 0:'#ffffff',50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' }
  },
  {
    key: 'gray', label: 'Gray', swatch: '#6b7280',
    palette: { 0:'#ffffff',50:'#f9fafb',100:'#f3f4f6',200:'#e5e7eb',300:'#d1d5db',400:'#9ca3af',500:'#6b7280',600:'#4b5563',700:'#374151',800:'#1f2937',900:'#111827',950:'#030712' }
  },
  {
    key: 'zinc', label: 'Zinc', swatch: '#71717a',
    palette: { 0:'#ffffff',50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b',950:'#09090b' }
  },
  {
    key: 'neutral', label: 'Neutral', swatch: '#737373',
    palette: { 0:'#ffffff',50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d4d4d4',400:'#a3a3a3',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a' }
  },
  {
    key: 'stone', label: 'Stone', swatch: '#78716c',
    palette: { 0:'#ffffff',50:'#fafaf9',100:'#f5f5f4',200:'#e7e5e4',300:'#d6d3d1',400:'#a8a29e',500:'#78716c',600:'#57534e',700:'#44403c',800:'#292524',900:'#1c1917',950:'#0c0a09' }
  },
  {
    key: 'soho', label: 'Soho', swatch: '#7f8084',
    palette: { 0:'#ffffff',50:'#ececec',100:'#dedfdf',200:'#c4c4c6',300:'#adaeb0',400:'#97979b',500:'#7f8084',600:'#6a6b70',700:'#55565b',800:'#3f4046',900:'#2c2c34',950:'#16161d' }
  },
  {
    key: 'viva', label: 'Viva', swatch: '#87898a',
    palette: { 0:'#ffffff',50:'#f3f3f3',100:'#e7e7e8',200:'#cfd0d0',300:'#b7b8b9',400:'#9fa1a1',500:'#87898a',600:'#6e7173',700:'#565a5b',800:'#3e4244',900:'#262b2c',950:'#0e1315' }
  },
  {
    key: 'ocean', label: 'Ocean', swatch: '#828787',
    palette: { 0:'#ffffff',50:'#fbfcfc',100:'#F7F9F8',200:'#EFF3F2',300:'#DADEDD',400:'#B1B7B6',500:'#828787',600:'#5F7274',700:'#415B61',800:'#29444E',900:'#183240',950:'#0c1920' }
  },
];

export const DEFAULT_SURFACE_COLOR_KEY = 'neutral';

export const getPrimaryColor = (key: string | null | undefined): ThemeColor =>
  PRIMARY_COLORS.find(color => color.key === key) ?? PRIMARY_COLORS[0];

export const getSurfaceColor = (key: string | null | undefined): ThemeColor =>
  SURFACE_COLORS.find(color => color.key === key) ?? getSurfaceColor(DEFAULT_SURFACE_COLOR_KEY);

export const DEFAULT_PRIMARY_PALETTE = getPrimaryColor(DEFAULT_PRIMARY_COLOR_KEY).palette;
export const DEFAULT_SURFACE_PALETTE = getSurfaceColor(DEFAULT_SURFACE_COLOR_KEY).palette;
