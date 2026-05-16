import { useEffect } from 'react'
import { MENU_ITEMS, type MenuItem } from './menu-items'

interface MenuProps {
  activeIndex: number
  onActiveChange: (i: number) => void
  onConfirm: (item: MenuItem) => void
}

export function Menu({ activeIndex, onActiveChange, onConfirm }: MenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        onActiveChange((activeIndex + 1) % MENU_ITEMS.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onActiveChange((activeIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
      } else if (k === 'f' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onConfirm(MENU_ITEMS[activeIndex])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, onActiveChange, onConfirm])

  return (
    <nav className="menu" aria-label="Main menu">
      <ol>
        {MENU_ITEMS.map((item, i) => (
          <li
            key={item.key}
            data-key={item.key}
            className={i === activeIndex ? 'active' : undefined}
            onMouseEnter={() => onActiveChange(i)}
            onClick={() => {
              onActiveChange(i)
              onConfirm(item)
            }}
          >
            {item.label}
          </li>
        ))}
      </ol>
    </nav>
  )
}
