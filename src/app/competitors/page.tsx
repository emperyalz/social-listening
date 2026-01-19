"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  Plus, Trash2, ChevronDown, ChevronUp, X, ExternalLink,
  Globe, Mail, Phone, MapPin, Building2, User, Instagram,
  Facebook, Linkedin, Twitter, Play, Music2, Pause, CheckCircle,
  MessageCircle, Check
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { usePlatformLogos, type PlatformId } from "@/hooks/usePlatformLogos";
import { MultiSelect as SharedMultiSelect } from "@/components/ui/multi-select";

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

const MONITORED_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
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

// ============ UTILITY FUNCTIONS ============

function extractSocialHandle(platform: string, input: string): string {
  if (!input) return "";
  
  let cleaned = input.trim();
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }
  
  if (!cleaned.includes("/") && !cleaned.includes(".")) {
    return cleaned;
  }
  
  try {
    let urlString = cleaned;
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = "https://" + urlString;
    }
    
    const url = new URL(urlString);
    const pathname = url.pathname.replace(/\/$/, "");
    
    switch (platform) {
      case "instagram":
        const igParts = pathname.split("/").filter(Boolean);
        if (igParts.length > 0 && !["p", "reel", "stories", "explore"].includes(igParts[0])) {
          return igParts[0];
        }
        break;
      case "tiktok":
        const ttParts = pathname.split("/").filter(Boolean);
        if (ttParts.length > 0) {
          return ttParts[0].replace(/^@/, "");
        }
        break;
      case "youtube":
        if (pathname.startsWith("/@")) return pathname.slice(2);
        if (pathname.startsWith("/c/")) return pathname.slice(3);
        if (pathname.startsWith("/channel/")) return pathname.slice(9);
        const ytParts = pathname.split("/").filter(Boolean);
        if (ytParts.length > 0 && !["watch", "playlist", "feed", "user", "c", "channel"].includes(ytParts[0])) {
          return ytParts[0].replace(/^@/, "");
        }
        if (ytParts[0] === "user" && ytParts.length > 1) {
          return ytParts[1];
        }
        break;
      case "facebook":
        const fbParts = pathname.split("/").filter(Boolean);
        if (fbParts.length > 0 && fbParts[0] !== "profile.php") {
          return fbParts[0];
        }
        break;
      case "linkedin":
        if (pathname.startsWith("/in/")) return "in/" + pathname.slice(4).split("/")[0];
        if (pathname.startsWith("/company/")) return "company/" + pathname.slice(9).split("/")[0];
        break;
      case "twitter":
        const xParts = pathname.split("/").filter(Boolean);
        if (xParts.length > 0 && !["i", "intent", "search", "hashtag", "home"].includes(xParts[0])) {
          return xParts[0];
        }
        break;
    }
  } catch (e) {}
  
  return cleaned;
}

function formatPhoneNumber(input: string): string {
  if (!input) return "";
  
  let digits = input.replace(/[^\d+]/g, "");
  const hasPlus = digits.startsWith("+");
  if (hasPlus) digits = digits.slice(1);
  
  if (digits.length < 7) return input;
  
  if (digits.length === 8 && !hasPlus) {
    return `+507 ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.startsWith("507") && digits.length === 11) {
    return `+507 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10 && !hasPlus) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.startsWith("1") && digits.length === 11) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (hasPlus || digits.length > 10) {
    return `+${digits}`;
  }
  
  return input;
}

function getProfileUrl(platform: string, handle: string, existingProfileUrl?: string): string {
  // If we have an existing valid profile URL, prefer it (preserves /user/ format etc)
  if (existingProfileUrl && existingProfileUrl.includes("://")) {
    return existingProfileUrl;
  }
  if (!handle) return "";
  if (handle.includes("://")) return handle;

  switch (platform) {
    case "instagram": return `https://www.instagram.com/${handle}`;
    case "tiktok": return `https://www.tiktok.com/@${handle}`;
    case "youtube":
      if (handle.startsWith("UC") && handle.length > 20) {
        return `https://www.youtube.com/channel/${handle}`;
      }
      // Default to @ format for new handles, but existing URLs are preserved above
      return `https://www.youtube.com/@${handle}`;
    case "facebook": return `https://www.facebook.com/${handle}`;
    case "linkedin":
      if (handle.startsWith("in/") || handle.startsWith("company/")) {
        return `https://www.linkedin.com/${handle}`;
      }
      return `https://www.linkedin.com/in/${handle}`;
    case "twitter": return `https://x.com/${handle}`;
    default: return handle;
  }
}

