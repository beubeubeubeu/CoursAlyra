'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SimpleStorage } from './simpleStorage.js';
export default function Home() {
  return (
    <>
      <ConnectButton />
      <SimpleStorage />
    </>
  )
}