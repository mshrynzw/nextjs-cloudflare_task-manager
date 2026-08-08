import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Minimal OpenNext Cloudflare config.
 * Incremental cache can use R2 later via NEXT_INC_CACHE_R2_BUCKET binding.
 */
export default defineCloudflareConfig({});