// ============ MULTI-SELECT DROPDOWN COMPONENT ============

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  icon?: React.ReactNode;
}

function MultiSelect({ options, selected, onChange, placeholder, icon }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const displayText = selected.length === 0 
    ? placeholder 
    : selected.length === 1 
      ? options.find(o => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[200px] h-10 px-3 py-2 text-sm bg-white border rounded-md hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <span title="Clear this filter">
              <X 
                className="h-4 w-4 text-slate-400 hover:text-red-500 cursor-pointer" 
                onClick={clearThis}
              />
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[200px] bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {selected.length > 0 && (
            <div
              onClick={clearThis}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 cursor-pointer border-b text-red-600 text-sm"
            >
              <X className="h-4 w-4" />
              Clear selection ({selected.length})
            </div>
          )}
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 cursor-pointer"
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                selected.includes(option.value) ? "bg-primary border-primary" : "border-slate-300"
              }`}>
                {selected.includes(option.value) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ PHONE INPUT COMPONENT ============

interface PhoneEntry {
  label: string;
  number: string;
  isWhatsApp: boolean;
}

function PhoneInputs({ phones, onChange }: { phones: PhoneEntry[]; onChange: (phones: PhoneEntry[]) => void }) {
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
          <Select value={phone.label} onValueChange={(v) => updatePhone(index, "label", v)}>
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
          <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={phone.isWhatsApp}
              onChange={(e) => updatePhone(index, "isWhatsApp", e.target.checked)}
              className="rounded"
            />
            <MessageCircle className="h-3 w-3 text-green-500" />
          </label>
          <button
            type="button"
            onClick={() => removePhone(index)}
            className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addPhone} className="text-xs">
        <Plus className="h-3 w-3 mr-1" /> Add Phone
      </Button>
    </div>
  );
}

// ============ SOCIAL HANDLE INPUT WITH PAUSE TOGGLE ============

function SocialHandleInput({
  platform,
  value,
  onChange,
  isMonitored,
  isPaused,
  onPauseToggle,
  showPauseControl,
  competitorPaused,
  existingProfileUrl,
}: {
  platform: keyof typeof PLATFORMS;
  value: string;
  onChange: (value: string) => void;
  isMonitored: boolean;
  isPaused?: boolean;
  onPauseToggle?: () => void;
  showPauseControl?: boolean;
  competitorPaused?: boolean;
  existingProfileUrl?: string;
}) {
  const config = PLATFORMS[platform];
  const Icon = config.icon;

  const handleBlur = () => {
    const cleaned = extractSocialHandle(platform, value);
    if (cleaned !== value) {
      onChange(cleaned);
    }
  };

  const cleanedHandle = extractSocialHandle(platform, value);
  const profileUrl = getProfileUrl(platform, cleanedHandle, existingProfileUrl);
  
  // Effective pause state - paused if competitor is paused OR this specific account is paused
  const effectivelyPaused = competitorPaused || isPaused;

  const handlePauseClick = () => {
    if (onPauseToggle) {
      onPauseToggle();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="text-sm font-medium text-slate-700">{config.label}</span>
        {isMonitored ? (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
        )}
        {/* PAUSE TOGGLE BUTTON */}
        {isMonitored && cleanedHandle && !competitorPaused && showPauseControl && (
          <button
            type="button"
            onClick={handlePauseClick}
            className={`ml-auto text-xs px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
              isPaused 
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300" 
                : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
            }`}
          >
            {isPaused ? (
              <><Pause className="h-3 w-3" /> Paused</>
            ) : (
              <><CheckCircle className="h-3 w-3" /> Active</>
            )}
          </button>
        )}
        {/* Show disabled paused indicator when competitor is paused */}
        {isMonitored && cleanedHandle && competitorPaused && (
          <span className="ml-auto text-xs px-2 py-1 rounded flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-300 opacity-60">
            <Pause className="h-3 w-3" /> Paused
          </span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={isMonitored ? "username or paste URL" : "username or URL"}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm ${effectivelyPaused ? "opacity-50" : ""}`}
      />
      {cleanedHandle && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-1 inline-block truncate max-w-full"
        >
          {profileUrl}
        </a>
      )}
    </div>
  );
}

