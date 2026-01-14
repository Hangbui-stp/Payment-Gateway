import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MoolahCoin from "./abis/MoolahCoin.json";
import Condos from "./abis/Condos.json";

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [moolah, setMoolah] = useState(null);
  const [condo, setCondo] = useState(null);
  const [balance, setBalance] = useState("0");
  const [showSendMC, setShowSendMC] = useState(false);
  const [showSendNFT, setShowSendNFT] = useState(false);

  // form state
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("10"); // default 10 MC
  const [gasPrice, setGasPrice] = useState("20");
  const [gasLimit, setGasLimit] = useState("200000");

  useEffect(() => {
    loadBlockchainData();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (_chainId) =>
        setChainId(parseInt(_chainId, 16))
      );
    }
  }, []);

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const _chainId = await web3.eth.getChainId();
      setChainId(_chainId);

      const networkId = await web3.eth.net.getId();

      // ERC20
      const moolahData = MoolahCoin.networks[networkId];
      if (moolahData) {
        const mc = new web3.eth.Contract(MoolahCoin.abi, moolahData.address);
        setMoolah(mc);

        const bal = await mc.methods.balanceOf(accounts[0]).call();
        const decimals = await mc.methods.decimals().call();
        setBalance((bal / 10 ** decimals).toFixed(4));
      }

      // ERC721
      const condoData = Condos.networks[networkId];
      if (condoData) {
        const cn = new web3.eth.Contract(Condos.abi, condoData.address);
        setCondo(cn);
      }
    }
  };

  const sendMC = async () => {
    if (moolah && receiver && amount) {
      try {
        const decimals = await moolah.methods.decimals().call();
        await moolah.methods
          .transfer(receiver, Web3.utils.toBN(amount * 10 ** decimals))
          .send({
            from: account,
            gas: gasLimit,
            gasPrice: Web3.utils.toWei(gasPrice, "gwei"),
          });
        alert("Transfer successful!");
        setShowSendMC(false);
        loadBlockchainData();
      } catch (e) {
        console.error(e);
        alert("Transfer failed");
      }
    }
  };

  const sendNFT = async () => {
    if (condo && receiver) {
      try {
        await condo.methods
          .safeTransferFrom(account, receiver, 1) // tokenId 1 ví dụ
          .send({ from: account, gas: gasLimit, gasPrice: Web3.utils.toWei(gasPrice, "gwei") });
        alert("NFT sent!");
        setShowSendNFT(false);
      } catch (e) {
        console.error(e);
        alert("NFT transfer failed");
      }
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: "#007bff",
          padding: "10px 20px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ margin: 0, display: "flex", alignItems: "center" }}>
          <img
            src="https://img.icons8.com/color/48/000000/token.png"
            alt="Token Wallet"
            style={{ width: "24px", height: "24px", marginRight: "8px" }}
          />
          TokenWallet
        </h3>
        <div
          style={{
            background: "white",
            color: "#007bff",
            padding: "4px 10px",
            borderRadius: "5px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "5px" }}>🌐</span> Network ID{" "}
          <span style={{ marginLeft: "5px" }}>{chainId}</span>
        </div>
      </div>

      {/* Title */}
      <h2 style={{ textAlign: "center", margin: "20px 0 10px 0", color: "#007bff" }}>
        TOKEN WALLET
        <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
          ERC20 & ERC721 Tokens
        </div>
      </h2>

      {/* 2 Columns */}
      <div style={{ display: "flex", gap: "20px", padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        {/* Left: ERC20 */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#fff",
          }}
        >
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
            <b>ETH Account:</b>{" "}
            <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
              {account}
            </span>
          </p>

          {showSendMC ? (
            <div>
              <h3 style={{ color: "#007bff", marginTop: "0" }}>SEND MC</h3>
              <input
                placeholder="Receiver Address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                <input
                  placeholder="Amount to Transfer"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <div style={{ padding: "10px", backgroundColor: "#eee", borderRadius: "4px" }}>MC</div>
              </div>
              <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                <input
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <div style={{ padding: "10px", backgroundColor: "#eee", borderRadius: "4px" }}>Gas Price(gwei)</div>
              </div>
              <div style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
                <input
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <div style={{ padding: "10px", backgroundColor: "#eee", borderRadius: "4px" }}>Gas Limit</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowSendMC(false)} style={{ padding: "8px 15px", borderRadius: "4px", border: "none", backgroundColor: "#6c757d", color: "white" }}>Back</button>
                <button onClick={sendMC} style={{ padding: "8px 15px", borderRadius: "4px", border: "none", backgroundColor: "#dc3545", color: "white" }}>Transfer</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ background: "#ff9900", color: "white", borderRadius: "50%", padding: "8px 12px", fontWeight: "bold", fontSize: "18px" }}>M</span>
                <div>
                  <b>MC</b>
                  <div>{balance}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => setShowSendMC(true)} style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #007bff", backgroundColor: "#007bff", color: "white" }}>Send</button>
                <button style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #28a745", backgroundColor: "#28a745", color: "white" }}>Approve</button>
                <button style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #17a2b8", backgroundColor: "#17a2b8", color: "white" }}>Mint</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: ERC721 */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#fff",
          }}
        >
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "15px" }}>
            <b>ETH Account:</b>{" "}
            <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
              {account}
            </span>
          </p>

          {showSendNFT ? (
            <div>
              <h3 style={{ color: "#007bff", marginTop: "0" }}>SEND NFT</h3>
              <input
                placeholder="Receiver Address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                <input
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <div style={{ padding: "10px", backgroundColor: "#eee", borderRadius: "4px" }}>Gas Price(gwei)</div>
              </div>
              <div style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
                <input
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <div style={{ padding: "10px", backgroundColor: "#eee", borderRadius: "4px" }}>Gas Limit</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setShowSendNFT(false)} style={{ padding: "8px 15px", borderRadius: "4px", border: "none", backgroundColor: "#6c757d", color: "white" }}>Back</button>
                <button onClick={sendNFT} style={{ padding: "8px 15px", borderRadius: "4px", border: "none", backgroundColor: "#dc3545", color: "white" }}>Transfer</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ background: "#808080", color: "white", borderRadius: "50%", padding: "8px 12px", fontWeight: "bold", fontSize: "18px" }}>🏠</span>
                <div>
                  <b>CONDO</b>
                  <div>ID 1 New Delhi</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "5px" }}>
                <button onClick={() => setShowSendNFT(true)} style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #007bff", backgroundColor: "#007bff", color: "white" }}>Send</button>
                <button style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #28a745", backgroundColor: "#28a745", color: "white" }}>Approve</button>
                <button style={{ padding: "8px 15px", borderRadius: "4px", border: "1px solid #17a2b8", backgroundColor: "#17a2b8", color: "white" }}>Mint</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
