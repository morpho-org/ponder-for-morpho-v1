import { ponder } from "ponder:registry";
import { market } from "ponder:schema";

ponder.on("AdaptiveCurveIRM:BorrowRateUpdate", async ({ event, context }) => {
  try {
    // Row must exist because `BorrowRateUpdate` cannot preceed `CreateMarket`.
    await context.db
      .update(market, { chainId: context.chain.id, id: event.args.id })
      .set({ rateAtTarget: event.args.rateAtTarget });
  } catch {
    console.error(
      `[${context.chain.name} (${context.chain.id.toString()})]: Tried to handle AdaptiveCurveIRM:BorrowRateUpdate before Morpho:CreateMarket completed. This indicates a bug in Ponder.`,
    );
  }
});
