export type MenuKey = 'main' | 'bonuses' | 'options' | 'store' | 'exit'

export interface MenuItem {
  key: MenuKey
  label: string
  desc: string
}

export const MENU_ITEMS: MenuItem[] = [
  {
    key: 'main',
    label: 'Main Story',
    desc: 'Play through the main story and face the past.',
  },
  {
    key: 'bonuses',
    label: 'Bonuses',
    desc: 'View unlockable content and extras.',
  },
  {
    key: 'options',
    label: 'Options',
    desc: 'Adjust audio, video, and controls.',
  },
  {
    key: 'store',
    label: 'Online Store',
    desc: 'Browse additional content online.',
  },
  {
    key: 'exit',
    label: 'Exit',
    desc: 'Return to the desktop.',
  },
]
