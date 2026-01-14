import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Tokens20 from '../tokens/all20';

export default function TokenBlock20({ onSend, onApprove, onMint }) {
  const [account, setAccount] = useState('');
  const [balances, setBalances] = useState({}); // { symbol: '123.45' }

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const next = {};
      for (const t of Tokens20) {
        if (!t.address) continue; // chưa migrate
        const c = new ethers.Contract(t.address, t.abi, provider);
        const raw = await c.balanceOf(addr);
        next[t.symbol] = ethers.formatUnits(raw, t.decimals ?? 18);
      }
      setBalances(next);
    })();
  }, []);

  if (!window.ethereum) return null;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Tokens20.map((t) => (
        <div key={t.symbol} style={{ padding: 12, border: '1px solid #eee', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`/assets/${t.icon || 'erc20.png'}`} alt={t.symbol} width={28} height={28} />
            <div style={{ fontWeight: 600 }}>{t.name} <small>({t.symbol})</small></div>
            <div style={{ marginLeft: 'auto' }}>
              {balances[t.symbol] ?? '--'} {t.symbol}
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={() => onSend?.(t, account)}>Send</button>
            <button onClick={() => onApprove?.(t, account)}>Approve</button>
            <button onClick={() => onMint?.(t, account)}>Mint</button>
          </div>
        </div>
      ))}
    </div>
  );
}
