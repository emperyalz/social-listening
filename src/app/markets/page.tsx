"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, MapPin, Users, ChevronDown, ChevronUp, X, Globe } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

// Common timezones grouped by region
const TIMEZONES = [
  { group: "Americas", zones: [
    { value: "America/New_York", label: "Eastern Time (New York)" },
    { value: "America/Chicago", label: "Central Time (Chicago)" },
    { value: "America/Denver", label: "Mountain Time (Denver)" },
    { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
    { value: "America/Phoenix", label: "Arizona (Phoenix)" },
    { value: "America/Anchorage", label: "Alaska (Anchorage)" },
    { value: "Pacific/Honolulu", label: "Hawaii (Honolulu)" },
    { value: "America/Mexico_City", label: "Mexico City" },
    { value: "America/Panama", label: "Panama" },
    { value: "America/Bogota", label: "Colombia (Bogota)" },
    { value: "America/Lima", label: "Peru (Lima)" },
    { value: "America/Santiago", label: "Chile (Santiago)" },
    { value: "America/Buenos_Aires", label: "Argentina (Buenos Aires)" },
    { value: "America/Sao_Paulo", label: "Brazil (São Paulo)" },
    { value: "America/Caracas", label: "Venezuela (Caracas)" },
    { value: "America/Guayaquil", label: "Ecuador (Guayaquil)" },
    { value: "America/Toronto", label: "Canada Eastern (Toronto)" },
    { value: "America/Vancouver", label: "Canada Pacific (Vancouver)" },
  ]},
  { group: "Europe", zones: [
    { value: "Europe/London", label: "UK (London)" },
    { value: "Europe/Paris", label: "Central Europe (Paris)" },
    { value: "Europe/Berlin", label: "Germany (Berlin)" },
    { value: "Europe/Madrid", label: "Spain (Madrid)" },
    { value: "Europe/Rome", label: "Italy (Rome)" },
    { value: "Europe/Amsterdam", label: "Netherlands (Amsterdam)" },
    { value: "Europe/Moscow", label: "Russia (Moscow)" },
  ]},
  { group: "Asia/Pacific", zones: [
    { value: "Asia/Dubai", label: "UAE (Dubai)" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Hong_Kong", label: "Hong Kong" },
    { value: "Asia/Tokyo", label: "Japan (Tokyo)" },
    { value: "Asia/Shanghai", label: "China (Shanghai)" },
    { value: "Asia/Seoul", label: "South Korea (Seoul)" },
    { value: "Asia/Manila", label: "Philippines (Manila)" },
    { value: "Australia/Sydney", label: "Australia Eastern (Sydney)" },
    { value: "Australia/Perth", label: "Australia Western (Perth)" },
    { value: "Pacific/Auckland", label: "New Zealand (Auckland)" },
  ]},
];

// Common countries
const COUNTRIES = [
  "United States", "Canada", "Mexico", "Panama", "Colombia", "Ecuador", "Peru", 
  "Chile", "Argentina", "Brazil", "Venezuela", "Costa Rica", "Guatemala",
  "Spain", "United Kingdom", "Germany", "France", "Italy", "Netherlands",
  "UAE", "Singapore", "Hong Kong", "Japan", "China", "South Korea", "Philippines",
  "Australia", "New Zealand"
];

export default function MarketsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  
  const markets = useQuery(api.markets.getAll);
  const accounts = useQuery(api.accounts.list, {});
  const seedMarkets = useMutation(api.markets.seedMarkets);

  const getAccountCount = (marketId: Id<"markets">) => {
    return accounts?.filter((a) => a.marketId === marketId).length || 0;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setShowAddCard(false);
  };

  const handleAddClick = () => {
    setShowAddCard(!showAddCard);
    setExpandedId(null);
  };

  const handleSeed = async () => {
    await seedMarkets({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">
            Manage geographic markets for competitor tracking
          </p>
        </div>
        <div className="flex gap-2">
          {(!markets || markets.length === 0) && (
            <Button variant="outline" onClick={handleSeed}>
              Seed Default Markets
            </Button>
          )}
          <Button onClick={handleAddClick} className={showAddCard ? "" : "bg-[#28A963] hover:bg-[#28A963]/90"}>
            {showAddCard ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Market
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#28A963]/10 border-[#28A963]/20">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Markets</div>
            <div className="text-2xl font-bold text-[#28A963]">{markets?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#28A963]/5 border-[#28A963]/10">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Active Markets</div>
            <div className="text-2xl font-bold">{markets?.filter(m => m.isActive).length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Accounts</div>
            <div className="text-2xl font-bold">{accounts?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Card (Inline) */}
      {showAddCard && (
        <AddMarketCard onClose={() => setShowAddCard(false)} />
      )}

      {/* Markets List */}
      <div className="space-y-3">
        {markets?.map((market) => (
          <MarketCard
            key={market._id}
            market={market}
            accountCount={getAccountCount(market._id)}
            isExpanded={expandedId === market._id}
            onToggle={() => toggleExpand(market._id)}
          />
        ))}
        {(!markets || markets.length === 0) && !showAddCard && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No markets configured yet. Click "Seed Default Markets" for quick setup, or "Add Market" to create custom markets.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MarketCard({
  market,
  accountCount,
  isExpanded,
  onToggle,
}: {
  market: any;
  accountCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [name, setName] = useState(market.name);
  const [country, setCountry] = useState(market.country);
  const [state, setState] = useState(market.state || "");
  const [city, setCity] = useState(market.city);
  const [timezone, setTimezone] = useState(market.timezone);
  const [isActive, setIsActive] = useState(market.isActive);
  const [isSaving, setIsSaving] = useState(false);

  const updateMarket = useMutation(api.markets.update);
  const removeMarket = useMutation(api.markets.remove);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMarket({
        id: market._id,
        name,
        country,
        state: state || undefined,
        city,
        timezone,
        isActive,
      });
      onToggle();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (accountCount > 0) {
      alert(`Cannot delete market with ${accountCount} accounts. Remove or reassign accounts first.`);
      return;
    }
    if (confirm(`Delete "${market.name}"? This cannot be undone.`)) {
      await removeMarket({ id: market._id });
    }
  };

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-[#28A963] shadow-lg" : "hover:shadow-md"}`}>
      {/* Collapsed View */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#28A963]/10">
            <MapPin className="h-6 w-6 text-[#28A963]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{market.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  market.isActive
                    ? "bg-[#28A963]/20 text-[#28A963]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {market.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{market.city}, {market.state ? `${market.state}, ` : ""}{market.country}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {market.timezone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {accountCount} accounts
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Market Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Country</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., California, Ontario"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Timezone</label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((group) => (
                    <div key={group.group}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                        {group.group}
                      </div>
                      {group.zones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">✅ Active</SelectItem>
                  <SelectItem value="inactive">⏸️ Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Market
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onToggle}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-[#28A963] hover:bg-[#28A963]/90">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function AddMarketCard({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createMarket = useMutation(api.markets.create);

  const handleSubmit = async () => {
    if (!name || !country || !city || !timezone) return;

    setIsSaving(true);
    try {
      await createMarket({ 
        name, 
        country, 
        state: state || undefined,
        city, 
        timezone 
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="ring-2 ring-[#28A963] shadow-lg">
      <div className="flex items-center justify-between p-4 bg-[#28A963]/10 border-b border-[#28A963]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#28A963] text-white">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg">Add New Market</div>
            <div className="text-sm text-muted-foreground">Configure a new geographic market</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-muted/30">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Market Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dallas"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Country *</label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1 bg-background">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">State / Province</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., Texas"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">City *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Dallas"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[#28A963] focus:border-[#28A963]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Timezone *</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="mt-1 bg-background">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((group) => (
                  <div key={group.group}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                      {group.group}
                    </div>
                    {group.zones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !name || !country || !city || !timezone}
            className="bg-[#28A963] hover:bg-[#28A963]/90"
          >
            {isSaving ? "Adding..." : "Add Market"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
