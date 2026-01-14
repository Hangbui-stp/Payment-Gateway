import React from "react";
import { ethers } from "ethers";
import CondosABI from "../Condos.json";  // ABI contract của bạn

const contractAddress = "0x494a1De4Fc8C3057D827C46710718fe4B356D9dD"; // đổi theo contract bạn deploy

function MintNFT() {
  // Kết nối MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  };

  // Lấy contract với signer
  const getContract = async (signer) => {
    return new ethers.Contract(contractAddress, CondosABI.abi, signer);
  };

  // Mint NFT
  const mintNFT = async (tokenURI) => {
    try {
      const { signer } = await connectWallet();
      if (!signer) return;

      const contract = await getContract(signer);

      // Mint NFT cho ví hiện tại
      const tx = await contract.createNFT(await signer.getAddress(), tokenURI);
      console.log("Transaction sent:", tx.hash);

      // Chờ giao dịch mined
      await tx.wait();
      console.log("NFT minted successfully!");
      alert("NFT minted! TokenID đầu tiên là 0 (nếu là mint đầu tiên)");
    } catch (err) {
      console.error("Mint failed:", err);
      alert("Mint failed: " + err.message);
    }
  };

  return (
    <div>
      <h2>Mint Your NFT</h2>
      <button
        onClick={() =>
          mintNFT("https://example.com/nft1.json") // thay bằng URL metadata hợp lệ
        }
      >
        Mint NFT
      </button>
    </div>
  );
}

export default MintNFT;
