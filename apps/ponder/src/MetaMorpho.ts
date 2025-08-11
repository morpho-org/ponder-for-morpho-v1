import { ponder } from "ponder:registry";
import {
  vault,
  vaultConfigItem,
  vaultSupplyQueueItem,
  vaultWithdrawQueueItem,
} from "ponder:schema";
import { Address, erc20Abi, Hex, zeroAddress } from "viem";

/**
 * @dev The following events are ignored:
 * - `AccrueInterest(uint256,uint256)` because `Transfer` is sufficient
 * - `Approval(address,address,uint256)` because it's not relevant to any tracked state
 * - `Deposit(address,address,uint256,uint256)` because it's not relevant to any tracked state
 * - `ReallocateSupply(address,Id,uint256,uint256)` because position relations are sufficient
 * - `ReallocateWithdraw(address,Id,uint256,uint256)1 because position relations are sufficient
 * - `Skim(address,address,uint256)` because it's not relevant to any tracked state
 * - `Withdraw(address,address,address,uint256,uint256)` because `Transfer` is sufficient
 *
 * @todo Update handlers for the following events if you want to track users' balances:
 * - Transfer(address,address,uint256)
 */

ponder.on("MetaMorphoFactory:CreateMetaMorpho", async ({ event, context }) => {
  const decimalsUnderlying = await context.client.readContract({
    abi: erc20Abi,
    address: event.args.asset,
    functionName: "decimals",
  });
  const decimalsOffset = Math.max(0, 18 - decimalsUnderlying);

  await context.db.insert(vault).values({
    // primary key
    chainId: context.chain.id,
    address: event.args.metaMorpho,
    // immutables
    asset: event.args.asset,
    decimalsUnderlying,
    decimalsOffset,
    owner: event.args.initialOwner,
    timelock: event.args.initialTimelock,
    name: event.args.name,
    symbol: event.args.symbol,
  });
});

/*//////////////////////////////////////////////////////////////
                            OWNERSHIP
//////////////////////////////////////////////////////////////*/

ponder.on("MetaMorpho:OwnershipTransferStarted", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ pendingOwner: event.args.newOwner });
});

ponder.on("MetaMorpho:OwnershipTransferred", async ({ event, context }) => {
  // TODO: This may error because it's emitted in the vault's constructor
  try {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set({ owner: event.args.newOwner, pendingOwner: zeroAddress });
  } catch (e) {
    if (String(e).includes("No existing record found in table 'vault'")) return;
    throw e instanceof Error ? e : new Error(String(e));
  }
});

/*//////////////////////////////////////////////////////////////
                              SUBMIT
//////////////////////////////////////////////////////////////*/

ponder.on("MetaMorpho:SubmitCap", async ({ event, context }) => {
  const { timelock } = (await context.db.find(vault, {
    chainId: context.chain.id,
    address: event.log.address,
  })) ?? { timelock: 0n };

  // Row may or may not exist yet, so we have to upsert
  await context.db
    .insert(vaultConfigItem)
    .values({
      // primary key
      chainId: context.chain.id,
      address: event.log.address,
      marketId: event.args.id,
      // values
      pendingCap: event.args.cap,
      pendingCapValidAt: event.block.timestamp + timelock,
      enabled: false,
      removableAt: 0n,
    })
    .onConflictDoUpdate({
      pendingCap: event.args.cap,
      pendingCapValidAt: event.block.timestamp + timelock,
    });
});

ponder.on("MetaMorpho:SubmitGuardian", async ({ event, context }) => {
  const { timelock } = (await context.db.find(vault, {
    chainId: context.chain.id,
    address: event.log.address,
  })) ?? { timelock: 0n };

  await context.db.update(vault, { chainId: context.chain.id, address: event.log.address }).set({
    pendingGuardian: event.args.newGuardian,
    pendingGuardianValidAt: event.block.timestamp + timelock,
  });
});

ponder.on("MetaMorpho:SubmitMarketRemoval", async ({ event, context }) => {
  const { timelock } = (await context.db.find(vault, {
    chainId: context.chain.id,
    address: event.log.address,
  })) ?? { timelock: 0n };

  await context.db
    .update(vaultConfigItem, {
      chainId: context.chain.id,
      address: event.log.address,
      marketId: event.args.id,
    })
    .set({ removableAt: event.block.timestamp + timelock });
});

ponder.on("MetaMorpho:SubmitTimelock", async ({ event, context }) => {
  const { timelock } = (await context.db.find(vault, {
    chainId: context.chain.id,
    address: event.log.address,
  })) ?? { timelock: 0n };

  await context.db.update(vault, { chainId: context.chain.id, address: event.log.address }).set({
    pendingTimelock: event.args.newTimelock,
    pendingTimelockValidAt: event.block.timestamp + timelock,
  });
});

/*//////////////////////////////////////////////////////////////
                              REVOKE
//////////////////////////////////////////////////////////////*/

ponder.on("MetaMorpho:RevokePendingCap", async ({ event, context }) => {
  // Row may or may not exist yet, so we have to upsert
  await context.db
    .insert(vaultConfigItem)
    .values({
      // primary key
      chainId: context.chain.id,
      address: event.log.address,
      marketId: event.args.id,
      // values
      pendingCap: 0n,
      pendingCapValidAt: 0n,
      enabled: false,
      removableAt: 0n,
    })
    .onConflictDoUpdate({ pendingCap: 0n, pendingCapValidAt: 0n });
});

ponder.on("MetaMorpho:RevokePendingGuardian", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ pendingGuardian: zeroAddress, pendingGuardianValidAt: 0n });
});

