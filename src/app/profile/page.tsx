"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
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
  Loader2,
  Facebook,
  ExternalLink,
  ChevronDown,
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
  // Convex queries and mutations
  const profile = useQuery(api.organizationProfile.getOrganizationProfile);
  const saveProfile = useMutation(api.organizationProfile.saveOrganizationProfile);
  const generateUploadUrl = useMutation(api.organizationProfile.generateUploadUrl);
  const saveAvatarMutation = useMutation(api.organizationProfile.saveAvatar);
  const saveBannerMutation = useMutation(api.organizationProfile.saveBanner);
  const addBrandDocumentMutation = useMutation(api.organizationProfile.addBrandDocument);
  const removeBrandDocumentMutation = useMutation(api.organizationProfile.removeBrandDocument);
  
  // Competitor selection mutations
  const addGlobalCompetitor = useMutation(api.organizationProfile.addGlobalCompetitor);
  const removeGlobalCompetitor = useMutation(api.organizationProfile.removeGlobalCompetitor);

  // Get all competitors from the database (for selection dropdown)
  const allCompetitors = useQuery(api.competitors.list, { isActive: true });

  // Local state for form fields
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [hqLocation, setHqLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Avatar and Banner
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const brandDocsInputRef = useRef<HTMLInputElement>(null);

  // Social connections - now with editable URLs
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  
  // Competitor selection state
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [isRemovingCompetitor, setIsRemovingCompetitor] = useState<string | null>(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Load data from Convex when profile is fetched
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName || "");
      setLegalName(profile.legalName || "");
      setTaxId(profile.taxId || "");
      setHqLocation(profile.hqLocation || "");
      setWebsiteUrl(profile.websiteUrl || "");

      // Set avatar and banner previews from storage URLs
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
      if (profile.bannerUrl) {
        setBannerPreview(profile.bannerUrl);
      }

      // Load social connections with URLs
      if (profile.socialConnections && profile.socialConnections.length > 0) {
        setSocialConnections(profile.socialConnections.map(conn => ({
          ...conn,
          url: conn.handle || "", // Use handle as URL
        })));
      } else {
        // Default platforms
        setSocialConnections([
          { platform: "Instagram", handle: "", url: "", connected: false, icon: "instagram" },
          { platform: "YouTube", handle: "", url: "", connected: false, icon: "youtube" },
          { platform: "TikTok", handle: "", url: "", connected: false, icon: "tiktok" },
        ]);
      }
    }
  }, [profile]);

  // Save all profile data
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Convert social connections to the format expected by Convex
      const connectionsToSave = socialConnections.map(conn => ({
        platform: conn.platform,
        handle: conn.url, // Store the URL in handle field
        connected: conn.connected,
        icon: conn.icon,
      }));

      await saveProfile({
        companyName,
        legalName: legalName || undefined,
        taxId: taxId || undefined,
        hqLocation: hqLocation || undefined,
        websiteUrl: websiteUrl || undefined,
        socialConnections: connectionsToSave.length > 0 ? connectionsToSave : undefined,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload to Convex storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await saveAvatarMutation({ storageId });
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle banner upload to Convex storage
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await saveBannerMutation({ storageId });
    } catch (error) {
      console.error("Error uploading banner:", error);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle brand document upload
  const handleBrandDocsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await addBrandDocumentMutation({
        name: file.name,
        storageId
      });
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle document removal
  const handleRemoveDocument = async (storageId: string) => {
    try {
      await removeBrandDocumentMutation({ storageId: storageId as any });
    } catch (error) {
      console.error("Error removing document:", error);
    }
  };

  const handleDragDropClick = () => {
    brandDocsInputRef.current?.click();
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

  // Competitor selection handlers
  const handleAddCompetitor = async (competitorId: Id<"competitors">) => {
    setIsAddingCompetitor(true);
    try {
      await addGlobalCompetitor({ competitorId });
      setShowAddCompetitor(false);
    } catch (error) {
      console.error("Error adding competitor:", error);
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  const handleRemoveCompetitor = async (competitorId: Id<"competitors">) => {
    setIsRemovingCompetitor(competitorId);
    try {
      await removeGlobalCompetitor({ competitorId });
    } catch (error) {
      console.error("Error removing competitor:", error);
    } finally {
      setIsRemovingCompetitor(null);
    }
  };

  // Get competitors that are not yet selected
  const availableCompetitors = allCompetitors?.filter(
    c => !profile?.selectedCompetitors?.some(sc => sc._id === c._id)
  ) || [];

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

  // Show loading state while fetching profile
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#28A963]" />
      </div>
    );
  }

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
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
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
                  <div
                    onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:border-[#28A963]/50 transition-colors overflow-hidden"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[#28A963]" />
                    ) : avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">512x512px recommended</p>
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Profile Banner (Rectangle) */}
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                <p className="text-sm font-medium mb-2">Profile Banner</p>
                <p className="text-xs text-muted-foreground mb-3">Wide format, used for headers</p>
                <div
                  onClick={() => !isUploadingBanner && bannerInputRef.current?.click()}
                  className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:border-[#28A963]/50 transition-colors overflow-hidden"
                >
                  {isUploadingBanner ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#28A963]" />
                  ) : bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                      <p className="text-xs text-muted-foreground mt-1">1200x300px</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUploadingBanner}
                >
                  {isUploadingBanner ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Banner
                </Button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
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
          <div
            onClick={handleDragDropClick}
            className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center hover:border-[#28A963]/50 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {isUploadingDoc ? (
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#28A963] mb-3" />
            ) : (
              <Upload className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            )}
            <p className="font-medium">{isUploadingDoc ? "Uploading..." : "Upload Brand Assets"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & Drop or click to upload Brandbooks, Tone Guides, and Style Documents
            </p>
            <p className="text-xs text-muted-foreground mt-2">Supported: PDF, DOCX • Max 10MB per file</p>
          </div>
          <input
            ref={brandDocsInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={handleBrandDocsUpload}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Documents</p>
            {profile?.brandDocuments && profile.brandDocuments.length > 0 ? (
              profile.brandDocuments.map((doc, index) => (
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
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing
                      </span>
                    )}
                    {doc.status === "error" && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <X className="h-3 w-3" />
                        Error
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveDocument(doc.storageId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded yet</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Note:</strong> These documents will be used by the AI to audit your content for brand voice consistency and generate on-brand messaging suggestions.
          </p>
        </CardContent>
      </Card>

      {/* Section C: Social Connections - NOW WITH EDITABLE URLS */}
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

      {/* Section D: Global Competitors - HANDPICKED FROM DATABASE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
                <Building2 className="h-5 w-5 text-[#28A963]" />
              </div>
              <div>
                <CardTitle>Global Competitors</CardTitle>
                <CardDescription>Select up to 5 key competitors for market share analysis</CardDescription>
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
          {/* Selected Competitors */}
          {profile?.selectedCompetitors && profile.selectedCompetitors.length > 0 ? (
            <div className="space-y-2">
              {profile.selectedCompetitors.map((competitor, index) => (
                <div
                  key={competitor._id}
                  className="flex items-center justify-between rounded-md border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#28A963]/10 text-xs font-medium text-[#28A963]">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      {competitor.displayAvatarUrl ? (
                        <img
                          src={competitor.displayAvatarUrl}
                          alt={competitor.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium">{competitor.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {competitor.market?.name || "Unknown market"} • {competitor.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Platform icons from social handles */}
                    <div className="flex items-center gap-1.5">
                      {competitor.socialHandles?.instagram && (
                        <Instagram className="h-4 w-4 text-pink-500 opacity-80" />
                      )}
                      {competitor.socialHandles?.youtube && (
                        <Youtube className="h-4 w-4 text-red-500 opacity-80" />
                      )}
                      {competitor.socialHandles?.tiktok && (
                        <TikTokIcon className="h-4 w-4 opacity-80" />
                      )}
                    </div>
                    {/* Account count */}
                    <span className="text-xs text-muted-foreground ml-2">
                      {competitor.accounts?.length || 0} accounts
                    </span>
                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive ml-2"
                      onClick={() => handleRemoveCompetitor(competitor._id)}
                      disabled={isRemovingCompetitor === competitor._id}
                    >
                      {isRemovingCompetitor === competitor._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border rounded-md bg-muted/30">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No global competitors selected</p>
              <p className="text-xs text-muted-foreground mt-1">Add competitors from the dropdown below</p>
            </div>
          )}

          {/* Add Competitor Button/Dropdown */}
          {(profile?.selectedCompetitors?.length || 0) < 5 && (
            <div className="relative">
              <button
                onClick={() => setShowAddCompetitor(!showAddCompetitor)}
                disabled={isAddingCompetitor || availableCompetitors.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 bg-transparent px-4 py-3 text-sm text-muted-foreground hover:border-[#28A963]/50 hover:text-[#28A963] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCompetitor ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Competitor
                <ChevronDown className={`h-4 w-4 transition-transform ${showAddCompetitor ? 'rotate-180' : ''}`} />
              </button>

              {/* Competitor selector dropdown */}
              {showAddCompetitor && availableCompetitors.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-2 py-1 mb-1">
                      Select a competitor to add ({5 - (profile?.selectedCompetitors?.length || 0)} slots remaining):
                    </p>
                    {availableCompetitors.map((competitor) => (
                      <button
                        key={competitor._id}
                        onClick={() => handleAddCompetitor(competitor._id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
                      >
                        {competitor.displayAvatarUrl ? (
                          <img
                            src={competitor.displayAvatarUrl}
                            alt={competitor.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="text-left">
                          <span className="font-medium">{competitor.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {competitor.market?.name || "Unknown"} • {competitor.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showAddCompetitor && availableCompetitors.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">All competitors have been selected</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <a href="/competitors">Add more competitors</a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {(profile?.selectedCompetitors?.length || 0) >= 5 && (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
              Maximum of 5 global competitors reached. Remove one to add another.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            These competitors are used in the Resonance Audit and Commercial Intent modules for comparative analysis. Select your most direct competitors for better insights.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
