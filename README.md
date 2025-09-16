# Morpho Ponder Template

A monorepo template for indexing Morpho v1 ([morpho-blue](https://github.com/morpho-org/morpho-blue) and [metamorpho](https://github.com/morpho-org/metamorpho-v1.1))
state with [Ponder](https://ponder.sh). This setup has been used in the open-source [liquidation](https://github.com/morpho-org/morpho-blue-liquidation-bot) and
[reallocation](https://github.com/morpho-org/morpho-blue-reallocation-bot) bots. If you're interested in fully worked-out examples and usage, check out those repos.

This is meant as a starting point for new indexing projects, but can be run as-is if you just want a GraphQL API into Morpho v1 data.

## Installation

To get started:

```shell
git clone https://github.com/morpho-org/ponder-for-morpho-v1.git
cd ponder-for-morpho-v1
# Install packages
pnpm install
# Run
cd apps/ponder
pnpm run dev
```

After running the commands above, open [http://localhost:42069/](http://localhost:42069/) in your browser to use the GraphQL playground.

## Features

- 📦 Configured as a monorepo to ease further development
- ℹ️ `ponder.config.ts` prefilled with Morpho addresses and ABIs
- 💾 Example indexing functions for multiple Morpho contracts
- 📊 GraphQL endpoint for (almost) all Morpho v1 state _💡 add schemas for historical data_
- 💧 Liquidation endpoint used by the [liquidation bot](https://github.com/morpho-org/morpho-blue-liquidation-bot)

## Further Information

This template is intended primarily for internal use at Morpho. Ponder has some [great resources](https://ponder.sh/docs/get-started)
for getting started with indexing, building, and deploying your own projects.
