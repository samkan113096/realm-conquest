import { formatEther, maxUint256 } from 'viem';
import addresses from './abis/addresses.json';

export const TARGET_CHAIN_ID = Number(addresses.chainId) || 11155111;

/** MetaMask shows "gas limit too high" for many reverts — surface the real reason */
export function formatContractError(e) {
  const raw =
    e?.cause?.shortMessage ||
    e?.cause?.message ||
    e?.shortMessage ||
    e?.details ||
    e?.message ||
    'Transaction failed';
  const msg = String(raw);
  if (/user rejected|denied/i.test(msg)) return 'Cancelled in MetaMask';
  if (/insufficient funds/i.test(msg)) return 'Need Sepolia ETH for gas — try https://sepoliafaucet.com';
  if (/Payment failed/i.test(msg)) return 'LOOT payment failed — earn LOOT from Zombie Siege or receive a community airdrop';
  if (/Hero resting/i.test(msg)) return 'Hero on 30s cooldown — wait half a minute and fight again';
  if (/Already claimed/i.test(msg)) return 'This airdrop was already claimed';
  if (/Mint cap|max per wallet/i.test(msg)) return 'Wallet mint limit reached for this NFT type';
  if (/wrong network|chain mismatch/i.test(msg)) return 'Switch MetaMask to Ethereum Sepolia (chain 11155111)';
  if (/gas limit too high/i.test(msg)) return 'Transaction would fail on-chain — check LOOT balance, network (Sepolia), and hero cooldown';
  return msg.replace(/^ContractFunction\w+Error:\s*/i, '').slice(0, 220);
}

/** Strip simulation gas — passing huge gas triggers MetaMask "gas limit too high" */
export function writeFromSimulation(writeContractAsync, simRequest) {
  return writeContractAsync({
    chainId: TARGET_CHAIN_ID,
    address: simRequest.address,
    abi: simRequest.abi,
    functionName: simRequest.functionName,
    args: simRequest.args,
    value: simRequest.value,
  });
}

export async function simulateAndWrite({
  publicClient,
  writeContractAsync,
  account,
  request,
  onStatus,
  label = 'Confirm in MetaMask…',
}) {
  if (!account || !publicClient) throw new Error('Connect wallet on Sepolia first');

  onStatus?.(label);
  const { request: simReq } = await publicClient.simulateContract({
    account,
    ...request,
  });
  const hash = await writeFromSimulation(writeContractAsync, simReq);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

/** Approve LOOT if needed, simulate mint, then send */
export async function approveAndMint({
  publicClient,
  writeContractAsync,
  account,
  tokenAddress,
  tokenAbi,
  spender,
  amount,
  targetAddress,
  targetAbi,
  mintFunctionName,
  onStatus,
}) {
  if (!account || !publicClient) throw new Error('Connect wallet on Sepolia first');

  const balance = await publicClient.readContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [account],
  });
  if (balance < amount) {
    throw new Error(
      `Need ${formatEther(amount)} LOOT — you have ${formatEther(balance)}. Dashboard → Daily Faucet (10 LOOT).`,
    );
  }

  const allowance = await publicClient.readContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: 'allowance',
    args: [account, spender],
  });

  if (allowance < amount) {
    onStatus?.('Step 1/2: Approve LOOT in MetaMask…');
    const { request: approveReq } = await publicClient.simulateContract({
      account,
      address: tokenAddress,
      abi: tokenAbi,
      functionName: 'approve',
      args: [spender, maxUint256],
    });
    const approveHash = await writeFromSimulation(writeContractAsync, approveReq);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  onStatus?.('Step 2/2: Confirm mint in MetaMask…');
  const { request: mintReq } = await publicClient.simulateContract({
    account,
    address: targetAddress,
    abi: targetAbi,
    functionName: mintFunctionName,
    args: [],
  });
  const mintHash = await writeFromSimulation(writeContractAsync, mintReq);
  await publicClient.waitForTransactionReceipt({ hash: mintHash });
}
