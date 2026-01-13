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
import { formatRelativeTime } from "@/lib/utils";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, X, ExternalLink, 
  Globe, Mail, Phone, MapPin, Building2, User, Instagram,
  Facebook, Linkedin, Twitter, Play, Music2
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

type CompetitorType = "brokerage" | "individual_broker" | "developer" | "property_manager" | "investor" | "other";

const COMPETITOR_TYPES = [
  { value: "brokerage", label: "Brokerage" },
  { value: "individual_broker", label: "Individual Broker" },
  { value: "developer", label: "Developer" },
  { value: "property_manager", label: "Property Manager" },
  { value: "investor", label: "Investor" },
  { value: "other", label: "Other" },
];

// Platform icons and colors
const PLATFORMS = {
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50", label: "Instagram" },
  tiktok: { icon: Music2, color: "text-slate-900", bg: "bg-slate-100", label: "TikTok" },
  youtube: { icon: Play, color: "text-red-500", bg: "bg-red-50", label: "YouTube" },
  facebook: { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50", label: "Facebook" },
  linkedin: { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50", label: "LinkedIn" },
  twitter: { icon: Twitter, color: "text-sky-500", bg: "bg-sky-50", label: "X / Twitter" },
};

export default function CompetitorsPage() {
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const markets = useQuery(api.markets.list);
  const competitors = useQuery(api.competitors.list, {
    marketId: selectedMarket !== "all" ? (selectedMarket as Id<"markets">) : undefined,
    type: selectedType !== "all" ? (selectedType as CompetitorType) : undefined,
  });
  const stats = useQuery(api.competitors.getStats);
  const migrateAccounts = useMutation(api.competitors.migrateFromAccounts);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setShowAddCard(false);
  };

  const handleAddClick = () => {
    setShowAddCard(!showAddCard);
    setExpandedId(null);
  };

  const handleMigrate = async () => {
    if (confirm("This will create Competitor entities from your existing accounts. Continue?")) {
      const result = await migrateAccounts({});
      alert(`Created ${result.competitorsCreated} competitors and linked ${result.accountsLinked} accounts.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            Manage competitor profiles and their social accounts
          </p>
        </div>
        <div className="flex gap-2">
          {stats && stats.unlinkedAccounts > 0 && (
            <Button variant="outline" onClick={handleMigrate}>
              Migrate {stats.unlinkedAccounts} Accounts
            </Button>
          )}
          <Button onClick={handleAddClick} variant={showAddCard ? "outline" : "default"}>
            {showAddCard ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Competitor
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Competitors</div>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Tracked Accounts</div>
            <div className="text-2xl font-bold">{stats?.linkedAccounts || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Brokerages</div>
            <div className="text-2xl font-bold">{stats?.byType?.brokerage || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Individual Brokers</div>
            <div className="text-2xl font-bold">{stats?.byType?.individual_broker || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {COMPETITOR_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
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
        <AddCompetitorCard
          markets={markets || []}
          onClose={() => setShowAddCard(false)}
        />
      )}

      {/* Competitors List */}
      <div className="space-y-3">
        {competitors?.map((competitor) => (
          <CompetitorCard
            key={competitor._id}
            competitor={competitor}
            markets={markets || []}
            isExpanded={expandedId === competitor._id}
            onToggle={() => toggleExpand(competitor._id)}
          />
        ))}
        {competitors?.length === 0 && !showAddCard && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No competitors found. Click "Add Competitor" to start tracking.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CompetitorCard({
  competitor,
  markets,
  isExpanded,
  onToggle,
}: {
  competitor: any;
  markets: any[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [name, setName] = useState(competitor.name);
  const [type, setType] = useState<CompetitorType>(competitor.type);
  const [marketId, setMarketId] = useState(competitor.marketId);
  const [website, setWebsite] = useState(competitor.website || "");
  const [email, setEmail] = useState(competitor.email || "");
  const [phone, setPhone] = useState(competitor.phones?.[0] || "");
  const [address, setAddress] = useState(competitor.address || "");
  const [city, setCity] = useState(competitor.city || "");
  const [state, setState] = useState(competitor.state || "");
  const [country, setCountry] = useState(competitor.country || "");
  const [notes, setNotes] = useState(competitor.notes || "");
  
  // Social handles
  const [instagram, setInstagram] = useState(competitor.socialHandles?.instagram || "");
  const [tiktok, setTiktok] = useState(competitor.socialHandles?.tiktok || "");
  const [youtube, setYoutube] = useState(competitor.socialHandles?.youtube || "");
  const [facebook, setFacebook] = useState(competitor.socialHandles?.facebook || "");
  const [linkedin, setLinkedin] = useState(competitor.socialHandles?.linkedin || "");
  const [twitter, setTwitter] = useState(competitor.socialHandles?.twitter || "");
  
  const [isSaving, setIsSaving] = useState(false);

  const updateCompetitor = useMutation(api.competitors.update);
  const removeCompetitor = useMutation(api.competitors.remove);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCompetitor({
        id: competitor._id,
        name,
        type,
        marketId,
        website: website || undefined,
        email: email || undefined,
        phones: phone ? [phone] : undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        notes: notes || undefined,
        socialHandles: {
          instagram: instagram || undefined,
          tiktok: tiktok || undefined,
          youtube: youtube || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          twitter: twitter || undefined,
        },
      });
      onToggle();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${competitor.name}"? This will unlink ${competitor.accounts?.length || 0} tracked accounts.`)) {
      await removeCompetitor({ id: competitor._id });
    }
  };

  // Count monitored vs unmonitored handles
  const monitoredCount = [instagram, tiktok, youtube].filter(Boolean).length;
  const totalHandles = [instagram, tiktok, youtube, facebook, linkedin, twitter].filter(Boolean).length;

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}>
      {/* Collapsed View */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {/* Avatar/Logo */}
          {competitor.logoUrl ? (
            <img
              src={competitor.logoUrl}
              alt={competitor.name}
              className="h-14 w-14 rounded-lg object-cover border"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
              {competitor.type === "individual_broker" ? (
                <User className="h-6 w-6 text-slate-500" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-500" />
              )}
            </div>
          )}
          
          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{competitor.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  competitor.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {competitor.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="capitalize">{competitor.type.replace(/_/g, " ")}</span>
              <span>•</span>
              <span>{competitor.market?.name}</span>
              <span>•</span>
              <span>{monitoredCount} monitored / {totalHandles} total handles</span>
            </div>
            
            {/* Social Platform Icons */}
            <div className="flex items-center gap-1 mt-2">
              {competitor.accounts?.map((account: any) => {
                const platform = PLATFORMS[account.platform as keyof typeof PLATFORMS];
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <div
                    key={account._id}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${platform.bg}`}
                    title={`@${account.username}`}
                  >
                    <Icon className={`h-3 w-3 ${platform.color}`} />
                    {account.avatarUrl && (
                      <img src={account.avatarUrl} className="h-4 w-4 rounded-full" alt="" />
                    )}
                    <span className="text-xs">@{account.username}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
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
          {/* Basic Info Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as CompetitorType)}>
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPETITOR_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Market</label>
                <Select value={marketId} onValueChange={(v) => setMarketId(v as Id<"markets">)}>
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((m) => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact Information
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State/Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Social Handles Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              📱 Social Media Handles
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Instagram, TikTok, and YouTube are monitored. Facebook, LinkedIn, and X are stored for reference only.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Monitored Platforms */}
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Music2 className="h-4 w-4" /> TikTok
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Play className="h-4 w-4 text-red-500" /> YouTube
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value.replace(/^@/, ""))}
                  placeholder="channel name"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              {/* Non-monitored Platforms */}
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="page name or URL"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="company or profile URL"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" /> X / Twitter
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                  className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this competitor..."
              rows={2}
              className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-200">
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Competitor
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

function AddCompetitorCard({
  markets,
  onClose,
}: {
  markets: any[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CompetitorType>("brokerage");
  const [marketId, setMarketId] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Social handles
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  const createCompetitor = useMutation(api.competitors.create);

  const handleSubmit = async () => {
    if (!name || !marketId) return;

    setIsSaving(true);
    try {
      await createCompetitor({
        name,
        type,
        marketId: marketId as Id<"markets">,
        website: website || undefined,
        email: email || undefined,
        phones: phone ? [phone] : undefined,
        socialHandles: {
          instagram: instagram || undefined,
          tiktok: tiktok || undefined,
          youtube: youtube || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          twitter: twitter || undefined,
        },
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold text-lg">Add New Competitor</div>
            <div className="text-sm text-muted-foreground">Enter business details and social handles</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50">
        {/* Basic Info */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Company or person name"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Type *</label>
              <Select value={type} onValueChange={(v) => setType(v as CompetitorType)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPETITOR_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Market *</label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((m) => (
                    <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact (Optional)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Social Handles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📱 Social Media Handles</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Add handles to automatically create tracked accounts for Instagram, TikTok, and YouTube.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500" /> Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Music2 className="h-4 w-4" /> TikTok
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Play className="h-4 w-4 text-red-500" /> YouTube
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value.replace(/^@/, ""))}
                placeholder="channel name"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" /> Facebook
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="page name"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="company URL"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" /> X / Twitter
              </label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                placeholder="username"
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !name || !marketId}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Creating..." : "Add Competitor"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
