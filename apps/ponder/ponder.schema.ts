import { index, onchainTable, primaryKey, relations } from "ponder";
import { zeroAddress } from "viem";

/*//////////////////////////////////////////////////////////////
                            MARKETS
//////////////////////////////////////////////////////////////*/

export const market = onchainTable(
  "market",
  (t) => ({
    chainId: t.integer().notNull(),
    id: t.hex().notNull(),

    // MarketParams fields
    loanToken: t.hex().notNull(),
    collateralToken: t.hex().notNull(),
    oracle: t.hex().notNull(),
    irm: t.hex().notNull(),
    lltv: t.bigint().notNull(),

    // Market fields
    totalSupplyAssets: t.bigint().notNull().default(0n),
    totalSupplyShares: t.bigint().notNull().default(0n),
    totalBorrowAssets: t.bigint().notNull().default(0n),
    totalBorrowShares: t.bigint().notNull().default(0n),
    lastUpdate: t.bigint().notNull(),
    fee: t.bigint().notNull().default(0n),

    // AdaptiveCurveIrm fields
    rateAtTarget: t.bigint().notNull().default(0n),
  }),
  (table) => ({
    // Composite primary key uniquely identifies a market across chains
    pk: primaryKey({ columns: [table.chainId, table.id] }),
  }),
);

export const marketRelations = relations(market, ({ many }) => ({
  positions: many(position),
  relatedVaultConfigs: many(vaultConfigItem),
  relatedVaultSupplyQueues: many(vaultSupplyQueueItem),
  relatedVaultWithdrawQueues: many(vaultWithdrawQueueItem),
  relatedPreLiquidations: many(preLiquidation),
}));

/*//////////////////////////////////////////////////////////////
                            POSITIONS
//////////////////////////////////////////////////////////////*/

export const position = onchainTable(
  "position",
  (t) => ({
    chainId: t.integer().notNull(),
    marketId: t.hex().notNull(),
    user: t.hex().notNull(),

    // Position fields
    supplyShares: t.bigint().notNull().default(0n),
    borrowShares: t.bigint().notNull().default(0n),
    collateral: t.bigint().notNull().default(0n),
  }),
  (table) => ({
    // Composite primary key uniquely identifies a position across chains
    pk: primaryKey({ columns: [table.chainId, table.marketId, table.user] }),
    // Index speeds up relational queries
    marketIdx: index().on(table.chainId, table.marketId),
  }),
);

export const positionRelations = relations(position, ({ one }) => ({
  market: one(market, {
    fields: [position.chainId, position.marketId],
    references: [market.chainId, market.id],
  }),
}));

/*//////////////////////////////////////////////////////////////
                          AUTHORIZATIONS
//////////////////////////////////////////////////////////////*/

export const authorization = onchainTable(
  "authorization",
  (t) => ({
    chainId: t.integer().notNull(),
    authorizer: t.hex().notNull(),
    authorizee: t.hex().notNull(),
    isAuthorized: t.boolean().notNull().default(false),
  }),
  (table) => ({
    // Composite primary key uniquely identifies an authorization across chains
    pk: primaryKey({ columns: [table.chainId, table.authorizer, table.authorizee] }),
    // Indexes speed up relational queries
    authorizerIdx: index().on(table.chainId, table.authorizer),
    authorizeeIdx: index().on(table.chainId, table.authorizee),
  }),
);

/*//////////////////////////////////////////////////////////////
                              VAULTS
//////////////////////////////////////////////////////////////*/

export const vault = onchainTable(
  "vault",
  (t) => ({
    chainId: t.integer().notNull(),
    address: t.hex().notNull(),

    // Immutables
    asset: t.hex().notNull(),
    decimalsUnderlying: t.integer().notNull(),
    decimalsOffset: t.integer().notNull(),

    // Storage
    // ⛌ slot 0: _balances mapping(address => uint256)
    // ⛌ slot 1: _allowances mapping(address => mapping(address => uint256))
    totalSupply: t.bigint().notNull().default(0n), // slot 2: _totalSupply uint256
    // ⛌ slot 3: _name string
    // ⛌ slot 4: _symbol string
    // ⛌ slot 5: _nameFallback string
    // ⛌ slot 6: _versionFallback string
    // ⛌ slot 7: _nonces mapping(address => uint256)
    owner: t.hex().notNull(), // slot 8: _owner address
    pendingOwner: t.hex().notNull().default(zeroAddress), // slot 9: _pendingOwner address
    curator: t.hex().notNull().default(zeroAddress), // slot 10: curator address
    allocators: t.hex().array().notNull().default([]), // slot 11: isAllocator mapping(address => bool)
    guardian: t.hex().notNull().default(zeroAddress), // slot 12: guardian address
    // ✔︎ slot 13: config mapping(Id => struct MarketConfig)
    timelock: t.bigint().notNull(), // slot 14: timelock uint256
    pendingGuardian: t.hex().notNull().default(zeroAddress), // slot 15: pendingGuardian struct PendingAddress
    pendingGuardianValidAt: t.bigint().notNull().default(0n), // slot 15 (continued)
    // ✔︎ slot 16: pendingCap mapping(Id => struct PendingUint192)
    pendingTimelock: t.bigint().notNull().default(0n), // slot 17: pendingTimelock struct PendingUint192
    pendingTimelockValidAt: t.bigint().notNull().default(0n), // slot 17 (continued)
    fee: t.bigint().notNull().default(0n), // slot 18: fee uint96
    feeRecipient: t.hex().notNull().default(zeroAddress), // slot 18 (continued): feeRecipient address
    skimRecipient: t.hex().notNull().default(zeroAddress), // slot 19: skimRecipient address
    supplyQueueLength: t.integer().notNull().default(0), // slot 20: supplyQueue Id[]
    withdrawQueueLength: t.integer().notNull().default(0), // slot 21: withdrawQueue Id[]
    lastTotalAssets: t.bigint().notNull().default(0n), // slot 22: lastTotalAssets uint256
    lostAssets: t.bigint().notNull().default(0n), // slot 23: lostAssets uint256
    name: t.text().notNull(), // slot 24: _name string
    symbol: t.text().notNull(), // slot 25: _symbol string
  }),
  (table) => ({
    // Composite primary key uniquely identifies a vault across chains
    pk: primaryKey({ columns: [table.chainId, table.address] }),
  }),
);

