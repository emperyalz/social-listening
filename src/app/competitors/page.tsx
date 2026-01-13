"use client";

import { useState, useEffect, useRef } from "react";
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

// Extract username from various social media URL formats
function extractSocialHandle(platform: string, input: string): string {
  if (!input) return "";
  
  let cleaned = input.trim();
  
  // Remove @ prefix if present
  if (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }
  
  // If it doesn't look like a URL, return as-is (already a handle)
  if (!cleaned.includes("/") && !cleaned.includes(".")) {
    return cleaned;
  }
  
  // Handle full URLs
  try {
    // Add protocol if missing for URL parsing
    let urlString = cleaned;
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = "https://" + urlString;
    }
    
    const url = new URL(urlString);
    const pathname = url.pathname.replace(/\/$/, ""); // Remove trailing slash
    
    switch (platform) {
      case "instagram":
        // https://www.instagram.com/username/ or /username/?hl=en
        const igParts = pathname.split("/").filter(Boolean);
        if (igParts.length > 0 && !["p", "reel", "stories", "explore"].includes(igParts[0])) {
          return igParts[0];
        }
        break;
        
      case "tiktok":
        // https://www.tiktok.com/@username
        const ttParts = pathname.split("/").filter(Boolean);
        if (ttParts.length > 0) {
          return ttParts[0].replace(/^@/, "");
        }
        break;
        
      case "youtube":
        // https://www.youtube.com/@username or /channel/xxx or /c/username
        if (pathname.startsWith("/@")) {
          return pathname.slice(2);
        }
        if (pathname.startsWith("/c/")) {
          return pathname.slice(3);
        }
        if (pathname.startsWith("/channel/")) {
          // For channel IDs, keep the full ID
          return pathname.slice(9);
        }
        const ytParts = pathname.split("/").filter(Boolean);
        if (ytParts.length > 0 && !["watch", "playlist", "feed"].includes(ytParts[0])) {
          return ytParts[0].replace(/^@/, "");
        }
        break;
        
      case "facebook":
        // https://www.facebook.com/pagename
        const fbParts = pathname.split("/").filter(Boolean);
        if (fbParts.length > 0 && fbParts[0] !== "profile.php") {
          return fbParts[0];
        }
        break;
        
      case "linkedin":
        // https://www.linkedin.com/in/username or /company/name
        if (pathname.startsWith("/in/")) {
          return "in/" + pathname.slice(4).split("/")[0];
        }
        if (pathname.startsWith("/company/")) {
          return "company/" + pathname.slice(9).split("/")[0];
        }
        break;
        
      case "twitter":
        // https://twitter.com/username or https://x.com/username
        const xParts = pathname.split("/").filter(Boolean);
        if (xParts.length > 0 && !["i", "intent", "search", "hashtag", "home"].includes(xParts[0])) {
          return xParts[0];
        }
        break;
    }
  } catch (e) {
    // Not a valid URL
  }
  
  // If URL parsing failed, try to extract from the string
  const urlPatterns = [
    /instagram\.com\/([^\/\?\&]+)/,
    /tiktok\.com\/@?([^\/\?\&]+)/,
    /youtube\.com\/@([^\/\?\&]+)/,
    /youtube\.com\/channel\/([^\/\?\&]+)/,
    /youtube\.com\/c\/([^\/\?\&]+)/,
    /facebook\.com\/([^\/\?\&]+)/,
    /linkedin\.com\/(in|company)\/([^\/\?\&]+)/,
    /(?:twitter|x)\.com\/([^\/\?\&]+)/,
  ];
  
  for (const pattern of urlPatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      // Handle linkedin special case
      if (pattern.toString().includes("linkedin")) {
        return match[1] + "/" + match[2];
      }
      return match[1];
    }
  }
  
  // Last resort - return cleaned input
  return cleaned;
}

