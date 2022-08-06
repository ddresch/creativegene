import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'
import { useAccount } from 'wagmi'
import litProcess from '../components/Lit'
import UploadFiles from '../components/UploadFiles'
import CreateGene from '../components/CreateGene'

const Home: NextPage = () => {
  const { isConnected } = useAccount()

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ padding: '24px 24px 24px 0' }}>
            
            <h1>creativegene</h1>
            
            <ConnectButton />

            {isConnected && (<>
              <button
                style={{ marginTop: 24 }}
                className="button"
                onClick={async () => {
                  await litProcess()
                }}
              >
                Lit Test
              </button>
              <UploadFiles />
              <CreateGene />
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home
