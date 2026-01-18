"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ImageIcon,
  Edit2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "twitter";

// Default emoji icons for platforms (fallback)
const platformEmojis: Record<PlatformId, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👤",
  linkedin: "💼",
  twitter: "🐦",
};

// Context labels
const CONTEXT_LABELS = {
  avatar: "Platform Avatar",
  navigation: "Navigation/Sidebar",
  filters: "Filter Dropdowns",
  posts: "Posts Page",
  competitors: "Competitors Page",
  dashboard: "Dashboard",
};

// ============ LOGO ITEM COMPONENT ============
function LogoItem({
  logo,
  onDelete,
  onRename,
  onReplace,
}: {
  logo: { _id: Id<"platformLogos">; name: string; url: string | null; mimeType: string };
  onDelete: () => void;
  onRename: (newName: string) => void;
  onReplace: (file: File) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(logo.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    if (editName.trim() && editName !== logo.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplace(file);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow">
      {/* Logo preview */}
      <div className="w-16 h-16 rounded bg-gray-50 border flex items-center justify-center overflow-hidden flex-shrink-0">
        {logo.url ? (
          <img
            src={logo.url}
            alt={logo.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-gray-300" />
        )}
      </div>

      {/* Name and actions */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 rounded border px-2 py-1 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setEditName(logo.name);
                  setIsEditing(false);
                }
              }}
            />
            <Button size="sm" variant="ghost" onClick={handleSaveName}>
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setEditName(logo.name);
              setIsEditing(false);
            }}>
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{logo.name}</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3 w-3 text-gray-400" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground truncate">{logo.mimeType}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          title="Replace file"
        >
          <Upload className="h-4 w-4 text-gray-500" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm(`Delete "${logo.name}"? This will remove it from all places where it's used.`)) {
              setIsDeleting(true);
              onDelete();
            }
          }}
          disabled={isDeleting}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

// ============ UPLOAD NEW LOGO COMPONENT ============
function UploadNewLogo({
  platformId,
  existingNames,
  onUpload,
}: {
  platformId: PlatformId;
  existingNames: string[];
  onUpload: (file: File, name: string) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedNames = ["Horizontal", "Vertical", "Icon", "White", "Square", "Dark"];
  const availableSuggestions = suggestedNames.filter(n => !existingNames.includes(n));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      // Auto-suggest a name based on file name if no name set
      if (!name) {
        const baseName = selectedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        setName(formatted);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      setError("Please provide both a file and a name");
      return;
    }

    if (existingNames.includes(name.trim())) {
      setError(`A logo named "${name.trim()}" already exists`);
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      await onUpload(file, name.trim());
      setFile(null);
      setName("");
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Logo
      </Button>
    );
  }

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-900">Upload New Logo</h4>
        <Button size="sm" variant="ghost" onClick={() => {
          setIsOpen(false);
          setFile(null);
          setName("");
          setError("");
        }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                {file.type.startsWith("image/") && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to select a file</p>
              <p className="text-xs text-gray-400">SVG, PNG, JPG, or WebP</p>
            </>
          )}
        </div>
      </div>

      {/* Name input */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Logo Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="e.g., Horizontal, Icon, White..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        {availableSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {availableSuggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setName(suggestion)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !name.trim() || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
          </>
        )}
      </Button>
    </div>
  );
}

