import { clearMedia } from '../lib/media-db'

export function ResetMediaButton() {
  const onClick = async () => {
    try {
      await clearMedia()
    } finally {
      location.reload()
    }
  }
  return (
    <button type="button" className="reset-media" onClick={onClick}>
      Reset media
    </button>
  )
}
