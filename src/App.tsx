/*!
 * Resident Evil: Requiem — Marshall Remix
 * Copyright (c) 2026 Marshall Nguyễn Hoàng Huy (mrdeathisreal). All rights reserved.
 * Licensed for portfolio review only. No redistribution. See LICENSE.
 * https://github.com/mrdeathisreal/re-marshall-remix
 */
import { useCallback, useRef, useState } from 'react'
import { Stage } from './components/Stage'
import { MediaSlot } from './components/MediaSlot'
import { Menu } from './components/Menu'
import { StartButton } from './components/StartButton'
import { FlashOverlay, type FlashHandle } from './components/FlashOverlay'
import { ResetMediaButton } from './components/ResetMediaButton'
import { Grain, LeftDarken } from './components/Chrome'
import { TitleImage } from './components/TitleImage'
import { FooterLeft } from './components/FooterLeft'
import { Watermark } from './components/Watermark'
import { MENU_ITEMS, type MenuItem } from './components/menu-items'
import './styles/menu.css'

const DEFAULT_BG = `${import.meta.env.BASE_URL}assets/test-bg.png`
const MAIN_INDEX = 0

export default function App() {
  const flashRef = useRef<FlashHandle>(null)
  const [activeIndex, setActiveIndex] = useState(MAIN_INDEX)

  const onConfirm = useCallback<(item: MenuItem) => void>((item) => {
    flashRef.current?.pulse()
    console.log('Confirm:', item.key)
    // Wire to your routing / scene-load here.
    // Keys: main | bonuses | options | store | exit
  }, [])

  const onStart = useCallback(() => {
    setActiveIndex(MAIN_INDEX)
    onConfirm(MENU_ITEMS[MAIN_INDEX])
  }, [onConfirm])

  return (
    <>
      <Stage>
        <MediaSlot storageKey="bg" defaultUrl={DEFAULT_BG} />
        <LeftDarken />
        <TitleImage />
        <StartButton onClick={onStart} />
        <Menu
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
          onConfirm={onConfirm}
        />
        <FooterLeft desc={MENU_ITEMS[activeIndex].desc} />
        <Watermark />
        <Grain />
        <FlashOverlay ref={flashRef} />
      </Stage>
      <ResetMediaButton />
    </>
  )
}
