"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Settings, Eye, EyeOff } from "lucide-react";

// Demo platform data
const DEMO_PLATFORMS = [
  { id: "instagram", name: "Instagram", emoji: "📷", color: "#E1306C", isActive: true, logoCount: 3 },
  { id: "tiktok", name: "TikTok", emoji: "🎵", color: "#00F2EA", isActive: true, logoCount: 2 },
  { id: "youtube", name: "YouTube", emoji: "▶️", color: "#FF0000", isActive: true, logoCount: 2 },
  { id: "facebook", name: "Facebook", emoji: "👤", color: "#1877F2", isActive: false, logoCount: 1 },
  { id: "linkedin", name: "LinkedIn", emoji: "💼", color: "#0A66C2", isActive: false, logoCount: 1 },
  { id: "twitter", name: "X (Twitter)", emoji: "🐦", color: "#000000", isActive: false, logoCount: 0 },
];

export default function PlatformsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Management</h1>
          <p className="text-muted-foreground">
            Upload and manage platform logos across the application
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid gap-4">
        {DEMO_PLATFORMS.map((platform) => (
          <Card key={platform.id} className={!platform.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-lg flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{platform.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${platform.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {platform.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{platform.logoCount} logo{platform.logoCount !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span className="capitalize">{platform.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: platform.color }}
                  />
                  <Button variant="ghost" size="sm">
                    {platform.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="py-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Demo Mode: Platform logo management requires backend connection
          </p>
        </CardContent>
      </Card>
    </div>
  );
}