// Format phone number to consistent format
function formatPhoneNumber(input: string): string {
  if (!input) return "";
  
  // Remove all non-digit characters except +
  let digits = input.replace(/[^\d+]/g, "");
  
  // Handle + at the start
  const hasPlus = digits.startsWith("+");
  if (hasPlus) {
    digits = digits.slice(1);
  }
  
  // If very short, return as-is
  if (digits.length < 7) {
    return input;
  }
  
  // Panama numbers (8 digits, country code 507)
  if (digits.length === 8 && !hasPlus) {
    return `+507 ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  
  // Already has Panama country code
  if (digits.startsWith("507") && digits.length === 11) {
    return `+507 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  
  // US/Canada (10 digits, country code 1)
  if (digits.length === 10 && !hasPlus) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Already has US country code
  if (digits.startsWith("1") && digits.length === 11) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Mexico (10 digits, country code 52)
  if (digits.startsWith("52") && digits.length === 12) {
    return `+52 ${digits.slice(2, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  }
  
  // Colombia (10 digits, country code 57)
  if (digits.startsWith("57") && digits.length === 12) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  // Generic format with + prefix
  if (hasPlus || digits.length > 10) {
    return `+${digits}`;
  }
  
  return input;
}

// Get profile URL from handle
function getProfileUrl(platform: string, handle: string): string {
  if (!handle) return "";
  
  // If handle is already a full URL, return it
  if (handle.includes("://")) return handle;
  
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "youtube":
      // Handle channel IDs vs usernames
      if (handle.startsWith("UC") && handle.length > 20) {
        return `https://www.youtube.com/channel/${handle}`;
      }
      return `https://www.youtube.com/@${handle}`;
    case "facebook":
      return `https://www.facebook.com/${handle}`;
    case "linkedin":
      if (handle.startsWith("in/") || handle.startsWith("company/")) {
        return `https://www.linkedin.com/${handle}`;
      }
      return `https://www.linkedin.com/in/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    default:
      return handle;
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

  // Close on click outside
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

  const clearAll = (e: React.MouseEvent) => {
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
            <X 
              className="h-4 w-4 text-slate-400 hover:text-slate-600" 
              onClick={clearAll}
            />
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[200px] bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
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
          <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
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
  
  // Clean the value when it changes (on paste or input)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  // Clean on blur
  const handleBlur = () => {
    const cleaned = extractSocialHandle(platform, value);
    if (cleaned !== value) {
      onChange(cleaned);
    }
  };

  const cleanedHandle = extractSocialHandle(platform, value);
  const profileUrl = getProfileUrl(platform, cleanedHandle);

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2 flex-wrap">
        <Icon className={`h-4 w-4 ${config.color}`} />
        {config.label}
        {isMonitored ? (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Monitored</span>
        ) : (
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 rounded">Reference</span>
        )}
        {showPauseControl && isMonitored && cleanedHandle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onPauseToggle) onPauseToggle();
            }}
            className={`ml-auto text-xs px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer ${
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
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={isMonitored ? "username or paste URL" : "username or URL"}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
          isPaused ? "opacity-50" : ""
        }`}
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

  // Filter competitors based on multi-select
  const filteredCompetitors = competitors?.filter(competitor => {
    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(competitor.type)) {
      return false;
    }
    // Market filter
    if (selectedMarkets.length > 0 && !selectedMarkets.includes(competitor.marketId)) {
      return false;
    }
    // Platform filter - check if competitor has any of the selected platforms
    if (selectedPlatforms.length > 0) {
      const competitorPlatforms = competitor.accounts?.map((a: any) => a.platform) || [];
      const hasSelectedPlatform = selectedPlatforms.some(p => competitorPlatforms.includes(p));
      if (!hasSelectedPlatform) return false;
    }
    return true;
  });

  const marketOptions = markets?.map(m => ({ value: m._id, label: m.name })) || [];

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

      {/* Multi-Select Filters */}
      <div className="flex gap-4 flex-wrap">
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
        <MultiSelect
          options={MONITORED_PLATFORMS}
          selected={selectedPlatforms}
          onChange={setSelectedPlatforms}
          placeholder="All Platforms"
          icon={<Instagram className="h-4 w-4 text-slate-400" />}
        />
        {(selectedTypes.length > 0 || selectedMarkets.length > 0 || selectedPlatforms.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTypes([]);
              setSelectedMarkets([]);
              setSelectedPlatforms([]);
            }}
            className="text-slate-500"
          >
            Clear All Filters
          </Button>
        )}
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
        {filteredCompetitors?.map((competitor) => (
          <CompetitorCard
            key={competitor._id}
            competitor={competitor}
            markets={markets || []}
            isExpanded={expandedId === competitor._id}
            onToggle={() => toggleExpand(competitor._id)}
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
}: {
  competitor: any;
  markets: any[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Clean social handles on load
  const cleanHandle = (platform: string, val: string) => extractSocialHandle(platform, val || "");
  
  const [name, setName] = useState(competitor.name);
  const [type, setType] = useState<CompetitorType>(competitor.type);
  const [marketId, setMarketId] = useState(competitor.marketId);
  const [website, setWebsite] = useState(competitor.website || "");
  const [email, setEmail] = useState(competitor.email || "");
  
  // Handle phone migration from old format
  const [phones, setPhones] = useState<PhoneEntry[]>(() => {
    const rawPhones = competitor.phones;
    if (!rawPhones || rawPhones.length === 0) return [];
    
    // Check if it's old format (array of strings) or new format (array of objects)
    if (typeof rawPhones[0] === 'string') {
      // Old format - convert
      return rawPhones.map((num: string) => ({
        label: "Mobile",
        number: formatPhoneNumber(num),
        isWhatsApp: false,
      }));
    }
    // New format
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
  const [isActive, setIsActive] = useState(competitor.isActive);
  
  // Social handles - clean on load
  const [instagram, setInstagram] = useState(cleanHandle("instagram", competitor.socialHandles?.instagram));
  const [tiktok, setTiktok] = useState(cleanHandle("tiktok", competitor.socialHandles?.tiktok));
  const [youtube, setYoutube] = useState(cleanHandle("youtube", competitor.socialHandles?.youtube));
  const [facebook, setFacebook] = useState(cleanHandle("facebook", competitor.socialHandles?.facebook));
  const [linkedin, setLinkedin] = useState(cleanHandle("linkedin", competitor.socialHandles?.linkedin));
  const [twitter, setTwitter] = useState(cleanHandle("twitter", competitor.socialHandles?.twitter));
  
  // Account pause states - initialize from accounts
  const [accountPauseStates, setAccountPauseStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    competitor.accounts?.forEach((acc: any) => {
      states[acc.platform] = acc.isPaused || false;
    });
    return states;
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const updateCompetitor = useMutation(api.competitors.update);
  const removeCompetitor = useMutation(api.competitors.remove);
  const toggleAccountPause = useMutation(api.accounts.togglePause);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Clean all handles before saving
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
        isActive,
        socialHandles: cleanedHandles,
      });
      
      // Update local state with cleaned handles
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

  const handleToggleAccountPause = async (platform: string) => {
    const account = competitor.accounts?.find((a: any) => a.platform === platform);
    if (account) {
      const result = await toggleAccountPause({ id: account._id });
      if (result) {
        setAccountPauseStates(prev => ({
          ...prev,
          [platform]: result.isPaused
        }));
      }
    }
  };

  // Count monitored vs unmonitored handles (use cleaned values)
  const cleanedIg = extractSocialHandle("instagram", instagram);
  const cleanedTt = extractSocialHandle("tiktok", tiktok);
  const cleanedYt = extractSocialHandle("youtube", youtube);
  const cleanedFb = extractSocialHandle("facebook", facebook);
  const cleanedLi = extractSocialHandle("linkedin", linkedin);
  const cleanedTw = extractSocialHandle("twitter", twitter);
  
  const monitoredCount = [cleanedIg, cleanedTt, cleanedYt].filter(Boolean).length;
  const totalHandles = [cleanedIg, cleanedTt, cleanedYt, cleanedFb, cleanedLi, cleanedTw].filter(Boolean).length;
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
            
            {/* Social Platform Chips - show cleaned handles */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {competitor.accounts?.map((account: any) => {
                const platform = PLATFORMS[account.platform as keyof typeof PLATFORMS];
                if (!platform) return null;
                const Icon = platform.icon;
                const isPaused = accountPauseStates[account.platform] || account.isPaused;
                const cleanedUsername = extractSocialHandle(account.platform, account.username);
                return (
                  <div
                    key={account._id}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${platform.bg} ${isPaused ? "opacity-50" : ""}`}
                    title={`@${cleanedUsername}${isPaused ? " (Paused)" : ""}`}
                  >
                    <Icon className={`h-3 w-3 ${platform.color}`} />
                    {account.avatarUrl && (
                      <img src={account.avatarUrl} className="h-4 w-4 rounded-full" alt="" />
                    )}
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
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${
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
              Paste URLs or usernames - they'll be auto-cleaned on save. Click Active/Paused to control individual account monitoring.
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
            Paste URLs or usernames - they'll be auto-cleaned. Instagram, TikTok, and YouTube will be monitored.
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
