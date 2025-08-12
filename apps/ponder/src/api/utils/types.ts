import type { EIP1193Parameters, PublicRpcSchema } from "viem";

export type RpcParameters = EIP1193Parameters<PublicRpcSchema>;

export interface JsonRpcMetadata {
  jsonrpc: "2.0";
  id: number | string | null;
}

export interface RpcParametersOf<M extends RpcParameters["method"]> extends JsonRpcMetadata {
  method: M;
  params: Extract<RpcParameters, { method: M }>["params"];
}

export interface RpcReturnTypeOf<M extends PublicRpcSchema[number]["Method"]>
  extends JsonRpcMetadata {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: Extract<PublicRpcSchema[number], { Method: M }>["ReturnType"];
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export function hasMethod<M extends RpcParameters["method"]>(
  x: unknown,
  method: M,
): x is RpcParametersOf<M> {
  return x != null && typeof x === "object" && "method" in x && x.method === method;
}
