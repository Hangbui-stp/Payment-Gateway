// maps the ERC20 token for the wallet UI

import MC from '../Contracts/MoolahCoin.json';

const NET = '1337'; // Ganache chain id

export default {
  address: MC.networks?.[NET]?.address || '',
  decimal: 4,                   // matches your ERC20 decimals()
  name: 'Moolah Coin',
  symbol: 'MC',
  icon: 'MoolahCoin.png',       // put an image in /public or /src/assets and adjust path if needed
  abi: MC.abi,
};
