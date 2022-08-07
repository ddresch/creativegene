import React, { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'
import { useAccount } from 'wagmi'
import CreateGene from '../components/CreateGene'
import Image from 'next/image'

const Home: NextPage = () => {
  const { isConnected } = useAccount()

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ padding: '24px 24px 24px 0' }}>
            
            <Image src="/logo.png" alt="creativegene Logo" width={128} height={128} />
            
            <h1>creativegene</h1>
            
            <ConnectButton />

            {isConnected && (<>
              <CreateGene />
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home
