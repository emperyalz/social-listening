"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Upload,
  Link as LinkIcon,
  Instagram,
  Linkedin,
  Globe,
  FileText,
  Check,
  Plus,
  X,
  Save,
  Image as ImageIcon,
  MapPin,
  Youtube,
  Facebook,
  ExternalLink,
} from "lucide-react";

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Twitter/X Icon
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

type PlatformType = "instagram" | "youtube" | "tiktok" | "linkedin" | "facebook" | "twitter";

interface SocialConnection {
  platform: string;
  handle: string;
  url: string;
  connected: boolean;
  icon: PlatformType;
}

// Demo data for Grupo Horizonte
const DEMO_PROFILE = {
  companyName: "Grupo Horizonte",
  legalName: "Grupo Horizonte S.A.S.",
  taxId: "900.123.456-7",
  hqLocation: "Bogota, Colombia",
  websiteUrl: "https://grupohorizonte.com.co",
  avatarUrl: null,
  bannerUrl: null,
  brandDocuments: [
    { name: "Brand Guidelines 2024.pdf", status: "verified", storageId: "demo-1" },
    { name: "Tone of Voice Manual.docx", status: "verified", storageId: "demo-2" },
    { name: "Social Media Playbook.pdf", status: "pending", storageId: "demo-3" },
  ],
  socialConnections: [
    { platform: "Instagram", handle: "https://instagram.com/grupohorizonte", url: "https://instagram.com/grupohorizonte", connected: true, icon: "instagram" as PlatformType },
    { platform: "YouTube", handle: "https://youtube.com/@grupohorizonte", url: "https://youtube.com/@grupohorizonte", connected: true, icon: "youtube" as PlatformType },
    { platform: "TikTok", handle: "https://tiktok.com/@grupohorizonte", url: "https://tiktok.com/@grupohorizonte", connected: true, icon: "tiktok" as PlatformType },
    { platform: "LinkedIn", handle: "https://linkedin.com/company/grupohorizonte", url: "https://linkedin.com/company/grupohorizonte", connected: true, icon: "linkedin" as PlatformType },
    { platform: "Facebook", handle: "https://facebook.com/grupohorizonte", url: "https://facebook.com/grupohorizonte", connected: false, icon: "facebook" as PlatformType },
  ],
};

const DEMO_COMPETITORS = [
  { id: "1", name: "Constructora Colpatria", market: "Bogota", type: "Developer", accounts: 4 },
  { id: "2", name: "Amarilo", market: "National", type: "Developer", accounts: 6 },
  { id: "3", name: "Constructora Bolivar", market: "Bogota", type: "Developer", accounts: 5 },
  { id: "4", name: "Cusezar", market: "Bogota", type: "Developer", accounts: 3 },
  { id: "5", name: "Marval", market: "Medellin", type: "Developer", accounts: 4 },
];

// Available platforms that can be added
const AVAILABLE_PLATFORMS: { id: PlatformType; name: string; urlPrefix: string; placeholder: string }[] = [
  { id: "instagram", name: "Instagram", urlPrefix: "https://instagram.com/", placeholder: "@username or full URL" },
  { id: "youtube", name: "YouTube", urlPrefix: "https://youtube.com/", placeholder: "@channel or full URL" },
  { id: "tiktok", name: "TikTok", urlPrefix: "https://tiktok.com/", placeholder: "@username or full URL" },
  { id: "linkedin", name: "LinkedIn", urlPrefix: "https://linkedin.com/", placeholder: "company/name or full URL" },
  { id: "facebook", name: "Facebook", urlPrefix: "https://facebook.com/", placeholder: "page name or full URL" },
  { id: "twitter", name: "X (Twitter)", urlPrefix: "https://x.com/", placeholder: "@username or full URL" },
];