// ============ MAIN PAGE COMPONENT ============

export default function CompetitorsPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);

  const markets = useQuery(api.markets.list);
  const competitors = useQuery(api.competitors.list, {});
  const stats = useQuery(api.competitors.getStats);
  const migrateAccounts = useMutation(api.competitors.migrateFromAccounts);
  const { getLogoUrl, getEmoji, platforms: allPlatforms } = usePlatformLogos();

  // Platform options with logos for dropdown
  const scrapingPlatforms: ("instagram" | "tiktok" | "youtube")[] = ["instagram", "tiktok", "youtube"];
  const platformOptionsWithLogos = scrapingPlatforms.map((p) => {
    const logoUrl = getLogoUrl(p, "dropdowns");
    const emoji = getEmoji(p);
    const platform = allPlatforms?.find(pl => pl.platformId === p);
    return {
      label: platform?.displayName || p.charAt(0).toUpperCase() + p.slice(1),
      value: p,
      icon: logoUrl || undefined,
      emoji: !logoUrl ? emoji : undefined,
    };
  });

  // Render platform logo or emoji fallback
  const renderPlatformLogo = (platform: string, size: string = "h-4 w-4") => {
    const logoUrl = getLogoUrl(platform as PlatformId, "competitors");
    if (logoUrl) {
      return <img src={logoUrl} alt={platform} className={`${size} object-contain`} />;
    }
    const platformConfig = PLATFORMS[platform as keyof typeof PLATFORMS];
    if (platformConfig) {
      const Icon = platformConfig.icon;
      return <Icon className={`${size} ${platformConfig.color}`} />;
    }
    return <span>{getEmoji(platform as PlatformId)}</span>;
  };

  const filteredCompetitors = competitors?.filter(competitor => {
    if (selectedTypes.length > 0 && !selectedTypes.includes(competitor.type)) return false;
    if (selectedMarkets.length > 0 && !selectedMarkets.includes(competitor.marketId)) return false;
    if (selectedPlatforms.length > 0) {
      const competitorPlatforms = competitor.accounts?.map((a: any) => a.platform) || [];
      if (!selectedPlatforms.some(p => competitorPlatforms.includes(p))) return false;
    }
    return true;
  });

  const marketOptions = markets?.map(m => ({ value: m._id, label: m.name })) || [];
  const hasAnyFilter = selectedTypes.length > 0 || selectedMarkets.length > 0 || selectedPlatforms.length > 0;

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
          <p className="text-muted-foreground">Manage competitor profiles and their social accounts</p>
        </div>
        <div className="flex gap-2">
          {stats && stats.unlinkedAccounts > 0 && (
            <Button variant="outline" onClick={handleMigrate}>
              Migrate {stats.unlinkedAccounts} Accounts
            </Button>
          )}
          <Button onClick={handleAddClick} variant={showAddCard ? "outline" : "default"}>
            {showAddCard ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Competitor</>}
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

      {/* Multi-Select Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <MultiSelect
          options={COMPETITOR_TYPES}
          selected={selectedTypes}
          onChange={setSelectedTypes}
          placeholder="All Types"
          icon={<Building2 className="h-4 w-4 text-slate-400" />}
        />
        <MultiSelect
          options={marketOptions}
          selected={selectedMarkets}
          onChange={setSelectedMarkets}
          placeholder="All Markets"
          icon={<MapPin className="h-4 w-4 text-slate-400" />}
        />
        <SharedMultiSelect
          options={platformOptionsWithLogos}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
          placeholder="All Platforms"
          logoOnly={true}
        />
        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTypes([]);
              setSelectedMarkets([]);
              setSelectedPlatforms([]);
            }}
            className="text-slate-500 hover:text-red-500"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Add New Card */}
      {showAddCard && <AddCompetitorCard markets={markets || []} onClose={() => setShowAddCard(false)} />}

      {/* Competitors List */}
      <div className="space-y-3">
        {filteredCompetitors?.map((competitor) => (
          <CompetitorCard
            key={competitor._id}
            competitor={competitor}
            markets={markets || []}
            isExpanded={expandedId === competitor._id}
            onToggle={() => toggleExpand(competitor._id)}
            renderPlatformLogo={renderPlatformLogo}
          />
        ))}
        {filteredCompetitors?.length === 0 && !showAddCard && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {competitors?.length === 0 
                ? 'No competitors found. Click "Add Competitor" to start tracking.'
                : 'No competitors match the current filters.'}
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
  renderPlatformLogo,
}: {
  competitor: any;
  markets: any[];
  isExpanded: boolean;
  onToggle: () => void;
  renderPlatformLogo: (platform: string, size?: string) => React.ReactNode;
}) {
  const cleanHandle = (platform: string, val: string) => extractSocialHandle(platform, val || "");
  
  const [name, setName] = useState(competitor.name);
  const [type, setType] = useState<CompetitorType>(competitor.type);
  const [marketId, setMarketId] = useState(competitor.marketId);
  const [website, setWebsite] = useState(competitor.website || "");
  const [email, setEmail] = useState(competitor.email || "");
  
  const [phones, setPhones] = useState<PhoneEntry[]>(() => {
    const rawPhones = competitor.phones;
    if (!rawPhones || rawPhones.length === 0) return [];
    if (typeof rawPhones[0] === 'string') {
      return rawPhones.map((num: string) => ({
        label: "Mobile",
        number: formatPhoneNumber(num),
        isWhatsApp: false,
      }));
    }
    return rawPhones.map((p: any) => ({
      label: p.label || "Mobile",
      number: formatPhoneNumber(p.number || ""),
      isWhatsApp: p.isWhatsApp || false,
    }));
  });
  
  const [address, setAddress] = useState(competitor.address || "");
  const [address2, setAddress2] = useState(competitor.address2 || "");
  const [city, setCity] = useState(competitor.city || "");
  const [state, setState] = useState(competitor.state || "");
  const [country, setCountry] = useState(competitor.country || "");
  const [notes, setNotes] = useState(competitor.notes || "");
  const [displayAvatarAccountId, setDisplayAvatarAccountId] = useState<string | null>(
    competitor.displayAvatarAccountId || null
  );

  const [instagram, setInstagram] = useState(cleanHandle("instagram", competitor.socialHandles?.instagram));
  const [tiktok, setTiktok] = useState(cleanHandle("tiktok", competitor.socialHandles?.tiktok));
  const [youtube, setYoutube] = useState(cleanHandle("youtube", competitor.socialHandles?.youtube));
  const [facebook, setFacebook] = useState(cleanHandle("facebook", competitor.socialHandles?.facebook));
  const [linkedin, setLinkedin] = useState(cleanHandle("linkedin", competitor.socialHandles?.linkedin));
  const [twitter, setTwitter] = useState(cleanHandle("twitter", competitor.socialHandles?.twitter));
  
  // Track pause states for each platform account
  const [accountPauseStates, setAccountPauseStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    competitor.accounts?.forEach((acc: any) => {
      states[acc.platform] = acc.isPaused || false;
    });
    return states;
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const updateCompetitor = useMutation(api.competitors.update);
  const removeCompetitor = useMutation(api.competitors.remove);
  const toggleAccountPause = useMutation(api.accounts.togglePause);

  // Toggle competitor active status - saves immediately
  const handleToggleCompetitorStatus = async () => {
    setIsTogglingStatus(true);
    try {
      await updateCompetitor({
        id: competitor._id,
        isActive: !competitor.isActive,
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Handle saving other competitor details
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanedHandles = {
        instagram: extractSocialHandle("instagram", instagram) || undefined,
        tiktok: extractSocialHandle("tiktok", tiktok) || undefined,
        youtube: extractSocialHandle("youtube", youtube) || undefined,
        facebook: extractSocialHandle("facebook", facebook) || undefined,
        linkedin: extractSocialHandle("linkedin", linkedin) || undefined,
        twitter: extractSocialHandle("twitter", twitter) || undefined,
      };
      
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
        socialHandles: cleanedHandles,
        // Pass the selected avatar account, or null to clear if explicitly unset
        displayAvatarAccountId: displayAvatarAccountId || null,
      } as any);
      
      setInstagram(cleanedHandles.instagram || "");
      setTiktok(cleanedHandles.tiktok || "");
      setYoutube(cleanedHandles.youtube || "");
      setFacebook(cleanedHandles.facebook || "");
      setLinkedin(cleanedHandles.linkedin || "");
      setTwitter(cleanedHandles.twitter || "");
      
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

  // Toggle pause for individual platform account
  const handleToggleAccountPause = async (platform: string) => {
    // Don't allow toggling individual accounts if competitor is paused
    if (!competitor.isActive) {
      alert("Enable competitor monitoring first before toggling individual platforms.");
      return;
    }
    
    const account = competitor.accounts?.find((a: any) => a.platform === platform);
    
    if (account) {
      try {
        const result = await toggleAccountPause({ id: account._id });
        if (result) {
          setAccountPauseStates(prev => ({
            ...prev,
            [platform]: result.isPaused
          }));
        }
      } catch (error) {
        console.error("Error toggling pause:", error);
        alert("Failed to toggle pause. Check console for details.");
      }
    } else {
      alert(`No account found for ${platform}. Save the competitor first to create accounts.`);
    }
  };

  const cleanedIg = extractSocialHandle("instagram", instagram);
  const cleanedTt = extractSocialHandle("tiktok", tiktok);
  const cleanedYt = extractSocialHandle("youtube", youtube);
  const cleanedFb = extractSocialHandle("facebook", facebook);
  const cleanedLi = extractSocialHandle("linkedin", linkedin);
  const cleanedTw = extractSocialHandle("twitter", twitter);
  
  const monitoredCount = [cleanedIg, cleanedTt, cleanedYt].filter(Boolean).length;
  const totalHandles = [cleanedIg, cleanedTt, cleanedYt, cleanedFb, cleanedLi, cleanedTw].filter(Boolean).length;
  
  // Count paused - if competitor is paused, all are effectively paused
  const pausedCount = competitor.isActive 
    ? Object.values(accountPauseStates).filter(Boolean).length 
    : monitoredCount;

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"} ${!competitor.isActive ? "opacity-60" : ""}`}>
      {/* Collapsed View */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          {/* Priority: displayAvatarUrl > logoUrl > fallback icon */}
          {competitor.displayAvatarUrl ? (
            <img src={competitor.displayAvatarUrl} alt={competitor.name} className="h-14 w-14 rounded-full object-cover border-2 border-slate-200" />
          ) : competitor.logoUrl ? (
            <img src={competitor.logoUrl} alt={competitor.name} className="h-14 w-14 rounded-lg object-cover border" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
              {competitor.type === "individual_broker" ? <User className="h-6 w-6 text-slate-500" /> : <Building2 className="h-6 w-6 text-slate-500" />}
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{competitor.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${competitor.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
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
                  <span className="text-yellow-600">
                    {competitor.isActive ? `${pausedCount} paused` : "All paused"}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {competitor.accounts?.map((account: any) => {
                const platformConfig = PLATFORMS[account.platform as keyof typeof PLATFORMS];
                if (!platformConfig) return null;
                // If competitor is paused, all accounts are effectively paused
                const isPaused = !competitor.isActive || accountPauseStates[account.platform] || account.isPaused;
                const cleanedUsername = extractSocialHandle(account.platform, account.username);
                return (
                  <div
                    key={account._id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded ${platformConfig.bg} ${isPaused ? "opacity-50" : ""}`}
                    title={`@${cleanedUsername}${isPaused ? " (Paused)" : ""}`}
                  >
                    {renderPlatformLogo(account.platform, "h-3.5 w-3.5")}
                    {account.avatarUrl && <img src={account.avatarUrl} className="h-4 w-4 rounded-full" alt="" />}
                    <span className="text-xs">@{cleanedUsername}</span>
                    {isPaused && <Pause className="h-3 w-3 text-yellow-500" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {competitor.website && (
            <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-full" onClick={(e) => e.stopPropagation()}>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
          {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Edit Form */}
      {isExpanded && (
        <div className="border-t bg-slate-50 p-6">
          {/* Status Toggle - SAVES IMMEDIATELY */}
          <div className="mb-6 flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <span className="font-medium">Competitor Monitoring</span>
              <p className="text-xs text-muted-foreground">
                {competitor.isActive 
                  ? "Monitoring active. Click to pause all platform monitoring." 
                  : "Monitoring paused. Click to resume."}
              </p>
            </div>
            <button
              type="button"
              disabled={isTogglingStatus}
              onClick={handleToggleCompetitorStatus}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 ${
                competitor.isActive 
                  ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300" 
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
              }`}
            >
              {isTogglingStatus ? (
                "Saving..."
              ) : competitor.isActive ? (
                <><CheckCircle className="h-4 w-4" /> Active</>
              ) : (
                <><Pause className="h-4 w-4" /> Paused</>
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
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as CompetitorType)}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMPETITOR_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Market</label>
                <Select value={marketId} onValueChange={(v) => setMarketId(v as Id<"markets">)}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {markets.map((m) => (<SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display Avatar Section */}
          {competitor.accounts && competitor.accounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Display Avatar
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Choose which social account's profile picture to use as the competitor's avatar.
              </p>
              <div className="flex items-center gap-4">
                {/* Preview of current avatar */}
                <div className="flex-shrink-0">
                  {displayAvatarAccountId ? (
                    (() => {
                      const selectedAcc = competitor.accounts?.find((a: any) => a._id === displayAvatarAccountId);
                      return selectedAcc?.avatarUrl ? (
                        <img src={selectedAcc.avatarUrl} alt="Selected avatar" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs">
                          No image
                        </div>
                      );
                    })()
                  ) : competitor.displayAvatarUrl ? (
                    <img src={competitor.displayAvatarUrl} alt="Auto avatar" className="h-16 w-16 rounded-full object-cover border-2 border-slate-300" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                      {competitor.type === "individual_broker" ? <User className="h-6 w-6 text-slate-500" /> : <Building2 className="h-6 w-6 text-slate-500" />}
                    </div>
                  )}
                </div>

                {/* Avatar selection */}
                <div className="flex-1">
                  <Select
                    value={displayAvatarAccountId || "_auto"}
                    onValueChange={(v) => setDisplayAvatarAccountId(v === "_auto" ? null : v)}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Auto-select avatar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_auto">
                        <span className="flex items-center gap-2">
                          <span className="text-slate-400">Auto</span>
                          <span className="text-xs text-muted-foreground">(first available)</span>
                        </span>
                      </SelectItem>
                      {competitor.accounts?.filter((acc: any) => acc.avatarUrl).map((acc: any) => {
                        const platformConfig = PLATFORMS[acc.platform as keyof typeof PLATFORMS];
                        return (
                          <SelectItem key={acc._id} value={acc._id}>
                            <span className="flex items-center gap-2">
                              <img src={acc.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                              {renderPlatformLogo(acc.platform, "h-4 w-4")}
                              <span>@{extractSocialHandle(acc.platform, acc.username)}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {competitor.accounts?.filter((acc: any) => acc.avatarUrl).length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No account avatars available yet. Avatars are fetched during scraping.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Contact Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Numbers
                </label>
                <div className="mt-1"><PhoneInputs phones={phones} onChange={setPhones} /></div>
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
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Address Line 2</label>
                <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Suite 100, Floor 5" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State/Province</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Social Handles Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Social Media Handles</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {competitor.isActive 
                ? "Click Active/Paused to control individual platform monitoring."
                : "Competitor monitoring is paused. Enable it above to control individual platforms."}
            </p>
            <div className={`grid gap-4 md:grid-cols-3 ${!competitor.isActive ? "opacity-50" : ""}`}>
              <SocialHandleInput
                platform="instagram"
                value={instagram}
                onChange={setInstagram}
                isMonitored={true}
                isPaused={!competitor.isActive || accountPauseStates.instagram}
                onPauseToggle={() => handleToggleAccountPause("instagram")}
                showPauseControl={competitor.isActive && !!competitor.accounts?.find((a: any) => a.platform === "instagram")}
                competitorPaused={!competitor.isActive}
                existingProfileUrl={competitor.accounts?.find((a: any) => a.platform === "instagram")?.profileUrl}
              />
              <SocialHandleInput
                platform="tiktok"
                value={tiktok}
                onChange={setTiktok}
                isMonitored={true}
                isPaused={!competitor.isActive || accountPauseStates.tiktok}
                onPauseToggle={() => handleToggleAccountPause("tiktok")}
                showPauseControl={competitor.isActive && !!competitor.accounts?.find((a: any) => a.platform === "tiktok")}
                competitorPaused={!competitor.isActive}
                existingProfileUrl={competitor.accounts?.find((a: any) => a.platform === "tiktok")?.profileUrl}
              />
              <SocialHandleInput
                platform="youtube"
                value={youtube}
                onChange={setYoutube}
                isMonitored={true}
                isPaused={!competitor.isActive || accountPauseStates.youtube}
                onPauseToggle={() => handleToggleAccountPause("youtube")}
                showPauseControl={competitor.isActive && !!competitor.accounts?.find((a: any) => a.platform === "youtube")}
                competitorPaused={!competitor.isActive}
                existingProfileUrl={competitor.accounts?.find((a: any) => a.platform === "youtube")?.profileUrl}
              />
              <SocialHandleInput platform="facebook" value={facebook} onChange={setFacebook} isMonitored={false} />
              <SocialHandleInput platform="linkedin" value={linkedin} onChange={setLinkedin} isMonitored={false} />
              <SocialHandleInput platform="twitter" value={twitter} onChange={setTwitter} isMonitored={false} />
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes about this competitor..." rows={2} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-200">
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Competitor
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onToggle}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============ ADD COMPETITOR CARD COMPONENT ============

function AddCompetitorCard({ markets, onClose }: { markets: any[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CompetitorType>("brokerage");
  const [marketId, setMarketId] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phones, setPhones] = useState<PhoneEntry[]>([]);
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
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Company or person name" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Type *</label>
              <Select value={type} onValueChange={(v) => setType(v as CompetitorType)}>
                <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPETITOR_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Market *</label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="Select market" /></SelectTrigger>
                <SelectContent>
                  {markets.map((m) => (<SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact (Optional)</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Numbers</label>
              <div className="mt-1"><PhoneInputs phones={phones} onChange={setPhones} /></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Social Media Handles</h3>
          <p className="text-xs text-muted-foreground mb-3">Paste URLs or usernames. Instagram, TikTok, and YouTube will be monitored.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <SocialHandleInput platform="instagram" value={instagram} onChange={setInstagram} isMonitored={true} />
            <SocialHandleInput platform="tiktok" value={tiktok} onChange={setTiktok} isMonitored={true} />
            <SocialHandleInput platform="youtube" value={youtube} onChange={setYoutube} isMonitored={true} />
            <SocialHandleInput platform="facebook" value={facebook} onChange={setFacebook} isMonitored={false} />
            <SocialHandleInput platform="linkedin" value={linkedin} onChange={setLinkedin} isMonitored={false} />
            <SocialHandleInput platform="twitter" value={twitter} onChange={setTwitter} isMonitored={false} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !name || !marketId} className="bg-green-600 hover:bg-green-700">
            {isSaving ? "Creating..." : "Add Competitor"}
          </Button>
        </div>
      </div>
    </Card>
  );
}