import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PollarProvider } from '@pollar/react'

const pollarConfig = {
  apiKey: 'pk_test_ogalandlord_stellar',
  stellarNetwork: 'testnet' as const,
}

const appConfig = {
  application: {
    name: 'OgaLandlord',
    network: 'testnet' as const,
    chains: ['STELLAR' as const],
    walletProvisioning: 'AT_LOGIN' as const,
    walletCustodyMode: 'INTERNAL' as const,
  },
  styles: {
    theme: 'dark',
    accentColor: '#10b981',
    emailEnabled: true,
    embeddedWallets: true,
    smartWallet: true,
    providers: {
      google: true,
      github: true,
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PollarProvider client={pollarConfig} appConfig={appConfig}>
      <App />
    </PollarProvider>
  </StrictMode>,
)
