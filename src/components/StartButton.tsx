interface StartButtonProps {
  onClick: () => void
  label?: string
}

export function StartButton({ onClick, label = 'Start Game' }: StartButtonProps) {
  return (
    <button
      type="button"
      className="start-cta"
      aria-label={label}
      onClick={onClick}
    />
  )
}