export const vaultRelations = relations(vault, ({ many }) => ({
  config: many(vaultConfigItem),
  supplyQueue: many(vaultSupplyQueueItem),
  withdrawQueue: many(vaultWithdrawQueueItem),
}));

// `vault.config` and `vault.pendingCap`
export const vaultConfigItem = onchainTable(
  "vault_config_item",
  (t) => ({
    chainId: t.integer().notNull(),
    address: t.hex().notNull(),
    marketId: t.hex().notNull(),

    // MarketConfig fields
    cap: t.bigint().notNull().default(0n),
    pendingCap: t.bigint().notNull(),
    pendingCapValidAt: t.bigint().notNull(),
    enabled: t.boolean().notNull(),
    removableAt: t.bigint().notNull(),
  }),
  (table) => ({
    // Composite primary key uniquely identifies the item
    pk: primaryKey({ columns: [table.chainId, table.address, table.marketId] }),
    // Indexes speed up relational queries
    vaultIdx: index().on(table.chainId, table.address),
    marketIdx: index().on(table.chainId, table.marketId),
  }),
);
export const vaultConfigItemRelations = relations(vaultConfigItem, ({ one }) => ({
  vault: one(vault, {
    fields: [vaultConfigItem.chainId, vaultConfigItem.address],
    references: [vault.chainId, vault.address],
  }),
  market: one(market, {
    fields: [vaultConfigItem.chainId, vaultConfigItem.marketId],
    references: [market.chainId, market.id],
  }),
}));

// `vault.supplyQueue`
export const vaultSupplyQueueItem = vaultQueueItem("vault_supply_queue_item");
export const vaultSupplyQueueItemRelations = vaultQueueItemRelations(vaultSupplyQueueItem);

// `vault.withdrawQueue`
export const vaultWithdrawQueueItem = vaultQueueItem("vault_withdraw_queue_item");
export const vaultWithdrawQueueItemRelations = vaultQueueItemRelations(vaultWithdrawQueueItem);

/*//////////////////////////////////////////////////////////////
                       [PRE LIQUIDATION]
//////////////////////////////////////////////////////////////*/

export const preLiquidation = onchainTable(
  "preLiquidation",
  (t) => ({
    chainId: t.integer().notNull(),
    marketId: t.hex().notNull(),
    address: t.hex().notNull(),

    preLltv: t.bigint().notNull(),
    preLCF1: t.bigint().notNull(),
    preLCF2: t.bigint().notNull(),
    preLIF1: t.bigint().notNull(),
    preLIF2: t.bigint().notNull(),
    preLiquidationOracle: t.hex().notNull(),
  }),
  (table) => ({
    // Composite primary key uniquely identifies a preLiquidation across chains
    pk: primaryKey({ columns: [table.chainId, table.marketId, table.address] }),
    // Index speeds up relational queries
    marketIdx: index().on(table.chainId, table.marketId),
  }),
);

export const preLiquidationRelations = relations(preLiquidation, ({ one }) => ({
  market: one(market, {
    fields: [preLiquidation.chainId, preLiquidation.marketId],
    references: [market.chainId, market.id],
  }),
}));

/*//////////////////////////////////////////////////////////////
                           [HELPERS]
//////////////////////////////////////////////////////////////*/

function vaultQueueItem<name extends string>(name: name) {
  return onchainTable(
    name,
    (t) => ({
      chainId: t.integer().notNull(),
      address: t.hex().notNull(),
      ordinal: t.integer().notNull(), // index within the array

      marketId: t.hex(),
    }),
    (table) => ({
      // Composite primary key uniquely identifies the item
      pk: primaryKey({ columns: [table.chainId, table.address, table.ordinal] }),
      // Indexes speed up relational queries
      vaultIdx: index().on(table.chainId, table.address),
      marketIdx: index().on(table.chainId, table.marketId),
    }),
  );
}

function vaultQueueItemRelations<name extends string>(
  table: ReturnType<typeof vaultQueueItem<name>>,
) {
  return relations(table, ({ one }) => ({
    vault: one(vault, {
      fields: [table.chainId, table.address],
      references: [vault.chainId, vault.address],
    }),
    market: one(market, {
      fields: [table.chainId, table.marketId],
      references: [market.chainId, market.id],
    }),
    position: one(position, {
      fields: [table.chainId, table.marketId, table.address],
      references: [position.chainId, position.marketId, position.user],
    }),
  }));
}
