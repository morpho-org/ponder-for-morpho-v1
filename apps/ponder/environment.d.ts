declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TIER_TO_INDEX: "1" | "2" | "3" | "all" | undefined;
      TIER_TO_SERVE: "1" | "2" | "3" | "all" | undefined;
    }
  }
}

export {};
