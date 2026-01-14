import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function TransferToken({ token }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');    // ERC20
  const [tokenId, setTokenId] = useState('');  // ERC721
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setFrom(addr);
    })();
  }, []);

  if (!token) return null;

  async function handleTransfer() {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(token.address, token.abi, signer);

      if (token.decimals !== undefined) {
        // ERC20
        const value = ethers.parseUnits(amount || '0', token.decimals);
        const tx = await c.transfer(to, value);
        setStatus('Waiting for confirmation...');
        await tx.wait();
        setStatus('Transferred successfully.');
      } else {
        // ERC721
        const id = BigInt(tokenId);
        const tx = await c['safeTransferFrom(address,address,uint256)'](from, to, id);
        setStatus('Waiting for confirmation...');
        await tx.wait();
        setStatus('Transferred successfully.');
      }
    } catch (e) {
      setStatus(e.message || String(e));
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div>Token: <strong>{token.name}</strong> ({token.symbol})</div>
      <label>From</label>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="0x..." />
      <label>To</label>
      <input value={to} onChange={e => setTo(e.target.value)} placeholder="0x..." />
      {token.decimals !== undefined ? (
        <>
          <label>Amount ({token.symbol})</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 25" />
        </>
      ) : (
        <>
          <label>Token ID</label>
          <input value={tokenId} onChange={e => setTokenId(e.target.value)} placeholder="e.g., 0" />
        </>
      )}
      <button onClick={handleTransfer}>Send</button>
      {status && <div style={{ marginTop: 6 }}>{status}</div>}
    </div>
  );
}
