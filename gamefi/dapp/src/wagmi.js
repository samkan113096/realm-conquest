import { http, fallback, createConfig } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { optimismSepolia, hardhat, sepolia } from 'wagmi/chains';
import addresses from './abis/addresses.json';

const chainId = Number(addresses.chainId) || sepolia.id;

const CHAIN_BY_ID = {
  [hardhat.id]: hardhat,
  [optimismSepolia.id]: optimismSepolia,
  [sepolia.id]: sepolia,
};

export const TARGET_CHAIN = CHAIN_BY_ID[chainId] || sepolia;
export const TARGET_CHAIN_ID = TARGET_CHAIN.id;

const chains = [TARGET_CHAIN, sepolia, hardhat, optimismSepolia].filter(
  (c, i, arr) => arr.findIndex(x => x.id === c.id) === i
);

export const config = createConfig({
  chains,
  connectors: [
    metaMask({ dappMetadata: { name: 'Chain Loot' } }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [optimismSepolia.id]: http('https://sepolia.optimism.io'),
    [sepolia.id]: fallback([
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://rpc.sepolia.org'),
      http('https://1rpc.io/sepolia'),
    ]),
  },
});
