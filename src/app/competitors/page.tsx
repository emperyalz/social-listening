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
import { formatRelativeTime, getPlatformIcon } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, ChevronUp, X, ExternalLink } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

type Platform = "instagram" | "tiktok" | "youtube";
type AccountType = "brokerage" | "individual_broker" | "developer" | "other";

export default function CompetitorsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const markets = useQuery(api.markets.list);
  const accounts = useQuery(api.accounts.list, {
    platform:
      selectedPlatform !== "all"
        ? (selectedPlatform as Platform)
        : undefined,
    marketId: selectedMarket !== "all" ? (selectedMarket as Id<"markets">) : undefined,
  });
  const stats = useQuery(api.accounts.getStats);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setShowAddCard(false);
  };

  const handleAddClick = () => {
    setShowAddCard(!showAddCard);
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            Manage and track competitor accounts
          </p>
        </div>
        <Button onClick={handleAddClick} variant={showAddCard ? "outline" : "default"}>
          {showAddCard ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </>
          )}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Accounts</div>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-pink-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">📸 Instagram</div>
            <div className="text-2xl font-bold">{stats?.byPlatform?.instagram || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardContent className="pt-4">
            <div className="text-sm text-slate-300">🎵 TikTok</div>
            <div className="text-2xl font-bold">{stats?.byPlatform?.tiktok || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">▶️ YouTube</div>
            <div className="text-2xl font-bold">{stats?.byPlatform?.youtube || 0}</div>
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

      {/* Add New Card (Inline) */}
      {showAddCard && (
        <AddAccountCard
          markets={markets || []}
          onClose={() => setShowAddCard(false)}
        />
      )}

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts?.map((account) => (
          <AccountCard
            key={account._id}
            account={account}
            markets={markets || []}
            isExpanded={expandedId === account._id}
            onToggle={() => toggleExpand(account._id)}
          />
        ))}
        {accounts?.length === 0 && !showAddCard && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No accounts found. Click "Add Account" to start tracking competitors.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface Market {
  _id: Id<"markets">;
  name: string;
  country: string;
  city: string;
  timezone: string;
  isActive: boolean;
}

// Helper to clean username (remove @ and trim)
const cleanUsername = (username: string) => username.replace(/^@/, "").trim();

// Helper to generate profile URL
const getProfileUrl = (platform: Platform, username: string) => {
  const clean = cleanUsername(username);
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${clean}`;
    case "tiktok":
      return `https://www.tiktok.com/@${clean}`;
    case "youtube":
      return `https://www.youtube.com/@${clean}`;
  }
};

function AccountCard({
  account,
  markets,
  isExpanded,
  onToggle,
}: {
  account: any;
  markets: Market[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [username, setUsername] = useState(account.username);
  const [displayName, setDisplayName] = useState(account.displayName || "");
  const [marketId, setMarketId] = useState(account.marketId);
  const [companyName, setCompanyName] = useState(account.companyName || "");
  const [accountType, setAccountType] = useState<AccountType>(account.accountType);
  const [bio, setBio] = useState(account.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  const updateAccount = useMutation(api.accounts.update);
  const removeAccount = useMutation(api.accounts.remove);

  const handleSave = async () => {
    setIsSaving(true);
    const cleanedUsername = cleanUsername(username);
    try {
      await updateAccount({
        id: account._id,
        username: cleanedUsername,
        profileUrl: getProfileUrl(account.platform, cleanedUsername),
        displayName: displayName || undefined,
        marketId,
        companyName: companyName || undefined,
        accountType,
        bio: bio || undefined,
      });
      onToggle();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete @${account.username}? This cannot be undone.`)) {
      await removeAccount({ id: account._id });
    }
  };

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}>
      {/* Collapsed View - Always Visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.username}
              className="h-14 w-14 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xl font-bold text-slate-600 shadow">
              {account.username[0]?.toUpperCase()}
            </div>
          )}
          
          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getPlatformIcon(account.platform)}</span>
              <span className="font-semibold text-lg">@{account.username}</span>
              {account.companyName && (
                <span className="text-sm text-muted-foreground">• {account.companyName}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="bg-slate-100 px-2 py-0.5 rounded">{account.market?.name}</span>
              <span className="capitalize">{account.accountType?.replace("_", " ")}</span>
              {account.lastScrapedAt && (
                <span>Scraped {formatRelativeTime(account.lastScrapedAt)}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={account.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-slate-100 rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isExpanded && (
        <div className="border-t bg-slate-50 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Platform</label>
              <input
                type="text"
                value={`${getPlatformIcon(account.platform)} ${account.platform}`}
                disabled
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm capitalize text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Market</label>
              <Select value={marketId} onValueChange={(v) => setMarketId(v as Id<"markets">)}>
                <SelectTrigger className="mt-1 bg-white">
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
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Brokerage or company"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Account Type</label>
              <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                <SelectTrigger className="mt-1 bg-white">
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onToggle}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function AddAccountCard({
  markets,
  onClose,
}: {
  markets: Market[];
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [username, setUsername] = useState("");
  const [marketId, setMarketId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("brokerage");
  const [isSaving, setIsSaving] = useState(false);

  const createAccount = useMutation(api.accounts.create);

  const handleSubmit = async () => {
    if (!username || !marketId) return;

    setIsSaving(true);
    const cleanedUsername = cleanUsername(username);
    try {
      await createAccount({
        platform,
        username: cleanedUsername,
        profileUrl: getProfileUrl(platform, cleanedUsername),
        marketId: marketId as Id<"markets">,
        companyName: companyName || undefined,
        accountType,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="ring-2 ring-green-500 shadow-lg">
      <div className="flex items-center justify-between p-4 bg-green-50 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white text-xl">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg">Add New Competitor</div>
            <div className="text-sm text-muted-foreground">Enter account details below</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Platform *</label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger className="mt-1 bg-white">
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
            <label className="text-sm font-medium text-slate-700">Username *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Market *</label>
            <Select value={marketId} onValueChange={setMarketId}>
              <SelectTrigger className="mt-1 bg-white">
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
            <label className="text-sm font-medium text-slate-700">Account Type</label>
            <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
              <SelectTrigger className="mt-1 bg-white">
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

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Brokerage or company name"
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !username || !marketId}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Adding..." : "Add Account"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
