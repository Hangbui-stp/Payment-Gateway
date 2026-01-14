import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Tokens721 from '../tokens/all721';

export default function TokenBlock721({ onSend, onApprove, onMint }) {
  const [account, setAccount] = useState('');
  const [counts, setCounts] = useState({}); // { symbol: number }

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const next = {};
      for (const t of Tokens721) {
        if (!t.address) continue;
        const c = new ethers.Contract(t.address, t.abi, provider);
        const balance = await c.balanceOf(addr);
        next[t.symbol] = Number(balance);
      }
      setCounts(next);
    })();
  }, []);

  if (!window.ethereum) return null;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Tokens721.map((t) => (
        <div key={t.symbol} style={{ padding: 12, border: '1px solid #eee', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`/assets/${t.icon || 'erc721.png'}`} alt={t.symbol} width={28} height={28} />
            <div style={{ fontWeight: 600 }}>{t.name} <small>({t.symbol})</small></div>
            <div style={{ marginLeft: 'auto' }}>{counts[t.symbol] ?? 0} owned</div>
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
