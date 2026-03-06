import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

/**
 * Returns a StorageClient instance for direct image blob uploads.
 * Uses loadConfig to get the same gateway/bucket/project settings as the actor.
 */
export function useStorageClient() {
  return useQuery({
    queryKey: ["storageClient"],
    queryFn: async (): Promise<StorageClient> => {
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: (config as { backend_host?: string }).backend_host,
      });
      const c = config as {
        bucket_name: string;
        storage_gateway_url: string;
        backend_canister_id: string;
        project_id: string;
      };
      return new StorageClient(
        c.bucket_name,
        c.storage_gateway_url,
        c.backend_canister_id,
        c.project_id,
        agent,
      );
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}
