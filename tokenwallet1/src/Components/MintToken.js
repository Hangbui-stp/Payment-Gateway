import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function MintToken({ token }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');   // ERC20
  const [uri, setUri] = useState('');         // ERC721
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setTo(addr); // mặc định mint về chính mình
    })();
  }, []);

  if (!token) return null;

  async function handleMint() {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(token.address, token.abi, signer);

      // Một số ERC20 (ví dụ trong sách) có hàm mint(owner-only). Nếu contract không có, bắt lỗi đẹp.
      if (token.decimals !== undefined) {
        if (!c.mint) throw new Error('This ERC20 does not expose a public mint()');
        const value = ethers.parseUnits(amount || '0', token.decimals);
        const tx = await c.mint(to, value);
        setStatus('Waiting for confirmation...');
        await tx.wait();
        setStatus('Minted successfully.');
      } else {
        // ERC721 Condos: mint(to, uri)
        const tx = await c.mint(to, uri);
        setStatus('Waiting for confirmation...');
        await tx.wait();
        setStatus('Minted successfully.');
      }
    } catch (e) {
      setStatus(e.message || String(e));
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div>Token: <strong>{token.name}</strong> ({token.symbol})</div>
      <label>Recipient</label>
      <input value={to} onChange={e => setTo(e.target.value)} placeholder="0x..." />
      {token.decimals !== undefined ? (
        <>
          <label>Amount ({token.symbol})</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 1000" />
        </>
      ) : (
        <>
          <label>Metadata URI</label>
          <input value={uri} onChange={e => setUri(e.target.value)} placeholder="https://..." />
        </>
      )}
      <button onClick={handleMint}>Mint</button>
      {status && <div style={{ marginTop: 6 }}>{status}</div>}
    </div>
  );
}
