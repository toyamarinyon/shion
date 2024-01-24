export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  AZURE_OPENAI_RESOURCE: string;
  AZURE_OPENAI_DEPLOYMENT_MODEL: string;
  ACCESS_DOMAIN: `https://${string}.cloudflareaccess.com`;
  ACCESS_AUD: string;
}
