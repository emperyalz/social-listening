"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  Pencil,
  Youtube,
  Loader2,
} from "lucide-react";

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface SocialConnection {
  platform: string;
  handle: string;
  connected: boolean;
  icon: "instagram" | "youtube" | "tiktok" | "linkedin" | "facebook" | "twitter";
}

interface Competitor {
  name: string;
  platforms: ("instagram" | "youtube" | "tiktok")[];
}

export default function ProfilePage() {
  // Convex queries and mutations
  const profile = useQuery(api.organizationProfile.getOrganizationProfile);
  const saveProfile = useMutation(api.organizationProfile.saveOrganizationProfile);
  const generateUploadUrl = useMutation(api.organizationProfile.generateUploadUrl);
  const saveAvatarMutation = useMutation(api.organizationProfile.saveAvatar);
  const saveBannerMutation = useMutation(api.organizationProfile.saveBanner);
  const addBrandDocumentMutation = useMutation(api.organizationProfile.addBrandDocument);
  const removeBrandDocumentMutation = useMutation(api.organizationProfile.removeBrandDocument);

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

  // Social connections
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
    { platform: "Instagram", handle: "", connected: false, icon: "instagram" },
    { platform: "YouTube", handle: "", connected: false, icon: "youtube" },
    { platform: "TikTok", handle: "", connected: false, icon: "tiktok" },
  ]);

  // Competitors
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [editingCompetitor, setEditingCompetitor] = useState<number | null>(null);

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

      // Load social connections
      if (profile.socialConnections && profile.socialConnections.length > 0) {
        setSocialConnections(profile.socialConnections);
      }

      // Load competitors
      if (profile.globalCompetitors && profile.globalCompetitors.length > 0) {
        setCompetitors(profile.globalCompetitors);
      }
    }
  }, [profile]);

  // Save all profile data
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await saveProfile({
        companyName,
        legalName: legalName || undefined,
        taxId: taxId || undefined,
        hqLocation: hqLocation || undefined,
        websiteUrl: websiteUrl || undefined,
        socialConnections: socialConnections.length > 0 ? socialConnections : undefined,
        globalCompetitors: competitors.length > 0 ? competitors : undefined,
      });
      // Show success feedback (could add toast notification here)
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
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Save the storage ID to the profile
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
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Save the storage ID to the profile
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
      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Add the document to the profile
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

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && competitors.length < 5) {
      setCompetitors([...competitors, { name: newCompetitor.trim(), platforms: ["instagram"] }]);
      setNewCompetitor("");
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const toggleConnection = (index: number) => {
    setSocialConnections(socialConnections.map((conn, i) =>
      i === index ? { ...conn, connected: !conn.connected } : conn
    ));
  };

  const updateSocialHandle = (index: number, handle: string) => {
    setSocialConnections(socialConnections.map((conn, i) =>
      i === index ? { ...conn, handle } : conn
    ));
  };

  const toggleCompetitorPlatform = (compIndex: number, platform: "instagram" | "youtube" | "tiktok") => {
    setCompetitors(competitors.map((comp, i) => {
      if (i === compIndex) {
        const hasPlat = comp.platforms.includes(platform);
        return {
          ...comp,
          platforms: hasPlat
            ? comp.platforms.filter(p => p !== platform)
            : [...comp.platforms, platform]
        };
      }
      return comp;
    }));
  };

  const getPlatformIcon = (platform: string, className: string = "h-4 w-4") => {
    switch (platform) {
      case "instagram":
        return <Instagram className={`${className} text-pink-500`} />;
      case "youtube":
        return <Youtube className={`${className} text-red-500`} />;
      case "tiktok":
        return <TikTokIcon className={`${className} text-foreground`} />;
      default:
        return null;
    }
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

          {/* Branding Images - Split into Avatar and Banner */}
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      512x512px recommended
                    </p>
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

      {/* Section B: Brand Intelligence (AI Knowledge Base) */}
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
          {/* Upload Zone - Now Clickable */}
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
            <p className="text-xs text-muted-foreground mt-2">
              Supported: PDF, DOCX • Max 10MB per file
            </p>
          </div>
          <input
            ref={brandDocsInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            className="hidden"
            onChange={handleBrandDocsUpload}
          />

          {/* Uploaded Files - From Database */}
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
              <p className="text-sm text-muted-foreground py-4 text-center">
                No documents uploaded yet
              </p>
            )}
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
              className="flex items-center justify-between rounded-md border bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3 flex-1">
                {connection.icon === "instagram" && (
                  <Instagram className="h-5 w-5 text-pink-500" />
                )}
                {connection.icon === "youtube" && (
                  <Youtube className="h-5 w-5 text-red-500" />
                )}
                {connection.icon === "tiktok" && (
                  <TikTokIcon className="h-5 w-5" />
                )}
                {connection.icon === "linkedin" && (
                  <Linkedin className="h-5 w-5 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{connection.platform}</p>
                  <input
                    type="text"
                    value={connection.handle}
                    onChange={(e) => updateSocialHandle(index, e.target.value)}
                    placeholder={`@your${connection.platform.toLowerCase()}handle`}
                    className="text-xs text-muted-foreground bg-transparent border-none outline-none w-full"
                  />
                </div>
              </div>
              {connection.connected ? (
                <button
                  onClick={() => toggleConnection(index)}
                  className="flex items-center gap-1.5 rounded-full bg-[#28A963]/10 px-3 py-1 text-xs font-medium text-[#28A963] hover:bg-[#28A963]/20 transition-colors cursor-pointer"
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
            </div>
          ))}

          {/* Add Platform Button */}
          <button
            className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 bg-transparent px-4 py-3 text-sm text-muted-foreground hover:border-[#28A963]/50 hover:text-[#28A963] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Platform
          </button>
        </CardContent>
      </Card>

      {/* Section D: Global Competitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Building2 className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Global Competitors</CardTitle>
              <CardDescription>Top 3-5 rival developers for market share analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {competitors.length > 0 ? (
              competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{competitor.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Platform icons being monitored */}
                    <div className="flex items-center gap-1.5">
                      {competitor.platforms.map((platform) => (
                        <span key={platform} className="opacity-80">
                          {getPlatformIcon(platform, "h-4 w-4")}
                        </span>
                      ))}
                    </div>
                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCompetitor(editingCompetitor === index ? null : index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#28A963]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCompetitor(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No competitors added yet
              </p>
            )}

            {/* Expanded Edit Panel */}
            {editingCompetitor !== null && competitors[editingCompetitor] && (
              <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium">Edit: {competitors[editingCompetitor]?.name}</p>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Platforms to Monitor:</p>
                  <div className="flex gap-2">
                    {(["instagram", "youtube", "tiktok"] as const).map((platform) => {
                      const isActive = competitors[editingCompetitor]?.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => toggleCompetitorPlatform(editingCompetitor, platform)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                            isActive
                              ? "bg-[#28A963]/10 border-[#28A963]/30 text-[#28A963]"
                              : "bg-background border-input text-muted-foreground hover:border-[#28A963]/30"
                          }`}
                        >
                          {getPlatformIcon(platform, "h-4 w-4")}
                          <span className="capitalize">{platform}</span>
                          {isActive && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCompetitor(null)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>

          {competitors.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="Add competitor name..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
              />
              <Button onClick={handleAddCompetitor} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            These competitors will be used in the Resonance Audit and Commercial Intent modules for comparative analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
