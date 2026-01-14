// maps the ERC721 token for the wallet UI
import NFT from '../Contracts/Condos.json';

const NET = '1337';

export default {
  address: NFT.networks?.[NET]?.address || '',
  decimal: 0,                   // ERC721 not divisible
  name: 'Condos',
  symbol: 'CONDOS',
  icon: 'Condos.jpg',
  abi: NFT.abi,
};