ponder.on("MetaMorpho:RevokePendingMarketRemoval", async ({ event, context }) => {
  // Row may or may not exist yet, so we have to upsert
  await context.db
    .insert(vaultConfigItem)
    .values({
      // primary key
      chainId: context.chain.id,
      address: event.log.address,
      marketId: event.args.id,
      // values
      pendingCap: 0n,
      pendingCapValidAt: 0n,
      enabled: false,
      removableAt: 0n,
    })
    .onConflictDoUpdate({ removableAt: 0n });
});

ponder.on("MetaMorpho:RevokePendingTimelock", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ pendingTimelock: 0n, pendingTimelockValidAt: 0n });
});

/*//////////////////////////////////////////////////////////////
                              SET
//////////////////////////////////////////////////////////////*/

ponder.on("MetaMorpho:SetCap", async ({ event, context }) => {
  await context.db
    .update(vaultConfigItem, {
      chainId: context.chain.id,
      address: event.log.address,
      marketId: event.args.id,
    })
    .set({
      cap: event.args.cap,
      pendingCap: 0n,
      pendingCapValidAt: 0n,
      ...(event.args.cap > 0n ? { enabled: true, removableAt: 0n } : {}),
    });
});

ponder.on("MetaMorpho:SetCurator", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ curator: event.args.newCurator });
});

ponder.on("MetaMorpho:SetFee", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ fee: event.args.newFee });
});

ponder.on("MetaMorpho:SetFeeRecipient", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ feeRecipient: event.args.newFeeRecipient });
});

ponder.on("MetaMorpho:SetGuardian", async ({ event, context }) => {
  await context.db.update(vault, { chainId: context.chain.id, address: event.log.address }).set({
    guardian: event.args.guardian,
    pendingGuardian: zeroAddress,
    pendingGuardianValidAt: 0n,
  });
});

ponder.on("MetaMorpho:SetIsAllocator", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set((row) => {
      const set = new Set(row.allocators);
      if (event.args.isAllocator) {
        set.add(event.args.allocator);
      } else {
        set.delete(event.args.allocator);
      }
      return { allocators: [...set] };
    });
});

ponder.on("MetaMorpho:SetName", async ({ event, context }) => {
  // This may error because it's emitted in the vault's constructor
  try {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set({ name: event.args.name });
  } catch (e) {
    if (String(e).includes("No existing record found in table 'vault'")) return;
    throw e instanceof Error ? e : new Error(String(e));
  }
});

ponder.on("MetaMorpho:SetSkimRecipient", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ skimRecipient: event.args.newSkimRecipient });
});

ponder.on("MetaMorpho:SetSymbol", async ({ event, context }) => {
  // This may error because it's emitted in the vault's constructor
  try {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set({ symbol: event.args.symbol });
  } catch (e) {
    if (String(e).includes("No existing record found in table 'vault'")) return;
    throw e instanceof Error ? e : new Error(String(e));
  }
});

ponder.on("MetaMorpho:SetTimelock", async ({ event, context }) => {
  // This may error because it's emitted in the vault's constructor
  try {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set({ timelock: event.args.newTimelock, pendingTimelock: 0n, pendingTimelockValidAt: 0n });
  } catch (e) {
    if (String(e).includes("No existing record found in table 'vault'")) return;
    throw e instanceof Error ? e : new Error(String(e));
  }
});

ponder.on("MetaMorpho:SetSupplyQueue", async ({ event, context }) => {
  let length = 0;
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set((row) => {
      length = row.supplyQueueLength;
      return { supplyQueueLength: event.args.newSupplyQueue.length };
    });

  const values = getQueueItems(
    context.chain.id,
    event.log.address,
    length,
    event.args.newSupplyQueue,
  );

  await context.db
    .insert(vaultSupplyQueueItem)
    .values(values)
    .onConflictDoUpdate((row) => ({ marketId: values.at(row.ordinal)?.marketId ?? null }));
});

ponder.on("MetaMorpho:SetWithdrawQueue", async ({ event, context }) => {
  let length = 0;
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set((row) => {
      length = row.withdrawQueueLength;
      return { withdrawQueueLength: event.args.newWithdrawQueue.length };
    });

  const values = getQueueItems(
    context.chain.id,
    event.log.address,
    length,
    event.args.newWithdrawQueue,
  );

  await context.db
    .insert(vaultWithdrawQueueItem)
    .values(values)
    .onConflictDoUpdate((row) => ({ marketId: values.at(row.ordinal)?.marketId ?? null }));
});

/*//////////////////////////////////////////////////////////////
                          SHARES/ASSETS
//////////////////////////////////////////////////////////////*/

ponder.on("MetaMorpho:Transfer", async ({ event, context }) => {
  if (event.args.from === zeroAddress) {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set((row) => ({ totalSupply: row.totalSupply + event.args.value }));
  } else if (event.args.to === zeroAddress) {
    await context.db
      .update(vault, { chainId: context.chain.id, address: event.log.address })
      .set((row) => ({ totalSupply: row.totalSupply - event.args.value }));
  }
});

ponder.on("MetaMorpho:UpdateLastTotalAssets", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ lastTotalAssets: event.args.updatedTotalAssets });
});

ponder.on("MetaMorpho:UpdateLostAssets", async ({ event, context }) => {
  await context.db
    .update(vault, { chainId: context.chain.id, address: event.log.address })
    .set({ lostAssets: event.args.newLostAssets });
});

/*//////////////////////////////////////////////////////////////
                           [HELPERS]
//////////////////////////////////////////////////////////////*/

function getQueueItems<T>(
  chainId: T,
  address: Address,
  oldLength: number,
  newQueue: readonly Hex[],
) {
  return Array.from({ length: Math.max(oldLength, newQueue.length) }).map((_, ordinal) => ({
    chainId,
    address,
    ordinal,
    marketId: newQueue.at(ordinal) ?? null,
  }));
}
