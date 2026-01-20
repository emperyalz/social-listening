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
} from "lucide-react";

export default function ProfilePage() {
  const [companyName, setCompanyName] = useState("DM Real Estate Panama");
  const [legalName, setLegalName] = useState("DM Real Estate Development S.A.");
  const [taxId, setTaxId] = useState("155-5555-123456");
  const [hqLocation, setHqLocation] = useState("Panama City, Panama");
  const [websiteUrl, setWebsiteUrl] = useState("https://dmrealestatepanama.com");
  
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "2024_Brand_Guidelines.pdf", status: "verified" },
    { name: "Tone_of_Voice_Guide.docx", status: "verified" },
  ]);

  const [socialConnections, setSocialConnections] = useState([
    { platform: "Instagram", handle: "@dmrealestatepanama", connected: true },
    { platform: "LinkedIn", handle: "DM Real Estate Panama", connected: true },
    { platform: "TikTok", handle: "@dmrealestatepanama", connected: false },
  ]);

  const [competitors, setCompetitors] = useState([
    "Grupo Provivienda",
    "Empresas Bern",
    "Price Smart Homes",
  ]);

  const [newCompetitor, setNewCompetitor] = useState("");

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && competitors.length < 5) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor("");
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
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
        <Button className="bg-[#28A963] hover:bg-[#229954]">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
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
              />
            </div>
            <div>
              <label className="text-sm font-medium">Legal Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tax ID / RUC</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">HQ Location</label>
              <input
                type="text"
                value={hqLocation}
                onChange={(e) => setHqLocation(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
              />
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
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-sm font-medium">Company Logo</label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="flex-1">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG or SVG. Max 2MB. Recommended: 512x512px
                </p>
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
          {/* Upload Zone */}
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 text-center hover:border-[#28A963]/50 transition-colors cursor-pointer">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="font-medium">Upload Brand Assets</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & Drop or click to upload Brandbooks, Tone Guides, and Style Documents
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: PDF, DOCX • Max 10MB per file
            </p>
          </div>

          {/* Uploaded Files */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Documents</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === "verified" && (
                    <span className="flex items-center gap-1 text-xs text-[#28A963]">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
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
              className="flex items-center justify-between rounded-md border bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {connection.platform === "Instagram" && (
                  <Instagram className="h-5 w-5 text-pink-500" />
                )}
                {connection.platform === "LinkedIn" && (
                  <Linkedin className="h-5 w-5 text-blue-600" />
                )}
                {connection.platform === "TikTok" && (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                )}
                <div>
                  <p className="font-medium text-sm">{connection.platform}</p>
                  <p className="text-xs text-muted-foreground">{connection.handle}</p>
                </div>
              </div>
              {connection.connected ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[#28A963]/10 px-3 py-1 text-xs font-medium text-[#28A963]">
                  <Check className="h-3 w-3" />
                  Connected
                </span>
              ) : (
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              )}
            </div>
          ))}
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
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border bg-background px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{competitor}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCompetitor(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
