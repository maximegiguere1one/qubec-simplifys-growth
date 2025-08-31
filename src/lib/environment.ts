// Environment configuration with validation
const requiredEnvVars = {
  SUPABASE_URL: "https://lbwjesrgernvjiorktia.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2plc3JnZXJudmppb3JrdGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzYyNzMsImV4cCI6MjA3MjExMjI3M30.s9fNB-C6kq0Kd98PxzYKxiH9hFr9yW_gddVXQJoSU1c"
} as const;

// Validate environment variables at build time
const validateEnvironment = () => {
  const missing = Object.entries(requiredEnvVars).filter(([key, value]) => !value);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.map(([key]) => key).join(', ')}`);
  }
};

validateEnvironment();

export const env = requiredEnvVars;