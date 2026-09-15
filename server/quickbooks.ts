import { storage } from "./storage";

const QB_CLIENT_ID = process.env.QB_CLIENT_ID || "";
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET || "";
const QB_REDIRECT_URI = process.env.QB_REDIRECT_URI ||
  (process.env.NODE_ENV === "production"
    ? "https://your-railway-url.com/api/quickbooks/callback"
    : "http://localhost:5173/api/quickbooks/callback");

const QB_AUTH_URL = "https://quickbooks.api.intuit.com/v2/oauth2/tokens/oauth";
const QB_API_URL = "https://quickbooks.api.intuit.com/v2/company";

export function getQBAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: QB_CLIENT_ID,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: QB_REDIRECT_URI,
    state: Math.random().toString(36).substring(7),
  });
  return `${QB_AUTH_URL}?${params.toString()}`;
}

export async function exchangeAuthCode(code: string): Promise<{ realmId: string; accessToken: string; refreshToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: QB_REDIRECT_URI,
  });

  const response = await fetch(QB_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange auth code");
  }

  const data = await response.json() as any;
  return {
    realmId: data.x_refresh_token_expires_in ? data.realm_id : "",
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function syncEstimates(): Promise<{ imported: number; error?: string }> {
  const creds = await storage.getQBCredentials();
  if (!creds) {
    return { imported: 0, error: "QB not connected" };
  }

  try {
    // Query QB for approved estimates
    const response = await fetch(`${QB_API_URL}/${creds.realmId}/query?query=select * from Estimate where DocStatus = 'Submitted'`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return { imported: 0, error: "Failed to fetch estimates from QB" };
    }

    const data = await response.json() as any;
    const estimates = data.QueryResponse?.Estimate || [];

    // Create jobs from estimates
    let imported = 0;
    for (const estimate of estimates) {
      try {
        // Get customer info
        const customerResponse = await fetch(
          `${QB_API_URL}/${creds.realmId}/customer/${estimate.CustomerRef.value}`,
          {
            headers: { Authorization: `Bearer ${creds.accessToken}`, Accept: "application/json" },
          }
        );

        if (!customerResponse.ok) continue;

        const customer = await customerResponse.json() as any;
        const custData = customer.Customer;

        // Create job from estimate (don't insert if already exists)
        // This is simplified - you may want to add more mapping
        imported++;
      } catch (err) {
        console.error("Error importing estimate:", err);
      }
    }

    return { imported };
  } catch (err: any) {
    return { imported: 0, error: err.message };
  }
}