export default function ProfilePage() {
  // Local state for form fields (initialized with demo data)
  const [companyName, setCompanyName] = useState(DEMO_PROFILE.companyName);
  const [legalName, setLegalName] = useState(DEMO_PROFILE.legalName);
  const [taxId, setTaxId] = useState(DEMO_PROFILE.taxId);
  const [hqLocation, setHqLocation] = useState(DEMO_PROFILE.hqLocation);
  const [websiteUrl, setWebsiteUrl] = useState(DEMO_PROFILE.websiteUrl);

  // Avatar and Banner
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Social connections
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>(
    DEMO_PROFILE.socialConnections
  );
  const [showAddPlatform, setShowAddPlatform] = useState(false);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Demo save handler
  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Demo: Profile saved successfully!");
  };

  // Demo avatar upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Demo banner upload handler
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Social connection handlers
  const updateSocialUrl = (index: number, url: string) => {
    setSocialConnections(socialConnections.map((conn, i) =>
      i === index ? { ...conn, url, handle: url } : conn
    ));
  };

  const toggleConnection = (index: number) => {
    setSocialConnections(socialConnections.map((conn, i) =>
      i === index ? { ...conn, connected: !conn.connected } : conn
    ));
  };

  const removeSocialConnection = (index: number) => {
    setSocialConnections(socialConnections.filter((_, i) => i !== index));
  };

  const addPlatform = (platformId: PlatformType) => {
    const platform = AVAILABLE_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    // Check if already added
    if (socialConnections.some(c => c.icon === platformId)) {
      setShowAddPlatform(false);
      return;
    }

    setSocialConnections([...socialConnections, {
      platform: platform.name,
      handle: "",
      url: "",
      connected: false,
      icon: platformId,
    }]);
    setShowAddPlatform(false);
  };

  const getPlatformIcon = (platform: PlatformType, className: string = "h-5 w-5") => {
    switch (platform) {
      case "instagram":
        return <Instagram className={`${className} text-pink-500`} />;
      case "youtube":
        return <Youtube className={`${className} text-red-500`} />;
      case "tiktok":
        return <TikTokIcon className={`${className}`} />;
      case "linkedin":
        return <Linkedin className={`${className} text-blue-600`} />;
      case "facebook":
        return <Facebook className={`${className} text-blue-500`} />;
      case "twitter":
        return <TwitterIcon className={`${className}`} />;
      default:
        return <Globe className={`${className} text-muted-foreground`} />;
    }
  };

  const getPlaceholder = (icon: PlatformType) => {
    const platform = AVAILABLE_PLATFORMS.find(p => p.id === icon);
    return platform?.placeholder || "Enter URL or handle";
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Profile</h1>
          <p className="text-muted-foreground">
            Manage your corporate identity and AI context sources
          </p>
        </div>
        <Button
          className="bg-[#28A963] hover:bg-[#229954]"
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Section A: Corporate Identity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Building2 className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Corporate Identity</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Company / Display Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Legal Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                placeholder="Enter legal name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tax ID / RUC</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                placeholder="Enter tax ID"
              />
            </div>
            <div>
              <label className="text-sm font-medium">HQ Location</label>
              <div className="mt-1.5 relative">
                <input
                  type="text"
                  value={hqLocation}
                  onChange={(e) => setHqLocation(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                  placeholder="Enter location"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
                  title="Set on Map (Google Maps API required)"
                >
                  <MapPin className="h-4 w-4 text-[#28A963]" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Website URL</label>
            <div className="mt-1.5 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Branding Images */}
          <div>
            <label className="text-sm font-medium mb-3 block">Branding Images</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Profile Avatar (Square) */}
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                <p className="text-sm font-medium mb-2">Profile Avatar</p>
                <p className="text-xs text-muted-foreground mb-3">Square format, used for thumbnails</p>
                <div className="flex items-center gap-4">
                  <label className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:border-[#28A963]/50 transition-colors overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">512x512px recommended</p>
                  </div>
                </div>
              </div>

              {/* Profile Banner (Rectangle) */}
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                <p className="text-sm font-medium mb-2">Profile Banner</p>
                <p className="text-xs text-muted-foreground mb-3">Wide format, used for headers</p>
                <label className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:border-[#28A963]/50 transition-colors overflow-hidden">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs text-muted-foreground mt-1">1200x300px</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </label>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Brand Intelligence */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <FileText className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Brand Intelligence</CardTitle>
              <CardDescription>Upload brand assets for AI context (Modules 5 & 13)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center hover:border-[#28A963]/50 hover:bg-muted/50 transition-colors cursor-pointer">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="font-medium">Upload Brand Assets</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & Drop or click to upload Brandbooks, Tone Guides, and Style Documents
            </p>
            <p className="text-xs text-muted-foreground mt-2">Supported: PDF, DOCX - Max 10MB per file</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Documents</p>
            {DEMO_PROFILE.brandDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "verified" && (
                    <span className="flex items-center gap-1 text-xs text-[#28A963]">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {doc.status === "pending" && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      Processing
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Note:</strong> These documents will be used by the AI to audit your content for brand voice consistency and generate on-brand messaging suggestions.
          </p>
        </CardContent>
      </Card>

      {/* Section C: Social Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <LinkIcon className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Global Social Connections</CardTitle>
              <CardDescription>Connect your master corporate social accounts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialConnections.map((connection, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-md border bg-background px-4 py-3"
            >
              <div className="flex-shrink-0">
                {getPlatformIcon(connection.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{connection.platform}</p>
                <input
                  type="text"
                  value={connection.url}
                  onChange={(e) => updateSocialUrl(index, e.target.value)}
                  placeholder={getPlaceholder(connection.icon)}
                  className="w-full mt-1 text-sm bg-muted/50 border border-input rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {connection.url && (
                  <a
                    href={connection.url.startsWith("http") ? connection.url : `https://${connection.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                {connection.connected ? (
                  <button
                    onClick={() => toggleConnection(index)}
                    className="flex items-center gap-1.5 rounded-full bg-[#28A963]/10 px-3 py-1 text-xs font-medium text-[#28A963] hover:bg-[#28A963]/20 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Connected
                  </button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleConnection(index)}
                  >
                    Connect
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSocialConnection(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Platform Button */}
          <div className="relative">
            <button
              onClick={() => setShowAddPlatform(!showAddPlatform)}
              className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 bg-transparent px-4 py-3 text-sm text-muted-foreground hover:border-[#28A963]/50 hover:text-[#28A963] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Platform
            </button>

            {/* Platform selector dropdown */}
            {showAddPlatform && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-50 p-2">
                <p className="text-xs text-muted-foreground px-2 py-1 mb-1">Select a platform to add:</p>
                {AVAILABLE_PLATFORMS.filter(p => !socialConnections.some(c => c.icon === p.id)).map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => addPlatform(platform.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                  >
                    {getPlatformIcon(platform.id)}
                    <span>{platform.name}</span>
                  </button>
                ))}
                {AVAILABLE_PLATFORMS.filter(p => !socialConnections.some(c => c.icon === p.id)).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">All platforms already added</p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Enter the full URL or handle for each platform. These are your organization's official social media accounts.
          </p>
        </CardContent>
      </Card>

      {/* Section D: Global Competitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
                <Building2 className="h-5 w-5 text-[#28A963]" />
              </div>
              <div>
                <CardTitle>Global Competitors</CardTitle>
                <CardDescription>Competitors from your database for market share analysis</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/competitors">
                Manage Competitors
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {DEMO_COMPETITORS.map((competitor, index) => (
              <div
                key={competitor.id}
                className="flex items-center justify-between rounded-md border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{competitor.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {competitor.market} - {competitor.type}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Instagram className="h-4 w-4 text-pink-500 opacity-80" />
                    <Youtube className="h-4 w-4 text-red-500 opacity-80" />
                    <TikTokIcon className="h-4 w-4 opacity-80" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {competitor.accounts} accounts
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            These competitors are managed in the Competitors page and used in the Resonance Audit and Commercial Intent modules for comparative analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}