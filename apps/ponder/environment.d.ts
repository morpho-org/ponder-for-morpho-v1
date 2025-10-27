declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHAIN_TIER: "1" | "2" | "3" | "all" | undefined;
    }
  }
}

export {};
