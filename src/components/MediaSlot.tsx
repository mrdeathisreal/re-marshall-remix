import { useRef, useState, type DragEvent } from 'react'
import { usePersistedMedia } from '../hooks/usePersistedMedia'

interface MediaSlotProps {
  storageKey?: string
  defaultUrl?: string
}

export function MediaSlot({ storageKey = 'bg', defaultUrl }: MediaSlotProps) {
  const { state, accept } = usePersistedMedia(storageKey, { defaultUrl })
  const [dragOver, setDragOver] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const onDragLeave = (e: DragEvent) => {
    if (e.target === slotRef.current) setDragOver(false)
  }
  const onDrop = async (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await accept(file)
  }

  const openPicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) await accept(file)
    }
    input.click()
  }

  const isVideo = state.type?.startsWith('video/')
  const hasMedia = !!state.url
  const className = ['media-slot', 'bg-slot', hasMedia && 'has-media', dragOver && 'drag-over']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={slotRef}
      className={className}
      data-key={storageKey}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={openPicker}
      role="button"
      aria-label="Background media — drop image or video"
    >
      {state.url ? (
        isVideo ? (
          <video src={state.url} autoPlay loop muted playsInline preload="auto" />
        ) : (
          <img src={state.url} alt="" />
        )
      ) : null}
      <div className="empty-hint">
        Drop image or video
        <span className="sub">(videos loop automatically)</span>
      </div>
    </div>
  )
}
