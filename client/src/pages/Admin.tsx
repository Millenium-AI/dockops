import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface WhitelistedEmail {
  id: number;
  email: string;
  createdAt: string;
}

export default function Admin() {
  const [emails, setEmails] = useState<WhitelistedEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qbConnecting, setQBConnecting] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/emails");
      if (!res.ok) throw new Error("Failed to fetch emails");
      const data = await res.json();
      setEmails(data.emails);
    } catch (err) {
      setError("Failed to load whitelisted emails");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newEmail) {
      setError("Email required");
      return;
    }

    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add email");
        return;
      }

      setSuccess(`${newEmail} added to whitelist`);
      setNewEmail("");
      await fetchEmails();
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) return;

    try {
      const res = await fetch(`/api/admin/emails/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to remove email");
        return;
      }

      setSuccess(`${email} removed from whitelist`);
      await fetchEmails();
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleConnectQB = async () => {
    setQBConnecting(true);
    try {
      const res = await fetch("/api/quickbooks/auth");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError("Failed to connect QuickBooks");
      setQBConnecting(false);
    }
  };

  return (
    <AppShell title="Admin Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Manage Whitelisted Emails</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Add email form */}
          <form onSubmit={handleAddEmail} className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Add New Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@satrianomarine.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Email list */}
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : emails.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No whitelisted emails yet</div>
          ) : (
            <div className="bg-muted/30 rounded-lg overflow-hidden border border-border">
              <div className="divide-y divide-border">
                {emails.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{item.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveEmail(item.email)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">QuickBooks Integration</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your QuickBooks account to automatically import approved estimates as jobs.
          </p>
          <button
            onClick={handleConnectQB}
            disabled={qbConnecting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            {qbConnecting ? "Connecting..." : "Connect QuickBooks"}
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <div className="font-semibold mb-2">How it works:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Only whitelisted emails can create accounts</li>
              <li>New team members can sign up at <code className="bg-black/20 px-1 rounded">/signup</code></li>
              <li>You can remove emails anytime to prevent new signups</li>
              <li>Connect QB to import approved estimates as jobs</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
