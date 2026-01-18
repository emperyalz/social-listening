"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  X,
  RefreshCw,
  ImageIcon,
} from "lucide-react";

type PlatformId = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "twitter";

interface Platform {
  _id: string;
  platformId: PlatformId;
  displayName: string;
  logoHorizontal?: string;
  logoVertical?: string;
  logoIcon?: string;
  logoWhite?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  displayOrder: number;
  showInNavigation: boolean;
  showInFilters: boolean;
  showInPosts: boolean;
  showInCompetitors: boolean;
}

// Default emoji icons for platforms (fallback)
const platformEmojis: Record<PlatformId, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👤",
  linkedin: "💼",
  twitter: "🐦",
};

function LogoUploadCard({
  label,
  currentUrl,
  onUrlChange,
  platformColor,
  isWhiteVariant = false,
}: {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string) => void;
  platformColor?: string;
  isWhiteVariant?: boolean;
}) {
  const [inputUrl, setInputUrl] = useState(currentUrl || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUrlChange(inputUrl);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Upload className="h-3 w-3 mr-1" />
            {currentUrl ? "Change" : "Add"}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter SVG URL..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setInputUrl(currentUrl || "");
              setIsEditing(false);
            }}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`h-16 rounded flex items-center justify-center ${
            isWhiteVariant ? "bg-gray-800" : "bg-gray-100"
          }`}
          style={platformColor && !isWhiteVariant ? { backgroundColor: `${platformColor}10` } : undefined}
        >
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={label}
              className="max-h-12 max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="text-gray-400 text-xs flex flex-col items-center">
              <ImageIcon className="h-6 w-6 mb-1" />
              No logo
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform, onUpdate }: { platform: Platform; onUpdate: () => void }) {
  const updateLogos = useMutation(api.platforms.updateLogos);
  const updateDisplaySettings = useMutation(api.platforms.updateDisplaySettings);
  const [isSaving, setIsSaving] = useState(false);
  const [localLogos, setLocalLogos] = useState({
    logoHorizontal: platform.logoHorizontal || "",
    logoVertical: platform.logoVertical || "",
    logoIcon: platform.logoIcon || "",
    logoWhite: platform.logoWhite || "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleLogoChange = (key: keyof typeof localLogos, value: string) => {
    setLocalLogos((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveLogos = async () => {
    setIsSaving(true);
    try {
      await updateLogos({
        platformId: platform.platformId,
        logoHorizontal: localLogos.logoHorizontal || undefined,
        logoVertical: localLogos.logoVertical || undefined,
        logoIcon: localLogos.logoIcon || undefined,
        logoWhite: localLogos.logoWhite || undefined,
      });
      setHasUnsavedChanges(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to save logos:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    await updateDisplaySettings({
      platformId: platform.platformId,
      isActive: !platform.isActive,
    });
    onUpdate();
  };

  const handleToggleContext = async (context: string, value: boolean) => {
    const updates: Record<string, boolean> = {};
    updates[context] = value;
    await updateDisplaySettings({
      platformId: platform.platformId,
      ...updates,
    });
    onUpdate();
  };

  return (
    <Card className={!platform.isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: platform.primaryColor || "#666" }}
            >
              {platform.logoIcon ? (
                <img src={platform.logoIcon} alt="" className="h-6 w-6 object-contain" />
              ) : (
                platformEmojis[platform.platformId]
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{platform.displayName}</CardTitle>
              <CardDescription>{platform.platformId}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={platform.isActive ? "default" : "outline"}
              size="sm"
              onClick={handleToggleActive}
            >
              {platform.isActive ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Inactive
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo uploads */}
        <div className="grid grid-cols-2 gap-3">
          <LogoUploadCard
            label="Horizontal Logo"
            currentUrl={localLogos.logoHorizontal}
            onUrlChange={(url) => handleLogoChange("logoHorizontal", url)}
            platformColor={platform.primaryColor}
          />
          <LogoUploadCard
            label="Vertical Logo"
            currentUrl={localLogos.logoVertical}
            onUrlChange={(url) => handleLogoChange("logoVertical", url)}
            platformColor={platform.primaryColor}
          />
          <LogoUploadCard
            label="Icon Only"
            currentUrl={localLogos.logoIcon}
            onUrlChange={(url) => handleLogoChange("logoIcon", url)}
            platformColor={platform.primaryColor}
          />
          <LogoUploadCard
            label="White Version"
            currentUrl={localLogos.logoWhite}
            onUrlChange={(url) => handleLogoChange("logoWhite", url)}
            platformColor={platform.primaryColor}
            isWhiteVariant
          />
        </div>

        {/* Save button for logos */}
        {hasUnsavedChanges && (
          <Button onClick={handleSaveLogos} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Logo Changes
              </>
            )}
          </Button>
        )}

        {/* Display context toggles */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">Show logo in:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "showInNavigation", label: "Navigation" },
              { key: "showInFilters", label: "Filters" },
              { key: "showInPosts", label: "Posts" },
              { key: "showInCompetitors", label: "Competitors" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={platform[key as keyof Platform] as boolean}
                  onChange={(e) => handleToggleContext(key, e.target.checked)}
                  className="rounded border-gray-300"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Color preview */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Brand Colors</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: platform.primaryColor || "#ccc" }}
              />
              <span className="text-xs text-muted-foreground">
                {platform.primaryColor || "Not set"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: platform.secondaryColor || "#ccc" }}
              />
              <span className="text-xs text-muted-foreground">
                {platform.secondaryColor || "Not set"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const handleUpdate = () => {
    // Query will automatically refresh
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Management</h1>
          <p className="text-muted-foreground">
            Configure platform logos and branding across the application
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
              "Initialize Default Platforms"
            )}
          </Button>
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to use</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Upload SVG logos by providing URLs (use services like Cloudinary, AWS S3, or direct URLs)</li>
            <li><strong>Horizontal Logo:</strong> Full logo with text, used in headers</li>
            <li><strong>Vertical Logo:</strong> Stacked version for compact spaces</li>
            <li><strong>Icon Only:</strong> Square icon for badges and small displays</li>
            <li><strong>White Version:</strong> For dark backgrounds and overlays</li>
            <li>Toggle where each platform's logo appears using the checkboxes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Platform Cards */}
      {platforms && platforms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform._id}
              platform={platform as Platform}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No platforms configured yet. Click the button above to initialize default platforms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