// ============ LOGO SELECTOR DROPDOWN ============
function LogoSelector({
  label,
  description,
  value,
  options,
  onChange,
  platformId,
}: {
  label: string;
  description: string;
  value: Id<"platformLogos"> | null;
  options: { _id: Id<"platformLogos">; name: string; url: string | null }[];
  onChange: (logoId: Id<"platformLogos"> | null) => void;
  platformId: PlatformId;
}) {
  const selectedLogo = options.find(o => o._id === value);

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Preview */}
        <div className="w-8 h-8 rounded bg-gray-100 border flex items-center justify-center overflow-hidden">
          {selectedLogo?.url ? (
            <img src={selectedLogo.url} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-lg">{platformEmojis[platformId]}</span>
          )}
        </div>
        {/* Dropdown */}
        <Select
          value={value || "none"}
          onValueChange={(v) => onChange(v === "none" ? null : v as Id<"platformLogos">)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select logo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="flex items-center gap-2">
                <span className="text-lg">{platformEmojis[platformId]}</span>
                Default (emoji)
              </span>
            </SelectItem>
            {options.map((logo) => (
              <SelectItem key={logo._id} value={logo._id}>
                <span className="flex items-center gap-2">
                  {logo.url && (
                    <img src={logo.url} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {logo.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ============ PLATFORM CARD COMPONENT ============
function PlatformCard({
  platform,
}: {
  platform: {
    _id: Id<"platforms">;
    platformId: PlatformId;
    displayName: string;
    primaryColor?: string;
    secondaryColor?: string;
    isActive: boolean;
    displayOrder: number;
    logos?: { _id: Id<"platformLogos">; name: string; url: string | null; mimeType: string }[];
    selectedLogos?: {
      avatar?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
      navigation?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
      filters?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
      posts?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
      competitors?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
      dashboard?: { _id: Id<"platformLogos">; name: string; url: string | null } | null;
    };
  };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(platform.primaryColor || "#666666");
  const [secondaryColor, setSecondaryColor] = useState(platform.secondaryColor || "#999999");

  const updatePlatform = useMutation(api.platforms.update);
  const setLogoForContext = useMutation(api.platforms.setLogoForContext);
  const generateUploadUrl = useMutation(api.platforms.generateLogoUploadUrl);
  const createLogo = useMutation(api.platforms.createLogo);
  const deleteLogo = useMutation(api.platforms.deleteLogo);
  const updateLogoName = useMutation(api.platforms.updateLogoName);
  const replaceLogoFile = useMutation(api.platforms.replaceLogoFile);

  const handleToggleActive = async () => {
    await updatePlatform({
      id: platform._id,
      isActive: !platform.isActive,
    });
  };

  const handleUploadLogo = async (file: File, name: string) => {
    // Get upload URL
    const uploadUrl = await generateUploadUrl({});

    // Upload file
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const { storageId } = await response.json();

    // Create logo record
    await createLogo({
      platformId: platform.platformId,
      name,
      storageId,
      mimeType: file.type,
      fileSize: file.size,
    });
  };

  const handleReplaceLogo = async (logoId: Id<"platformLogos">, file: File) => {
    const uploadUrl = await generateUploadUrl({});

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const { storageId } = await response.json();

    await replaceLogoFile({
      id: logoId,
      storageId,
      mimeType: file.type,
      fileSize: file.size,
    });
  };

  const handleSetLogoForContext = async (context: keyof typeof CONTEXT_LABELS, logoId: Id<"platformLogos"> | null) => {
    await setLogoForContext({
      platformId: platform._id,
      context,
      logoId,
    });
  };

  const handleColorUpdate = async (type: 'primary' | 'secondary', color: string) => {
    if (type === 'primary') {
      setPrimaryColor(color);
      await updatePlatform({
        id: platform._id,
        primaryColor: color,
      });
    } else {
      setSecondaryColor(color);
      await updatePlatform({
        id: platform._id,
        secondaryColor: color,
      });
    }
  };

  // Use selected avatar logo, fall back to first logo if no avatar selected
  const avatarLogo = platform.selectedLogos?.avatar || platform.logos?.[0];

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"} ${!platform.isActive ? "opacity-60" : ""}`}>
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Platform icon */}
          <div
            className="h-14 w-14 rounded-lg flex items-center justify-center text-white text-2xl"
            style={{ backgroundColor: primaryColor }}
          >
            {avatarLogo?.url ? (
              <img src={avatarLogo.url} alt="" className="h-8 w-8 object-contain" />
            ) : (
              platformEmojis[platform.platformId]
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{platform.displayName}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${platform.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {platform.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{platform.logos?.length || 0} logo{(platform.logos?.length || 0) !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span className="capitalize">{platform.platformId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color indicators */}
          <div className="flex gap-1 mr-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: primaryColor }}
              title={`Primary: ${primaryColor}`}
            />
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: secondaryColor }}
              title={`Secondary: ${secondaryColor}`}
            />
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t bg-slate-50 p-6 space-y-6">
          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div>
              <span className="font-medium">Platform Status</span>
              <p className="text-xs text-muted-foreground">
                {platform.isActive ? "Platform is active and visible in the app" : "Platform is hidden from the app"}
              </p>
            </div>
            <Button
              variant={platform.isActive ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActive();
              }}
            >
              {platform.isActive ? (
                <><Eye className="h-4 w-4 mr-1" /> Active</>
              ) : (
                <><EyeOff className="h-4 w-4 mr-1" /> Inactive</>
              )}
            </Button>
          </div>

          {/* Brand Colors Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              🎨 Brand Colors
            </h3>
            <div className="bg-white rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handleColorUpdate('primary', e.target.value)}
                      className="flex-1 rounded-md border px-3 py-2 text-sm font-mono uppercase"
                      placeholder="#E1306C"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Used for avatar background and primary accents</p>
                </div>
                {/* Secondary Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleColorUpdate('secondary', e.target.value)}
                      className="flex-1 rounded-md border px-3 py-2 text-sm font-mono uppercase"
                      placeholder="#833AB4"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Used for gradients and secondary accents</p>
                </div>
              </div>
              {/* Color Preview */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {avatarLogo?.url ? (
                      <img src={avatarLogo.url} alt="" className="h-7 w-7 object-contain" />
                    ) : (
                      platformEmojis[platform.platformId]
                    )}
                  </div>
                  <div
                    className="h-12 flex-1 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Logos Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Uploaded Logos ({platform.logos?.length || 0})
            </h3>

            <div className="space-y-2">
              {(platform.logos || []).map((logo) => (
                <LogoItem
                  key={logo._id}
                  logo={logo}
                  onDelete={() => deleteLogo({ id: logo._id })}
                  onRename={(newName) => updateLogoName({ id: logo._id, name: newName })}
                  onReplace={(file) => handleReplaceLogo(logo._id, file)}
                />
              ))}

              <UploadNewLogo
                platformId={platform.platformId}
                existingNames={(platform.logos || []).map(l => l.name)}
                onUpload={handleUploadLogo}
              />
            </div>
          </div>

          {/* Logo Selection for Each Context */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Where to Show Each Logo
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Select which logo to display in each section of the application. If no logo is selected, the default emoji will be used.
            </p>

            <div className="bg-white rounded-lg border p-4">
              <LogoSelector
                label="Platform Avatar"
                description="Main logo shown in the collapsed card header"
                value={platform.selectedLogos?.avatar?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("avatar", id)}
                platformId={platform.platformId}
              />
              <LogoSelector
                label="Navigation / Sidebar"
                description="Logo shown in the sidebar navigation"
                value={platform.selectedLogos?.navigation?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("navigation", id)}
                platformId={platform.platformId}
              />
              <LogoSelector
                label="Filter Dropdowns"
                description="Logo shown in filter dropdown options"
                value={platform.selectedLogos?.filters?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("filters", id)}
                platformId={platform.platformId}
              />
              <LogoSelector
                label="Posts Page"
                description="Logo shown on post cards and badges"
                value={platform.selectedLogos?.posts?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("posts", id)}
                platformId={platform.platformId}
              />
              <LogoSelector
                label="Competitors Page"
                description="Logo shown on competitor profiles"
                value={platform.selectedLogos?.competitors?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("competitors", id)}
                platformId={platform.platformId}
              />
              <LogoSelector
                label="Dashboard"
                description="Logo shown on dashboard cards and stats"
                value={platform.selectedLogos?.dashboard?._id || null}
                options={platform.logos || []}
                onChange={(id) => handleSetLogoForContext("dashboard", id)}
                platformId={platform.platformId}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============ MAIN PAGE COMPONENT ============
export default function PlatformsPage() {
  const platforms = useQuery(api.platforms.list);
  const initializeDefaults = useMutation(api.platforms.initializeDefaults);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeDefaults({});
    } catch (error) {
      console.error("Failed to initialize platforms:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Management</h1>
          <p className="text-muted-foreground">
            Upload and manage platform logos across the application
          </p>
        </div>
        {(!platforms || platforms.length === 0) && (
          <Button onClick={handleInitialize} disabled={isInitializing}>
            {isInitializing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Platforms"
            )}
          </Button>
        )}
      </div>

      {/* Platform Cards */}
      {platforms && platforms.length > 0 ? (
        <div className="space-y-4">
          {platforms.map((platform) => (
            <PlatformCard key={platform._id} platform={platform as any} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No platforms configured</h3>
            <p className="text-muted-foreground mb-4">
              Click "Initialize Platforms" to set up the default social media platforms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
