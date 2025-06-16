-- Hotfix: Invalidate RPC cache for mainnet (chain_id 1) back to block 22689053
-- This will force re-sync from block 22689053 onwards
UPDATE ponder_sync.intervals 
SET blocks = blocks * '{(-infinity,22689053]}'::nummultirange  
WHERE chain_id = 1;