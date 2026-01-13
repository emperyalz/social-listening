"use client";

import { useState, useEffect } from "react";
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
  Facebook, Linkedin, Twitter, Play, Music2, Pause, CheckCircle,
  MessageCircle
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

const PHONE_LABELS = ["Mobile", "Office", "WhatsApp", "Landline", "Fax", "Other"];

// Platform icons and colors
const PLATFORMS = {
  instagram: { icon: Instagram, color: "text-pink-500", bg: "bg-pink-50", label: "Instagram" },
  tiktok: { icon: Music2, color: "text-slate-900", bg: "bg-slate-100", label: "TikTok" },
  youtube: { icon: Play, color: "text-red-500", bg: "bg-red-50", label: "YouTube" },
  facebook: { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50", label: "Facebook" },
  linkedin: { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50", label: "LinkedIn" },
  twitter: { icon: Twitter, color: "text-sky-500", bg: "bg-sky-50", label: "X / Twitter" },
};

// ============ UTILITY FUNCTIONS ============

// Extract username from various social media URL formats
function extractSocialHandle(platform: string, input: string): string {
  if (!input) return "";
  
  let cleaned = input.trim();
  
  // Remove @ prefix if present
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }
  
  // Handle full URLs
  try {
    // Check if it's a URL
    if (cleaned.includes("://") || cleaned.includes("www.") || cleaned.includes(".com")) {
      // Add protocol if missing
      if (!cleaned.includes("://")) {
        cleaned = "https://" + cleaned;
      }
      
      const url = new URL(cleaned);
      const pathname = url.pathname;
      
      switch (platform) {
        case "instagram":
          // https://www.instagram.com/username/ or /username/?hl=en
          const igMatch = pathname.match(/^\/([^\/\?]+)/);
          if (igMatch) return igMatch[1].replace(/\/$/, "");
          break;
          
        case "tiktok":
          // https://www.tiktok.com/@username or /username
          const ttMatch = pathname.match(/^\/@?([^\/\?]+)/);
          if (ttMatch) return ttMatch[1].replace(/\/$/, "");
          break;
          
        case "youtube":
          // https://www.youtube.com/@username or /channel/xxx or /c/username
          const ytMatch = pathname.match(/^\/@([^\/\?]+)/) || 
                          pathname.match(/^\/c\/([^\/\?]+)/) ||
                          pathname.match(/^\/channel\/([^\/\?]+)/) ||
                          pathname.match(/^\/([^\/\?]+)/);
          if (ytMatch) return ytMatch[1].replace(/\/$/, "");
          break;
          
        case "facebook":
          // https://www.facebook.com/pagename or /profile.php?id=xxx
          const fbMatch = pathname.match(/^\/([^\/\?]+)/);
          if (fbMatch && fbMatch[1] !== "profile.php") {
            return fbMatch[1].replace(/\/$/, "");
          }
          // Return full URL for profile.php style links
          return cleaned;
          break;
          
        case "linkedin":
          // https://www.linkedin.com/in/username or /company/name
          const liMatch = pathname.match(/^\/(in|company)\/([^\/\?]+)/);
          if (liMatch) return `${liMatch[1]}/${liMatch[2]}`;
          return pathname.replace(/^\//, "").replace(/\/$/, "");
          break;
          
        case "twitter":
          // https://twitter.com/username or https://x.com/username
          const xMatch = pathname.match(/^\/([^\/\?]+)/);
          if (xMatch && !["i", "intent", "search", "hashtag"].includes(xMatch[1])) {
            return xMatch[1].replace(/\/$/, "");
          }
          break;
      }
    }
  } catch (e) {
    // Not a valid URL, treat as username
  }
  
  // Return cleaned input (just the username)
  return cleaned.replace(/\/$/, "").replace(/^\//, "");
}

// Format phone number to consistent format: +X (XXX) XXX-XXXX or similar
function formatPhoneNumber(input: string, defaultCountryCode: string = "+507"): string {
  if (!input) return "";
  
  // Remove all non-digit characters except +
  let digits = input.replace(/[^\d+]/g, "");
  
  // If starts with +, keep it, otherwise we'll add country code
  const hasPlus = digits.startsWith("+");
  if (hasPlus) {
    digits = digits.slice(1);
  }
  
  // If the number is short (local), add default country code
  if (digits.length <= 10 && !hasPlus) {
    // Panama numbers are typically 8 digits
    if (digits.length === 8) {
      digits = "507" + digits;
    }
    // US/Canada numbers are 10 digits
    else if (digits.length === 10) {
      digits = "1" + digits;
    }
  }
  
  // Format based on length
  if (digits.length === 11 && digits.startsWith("507")) {
    // Panama: +507 6XXX-XXXX
    return `+507 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    // US/Canada: +1 (XXX) XXX-XXXX
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 12 && digits.startsWith("52")) {
    // Mexico: +52 XX XXXX XXXX
    return `+52 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  } else if (digits.length === 12 && digits.startsWith("57")) {
    // Colombia: +57 XXX XXX XXXX
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  } else if (digits.length >= 10) {
    // Generic international: +XX XXXX XXXX...
    return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`.trim();
  }
  
  // Return as-is if we can't parse
  return input;
}

// Get profile URL from handle
function getProfileUrl(platform: string, handle: string): string {
  if (!handle) return "";
  
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "youtube":
      return `https://www.youtube.com/@${handle}`;
    case "facebook":
      if (handle.includes("facebook.com")) return handle;
      return `https://www.facebook.com/${handle}`;
    case "linkedin":
      if (handle.includes("linkedin.com")) return handle;
      return `https://www.linkedin.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    default:
      return handle;
  }
}

// ============ PHONE INPUT COMPONENT ============

interface PhoneEntry {
  label: string;
  number: string;
  isWhatsApp: boolean;
}

function PhoneInputs({ 
  phones, 
  onChange 
}: { 
  phones: PhoneEntry[]; 
  onChange: (phones: PhoneEntry[]) => void;
}) {
  const addPhone = () => {
    onChange([...phones, { label: "Mobile", number: "", isWhatsApp: false }]);
  };

  const removePhone = (index: number) => {
    onChange(phones.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, field: keyof PhoneEntry, value: string | boolean) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handlePhoneBlur = (index: number, value: string) => {
    const formatted = formatPhoneNumber(value);
    updatePhone(index, "number", formatted);
  };

  return (
    <div className="space-y-2">
      {phones.map((phone, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select 
            value={phone.label} 
            onValueChange={(v) => updatePhone(index, "label", v)}
          >
            <SelectTrigger className="w-[110px] bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHONE_LABELS.map((label) => (
                <SelectItem key={label} value={label}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="tel"
            value={phone.number}
            onChange={(e) => updatePhone(index, "number", e.target.value)}
            onBlur={(e) => handlePhoneBlur(index, e.target.value)}
            placeholder="+507 6123-4567"
            className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={phone.isWhatsApp}
              onChange={(e) => updatePhone(index, "isWhatsApp", e.target.checked)}
              className="rounded"
            />
            <MessageCircle className="h-3 w-3 text-green-500" />
          </label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removePhone(index)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addPhone}
        className="text-xs"
      >
        <Plus className="h-3 w-3 mr-1" /> Add Phone
      </Button>
    </div>
  );
}

// ============ SOCIAL HANDLE INPUT COMPONENT ============

function SocialHandleInput({
  platform,
  value,
  onChange,
  isMonitored,
  isPaused,
  onPauseToggle,
  showPauseControl,
}: {
  platform: keyof typeof PLATFORMS;
  value: string;
  onChange: (value: string) => void;
  isMonitored: boolean;
  isPaused?: boolean;
  onPauseToggle?: () => void;
  showPauseControl?: boolean;
}) {
  const config = PLATFORMS[platform];
  const Icon = config.icon;
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const extracted = extractSocialHandle(platform, e.target.value);
    onChange(extracted);
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        {config.label}
        {isMonitored ? (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
        )}
        {showPauseControl && isMonitored && value && (
          <button
            onClick={onPauseToggle}
            className={`ml-auto text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
              isPaused 
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isPaused ? (
              <>
                <Pause className="h-3 w-3" /> Paused
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" /> Active
              </>
            )}
          </button>
        )}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={isMonitored ? "username or paste URL" : "username or URL"}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
          isPaused ? "opacity-50" : ""
        }`}
      />
      {value && (
        <a
          href={getProfileUrl(platform, value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-1 inline-block"
        >
          {getProfileUrl(platform, value)}
        </a>
      )}
    </div>
  );
}

// ============ MAIN PAGE COMPONENT ============

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

// ============ COMPETITOR CARD COMPONENT ============

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
  const [phones, setPhones] = useState<PhoneEntry[]>(
    competitor.phones?.map((p: any) => ({
      label: p.label || "Mobile",
      number: p.number || "",
      isWhatsApp: p.isWhatsApp || false,
    })) || []
  );
  const [address, setAddress] = useState(competitor.address || "");
  const [address2, setAddress2] = useState(competitor.address2 || "");
  const [city, setCity] = useState(competitor.city || "");
  const [state, setState] = useState(competitor.state || "");
  const [country, setCountry] = useState(competitor.country || "");
  const [notes, setNotes] = useState(competitor.notes || "");
  const [isActive, setIsActive] = useState(competitor.isActive);
  
  // Social handles
  const [instagram, setInstagram] = useState(competitor.socialHandles?.instagram || "");
  const [tiktok, setTiktok] = useState(competitor.socialHandles?.tiktok || "");
  const [youtube, setYoutube] = useState(competitor.socialHandles?.youtube || "");
  const [facebook, setFacebook] = useState(competitor.socialHandles?.facebook || "");
  const [linkedin, setLinkedin] = useState(competitor.socialHandles?.linkedin || "");
  const [twitter, setTwitter] = useState(competitor.socialHandles?.twitter || "");
  
  // Account pause states
  const [accountPauseStates, setAccountPauseStates] = useState<Record<string, boolean>>({});
  
  const [isSaving, setIsSaving] = useState(false);

  // Initialize pause states from accounts
  useEffect(() => {
    const states: Record<string, boolean> = {};
    competitor.accounts?.forEach((acc: any) => {
      states[acc.platform] = acc.isPaused || false;
    });
    setAccountPauseStates(states);
  }, [competitor.accounts]);

  const updateCompetitor = useMutation(api.competitors.update);
  const removeCompetitor = useMutation(api.competitors.remove);
  const toggleAccountPause = useMutation(api.accounts.togglePause);

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
        phones: phones.filter(p => p.number),
        address: address || undefined,
        address2: address2 || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        notes: notes || undefined,
        isActive,
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

  const handleToggleAccountPause = async (platform: string) => {
    const account = competitor.accounts?.find((a: any) => a.platform === platform);
    if (account) {
      await toggleAccountPause({ id: account._id });
      setAccountPauseStates(prev => ({
        ...prev,
        [platform]: !prev[platform]
      }));
    }
  };

  // Count monitored vs unmonitored handles
  const monitoredCount = [instagram, tiktok, youtube].filter(Boolean).length;
  const totalHandles = [instagram, tiktok, youtube, facebook, linkedin, twitter].filter(Boolean).length;
  const pausedCount = Object.values(accountPauseStates).filter(Boolean).length;

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"} ${!competitor.isActive ? "opacity-60" : ""}`}>
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
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {competitor.isActive ? "Active" : "Paused"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="capitalize">{competitor.type.replace(/_/g, " ")}</span>
              <span>•</span>
              <span>{competitor.market?.name}</span>
              <span>•</span>
              <span>{monitoredCount} monitored / {totalHandles} handles</span>
              {pausedCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-yellow-600">{pausedCount} paused</span>
                </>
              )}
            </div>
            
            {/* Social Platform Icons */}
            <div className="flex items-center gap-1 mt-2">
              {competitor.accounts?.map((account: any) => {
                const platform = PLATFORMS[account.platform as keyof typeof PLATFORMS];
                if (!platform) return null;
                const Icon = platform.icon;
                const isPaused = account.isPaused;
                return (
                  <div
                    key={account._id}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${platform.bg} ${isPaused ? "opacity-50" : ""}`}
                    title={`@${account.username}${isPaused ? " (Paused)" : ""}`}
                  >
                    <Icon className={`h-3 w-3 ${platform.color}`} />
                    {account.avatarUrl && (
                      <img src={account.avatarUrl} className="h-4 w-4 rounded-full" alt="" />
                    )}
                    <span className="text-xs">@{account.username}</span>
                    {isPaused && <Pause className="h-3 w-3 text-yellow-500" />}
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
          {/* Status Toggle */}
          <div className="mb-6 flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <span className="font-medium">Competitor Status</span>
              <p className="text-xs text-muted-foreground">Pause to stop monitoring all accounts</p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isActive 
                  ? "bg-green-100 text-green-700 hover:bg-green-200" 
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Active
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" /> Paused
                </>
              )}
            </button>
          </div>

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
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Numbers
                </label>
                <div className="mt-1">
                  <PhoneInputs phones={phones} onChange={setPhones} />
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
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
                <label className="text-sm font-medium text-slate-700">Address Line 2</label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Suite 100, Floor 5"
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
              Paste URLs or usernames - they'll be auto-corrected. Click Active/Paused to control individual account monitoring.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <SocialHandleInput
                platform="instagram"
                value={instagram}
                onChange={setInstagram}
                isMonitored={true}
                isPaused={accountPauseStates.instagram}
                onPauseToggle={() => handleToggleAccountPause("instagram")}
                showPauseControl={!!competitor.accounts?.find((a: any) => a.platform === "instagram")}
              />
              <SocialHandleInput
                platform="tiktok"
                value={tiktok}
                onChange={setTiktok}
                isMonitored={true}
                isPaused={accountPauseStates.tiktok}
                onPauseToggle={() => handleToggleAccountPause("tiktok")}
                showPauseControl={!!competitor.accounts?.find((a: any) => a.platform === "tiktok")}
              />
              <SocialHandleInput
                platform="youtube"
                value={youtube}
                onChange={setYoutube}
                isMonitored={true}
                isPaused={accountPauseStates.youtube}
                onPauseToggle={() => handleToggleAccountPause("youtube")}
                showPauseControl={!!competitor.accounts?.find((a: any) => a.platform === "youtube")}
              />
              <SocialHandleInput
                platform="facebook"
                value={facebook}
                onChange={setFacebook}
                isMonitored={false}
              />
              <SocialHandleInput
                platform="linkedin"
                value={linkedin}
                onChange={setLinkedin}
                isMonitored={false}
              />
              <SocialHandleInput
                platform="twitter"
                value={twitter}
                onChange={setTwitter}
                isMonitored={false}
              />
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

// ============ ADD COMPETITOR CARD COMPONENT ============

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
  const [phones, setPhones] = useState<PhoneEntry[]>([]);
  
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
        phones: phones.filter(p => p.number),
        socialHandles: {
          instagram: extractSocialHandle("instagram", instagram) || undefined,
          tiktok: extractSocialHandle("tiktok", tiktok) || undefined,
          youtube: extractSocialHandle("youtube", youtube) || undefined,
          facebook: extractSocialHandle("facebook", facebook) || undefined,
          linkedin: extractSocialHandle("linkedin", linkedin) || undefined,
          twitter: extractSocialHandle("twitter", twitter) || undefined,
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
          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Numbers
              </label>
              <div className="mt-1">
                <PhoneInputs phones={phones} onChange={setPhones} />
              </div>
            </div>
          </div>
        </div>

        {/* Social Handles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📱 Social Media Handles</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Paste URLs or usernames - they'll be auto-corrected. Instagram, TikTok, and YouTube will be monitored.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <SocialHandleInput
              platform="instagram"
              value={instagram}
              onChange={setInstagram}
              isMonitored={true}
            />
            <SocialHandleInput
              platform="tiktok"
              value={tiktok}
              onChange={setTiktok}
              isMonitored={true}
            />
            <SocialHandleInput
              platform="youtube"
              value={youtube}
              onChange={setYoutube}
              isMonitored={true}
            />
            <SocialHandleInput
              platform="facebook"
              value={facebook}
              onChange={setFacebook}
              isMonitored={false}
            />
            <SocialHandleInput
              platform="linkedin"
              value={linkedin}
              onChange={setLinkedin}
              isMonitored={false}
            />
            <SocialHandleInput
              platform="twitter"
              value={twitter}
              onChange={setTwitter}
              isMonitored={false}
            />
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
