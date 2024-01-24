export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  AZURE_OPENAI_RESOURCE: string;
  ACCESS_DOMAIN: `https://${string}.cloudflareaccess.com`;
  ACCESS_AUD: string;
}
