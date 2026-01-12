"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, MapPin, Users } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function MarketsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const markets = useQuery(api.markets.getAll);
  const accounts = useQuery(api.accounts.list, {});
  const seedMarkets = useMutation(api.markets.seedMarkets);
  const removeMarket = useMutation(api.markets.remove);

  const getAccountCount = (marketId: Id<"markets">) => {
    return accounts?.filter((a) => a.marketId === marketId).length || 0;
  };

  const handleSeed = async () => {
    await seedMarkets({});
  };

  const handleRemove = async (id: Id<"markets">) => {
    if (confirm("Are you sure you want to remove this market?")) {
      await removeMarket({ id });
    }
  };

  return (
    <div className="space-y-8">
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
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Market
          </Button>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {markets?.map((market) => (
          <Card key={market._id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{market.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(market._id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>
                    {market.city}, {market.country}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Timezone</span>
                  <span className="text-xs">{market.timezone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accounts</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {getAccountCount(market._id)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      market.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {market.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!markets || markets.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No markets configured yet. Click "Seed Default Markets" to add
              pre-configured markets, or add them manually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Market Modal */}
      {showAddForm && <AddMarketModal onClose={() => setShowAddForm(false)} />}
    </div>
  );
}

function AddMarketModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [timezone, setTimezone] = useState("");

  const createMarket = useMutation(api.markets.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !country || !city || !timezone) return;

    await createMarket({ name, country, city, timezone });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Market</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Market Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Panama City"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Panama"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Panama City"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., America/Panama"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Market</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
