"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, formatRelativeTime, getPlatformIcon } from "@/lib/utils";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function CompetitorsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const markets = useQuery(api.markets.list);
  const accounts = useQuery(api.accounts.list, {
    platform:
      selectedPlatform !== "all"
        ? (selectedPlatform as "instagram" | "tiktok" | "youtube")
        : undefined,
    marketId: selectedMarket !== "all" ? (selectedMarket as any) : undefined,
  });
  const stats = useQuery(api.accounts.getStats);

  const removeAccount = useMutation(api.accounts.remove);

  const handleRemove = async (id: Id<"accounts">) => {
    if (confirm("Are you sure you want to remove this account?")) {
      await removeAccount({ id });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            Manage and track competitor accounts
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📸 Instagram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byPlatform?.instagram || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🎵 TikTok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byPlatform?.tiktok || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">▶️ YouTube</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byPlatform?.youtube || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">📸 Instagram</SelectItem>
            <SelectItem value="tiktok">🎵 TikTok</SelectItem>
            <SelectItem value="youtube">▶️ YouTube</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedMarket} onValueChange={setSelectedMarket}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Markets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            {markets?.map((market) => (
              <SelectItem key={market._id} value={market._id}>
                {market.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Accounts ({accounts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts?.map((account) => (
              <div
                key={account._id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  {account.avatarUrl ? (
                    <img
                      src={account.avatarUrl}
                      alt={account.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg">
                      {account.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getPlatformIcon(account.platform)}
                      </span>
                      <span className="font-medium">@{account.username}</span>
                      {account.companyName && (
                        <span className="text-sm text-muted-foreground">
                          • {account.companyName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{account.market?.name}</span>
                      <span className="capitalize">{account.accountType.replace("_", " ")}</span>
                      {account.lastScrapedAt && (
                        <span>
                          Last scraped: {formatRelativeTime(account.lastScrapedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={account.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Profile
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(account._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {accounts?.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No accounts found. Add competitor accounts to start tracking.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Account Modal */}
      {showAddForm && (
        <AddAccountModal
          markets={markets || []}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

function AddAccountModal({
  markets,
  onClose,
}: {
  markets: any[];
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">(
    "instagram"
  );
  const [username, setUsername] = useState("");
  const [marketId, setMarketId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountType, setAccountType] = useState<
    "brokerage" | "individual_broker" | "developer" | "other"
  >("brokerage");

  const createAccount = useMutation(api.accounts.create);

  const getProfileUrl = () => {
    switch (platform) {
      case "instagram":
        return `https://www.instagram.com/${username}`;
      case "tiktok":
        return `https://www.tiktok.com/@${username}`;
      case "youtube":
        return `https://www.youtube.com/@${username}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !marketId) return;

    await createAccount({
      platform,
      username: username.replace("@", ""),
      profileUrl: getProfileUrl(),
      marketId: marketId as any,
      companyName: companyName || undefined,
      accountType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Competitor Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select
                value={platform}
                onValueChange={(v) => setPlatform(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                  <SelectItem value="youtube">▶️ YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Market</label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market._id} value={market._id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Company Name (optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company or Brokerage name"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Account Type</label>
              <Select
                value={accountType}
                onValueChange={(v) => setAccountType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brokerage">Brokerage</SelectItem>
                  <SelectItem value="individual_broker">Individual Broker</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Account</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
