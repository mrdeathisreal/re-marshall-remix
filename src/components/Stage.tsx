import type { CSSProperties, PropsWithChildren } from 'react'
import { useStageScale } from '../hooks/useStageScale'

export function Stage({ children }: PropsWithChildren) {
  const scale = useStageScale()
  const style = { '--stage-scale': scale } as CSSProperties
  return (
    <div className="viewport">
      <div className="stage" style={style}>
        {children}
      </div>
    </div>
  )
}
