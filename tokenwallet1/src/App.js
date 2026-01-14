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
  const [tokenId, setTokenId] = useState("");

  // UI toggle
  const [showSendMC, setShowSendMC] = useState(false);
  const [showSendCondo, setShowSendCondo] = useState(false);
  const [showMintCondo, setShowMintCondo] = useState(false);

  // ERC20 form state
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  // ERC721 form state
  const [receiverCondo, setReceiverCondo] = useState("");
  const [mintCity, setMintCity] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        connectBlockchain();
      });
      window.ethereum.on("accountsChanged", () => {
        connectBlockchain();
      });
    }
  }, []);

  const connectBlockchain = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const cid = await web3.eth.getChainId();
        setChainId(cid);

        if (cid !== 1337) {
          alert(`Please switch MetaMask to Ganache network (chainId 1337).`);
          return;
        }

        // MoolahCoin contract
        const mcAddress = "0x19064161082B0A95b5D6Ee9fE72a31d5d956B44E";
        const mc = new web3.eth.Contract(MoolahCoin.abi, mcAddress);
        setMoolah(mc);

        // Condos contract
        const cnAddress = "0x494a1De4Fc8C3057D827C46710718fe4B356D9dD";
        const cn = new web3.eth.Contract(Condos.abi, cnAddress);
        setCondo(cn);

        // Load balances
        const bal = await mc.methods.balanceOf(accounts[0]).call();
        setBalance(web3.utils.fromWei(bal, "ether"));

        const ownedTokens = await cn.methods.balanceOf(accounts[0]).call();
        if (parseInt(ownedTokens) > 0) {
          const firstTokenId = await cn.methods.tokenOfOwnerByIndex(accounts[0], 0).call();
          setTokenId(firstTokenId);
        }
      } catch (err) {
        console.error("Error connecting blockchain:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const sendMC = async () => {
    if (moolah && receiver && amount) {
      try {
        await moolah.methods
          .transfer(receiver, Web3.utils.toWei(amount, "ether"))
          .send({ from: account });
        const bal = await moolah.methods.balanceOf(account).call();
        setBalance(Web3.utils.fromWei(bal, "ether"));
        alert("MC transfer successful!");
      } catch (e) {
        console.error(e);
        alert("Transfer failed");
      }
    }
  };

  const sendCondo = async () => {
    if (condo && receiverCondo && tokenId) {
      try {
        await condo.methods
          .safeTransferFrom(account, receiverCondo, tokenId)
          .send({ from: account });
        alert("Condo transfer successful!");
      } catch (e) {
        console.error(e);
        alert("Transfer failed");
      }
    }
  };

  const mintCondo = async () => {
    if (condo && receiverCondo && mintCity) {
      try {
        await condo.methods
          .mint(receiverCondo, mintCity)
          .send({ from: account });
        alert("Mint condo successful!");
      } catch (e) {
        console.error(e);
        alert("Mint failed");
      }
    }
  };

  // Reusable input
  const InputWithUnit = ({ value, onChange, placeholder, unit }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: unit ? "4px 0 0 4px" : "4px",
          outline: "none",
        }}
      />
      {unit && (
        <div
          style={{
            backgroundColor: "#e0e0e0",
            padding: "10px",
            border: "1px solid #ccc",
            borderLeft: "0",
            borderRadius: "0 4px 4px 0",
            fontSize: "12px",
            color: "#555",
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );

  const ActionButton = ({ label, onClick }) => (
    <button
      style={{
        padding: "8px 15px",
        border: "2px solid #ff69b4",
        borderRadius: "4px",
        cursor: "pointer",
        backgroundColor: "white",
        color: "#ff69b4",
        fontWeight: "bold",
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );

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
        <div style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
          {account ? (
            <>
              <div
                style={{
                  backgroundColor: "white",
                  color: "#007bff",
                  padding: "4px 10px",
                  borderTopLeftRadius: "5px",
                  borderBottomLeftRadius: "5px",
                  borderRight: "1px solid #007bff",
                }}
              >
                {chainId}
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  color: "#007bff",
                  padding: "4px 10px",
                  borderTopRightRadius: "5px",
                  borderBottomRightRadius: "5px",
                }}
              >
                Network
              </div>
            </>
          ) : (
            <button onClick={connectBlockchain} style={{ padding: "6px 12px", cursor: "pointer" }}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: "center", margin: "20px 0 10px 0", color: "#007bff" }}>
        TOKEN WALLET
        <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
          ERC20Tokens & ERC721Tokens
        </div>
      </h2>

      {account && (
        <div style={{ display: "flex", gap: "20px", padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
          {/* ERC20 */}
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
              <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{account}</span>
            </p>

            {showSendMC ? (
              <div>
                <InputWithUnit value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Receiver Address" />
                <InputWithUnit value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to Transfer" unit="MC" />

                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={() => setShowSendMC(false)} style={{ padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>Back</button>
                  <ActionButton label="Transfer" onClick={sendMC} />
                </div>
              </div>
            ) : (
              <div style={{ border: "1px solid #e0e0e0", padding: "15px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ background: "#ff9900", color: "white", borderRadius: "50%", padding: "8px 12px", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>M</span>
                  <div>
                    <b style={{ fontSize: "16px" }}>MC</b>
                    <div style={{ fontSize: "14px", color: "#333" }}>{parseFloat(balance).toFixed(4)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <ActionButton label="Send" onClick={() => setShowSendMC(true)} />
                  <ActionButton label="Approve" onClick={() => alert("Approve not implemented")} />
                  <ActionButton label="Mint" onClick={() => alert("Mint not implemented")} />
                </div>
              </div>
            )}
          </div>

          {/* ERC721 */}
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
              <span style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{account}</span>
            </p>

            {showSendCondo ? (
              <div>
                <InputWithUnit value={receiverCondo} onChange={(e) => setReceiverCondo(e.target.value)} placeholder="Receiver Address" />
                <InputWithUnit value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Token ID" unit="CONDO" />

                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={() => setShowSendCondo(false)} style={{ padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>Back</button>
                  <ActionButton label="Transfer" onClick={sendCondo} />
                </div>
              </div>
            ) : showMintCondo ? (
              <div>
                <InputWithUnit value={receiverCondo} onChange={(e) => setReceiverCondo(e.target.value)} placeholder="Receiver Address" />
                <InputWithUnit value={mintCity} onChange={(e) => setMintCity(e.target.value)} placeholder="City" />

                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={() => setShowMintCondo(false)} style={{ padding: "8px 15px", border: "none", borderRadius: "4px", cursor: "pointer", backgroundColor: "#6c757d", color: "white" }}>Back</button>
                  <ActionButton label="Mint" onClick={mintCondo} />
                </div>
              </div>
            ) : (
              <div style={{ border: "1px solid #e0e0e0", padding: "15px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span style={{ background: "#808080", color: "white", borderRadius: "50%", padding: "8px 12px", fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>🏠</span>
                  <div>
                    <b style={{ fontSize: "16px" }}>CONDO</b>
                    <div style={{ fontSize: "14px", color: "#333" }}>{tokenId ? `ID ${tokenId}` : "No token"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <ActionButton label="Send" onClick={() => setShowSendCondo(true)} />
                  <ActionButton label="Approve" onClick={() => alert("Approve not implemented")} />
                  <ActionButton label="Mint" onClick={() => setShowMintCondo(true)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
