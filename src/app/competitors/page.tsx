"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Instagram, Youtube, ExternalLink } from "lucide-react";

// Demo competitor data for Grupo Horizonte
const DEMO_COMPETITORS = [
  {
    id: "1",
    name: "Constructora Colpatria",
    type: "Developer",
    market: "Bogota",
    description: "Major real estate developer in Colombia",
    website: "https://colpatria.com",
    accounts: 4,
    platforms: ["instagram", "youtube", "tiktok"],
  },
  {
    id: "2",
    name: "Amarilo",
    type: "Developer",
    market: "National",
    description: "Leading housing developer across Colombia",
    website: "https://amarilo.com.co",
    accounts: 6,
    platforms: ["instagram", "youtube", "facebook"],
  },
  {
    id: "3",
    name: "Constructora Bolivar",
    type: "Developer",
    market: "Bogota",
    description: "VIS and social housing specialist",
    website: "https://constructorabolivar.com",
    accounts: 5,
    platforms: ["instagram", "youtube"],
  },
  {
    id: "4",
    name: "Cusezar",
    type: "Developer",
    market: "Bogota",
    description: "Premium residential projects",
    website: "https://cusezar.com",
    accounts: 3,
    platforms: ["instagram", "linkedin"],
  },
  {
    id: "5",
    name: "Marval",
    type: "Developer",
    market: "Medellin",
    description: "Antioquia regional leader",
    website: "https://marval.com.co",
    accounts: 4,
    platforms: ["instagram", "youtube", "tiktok"],
  },
];

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground">
            Track and analyze your competition in the Colombian real estate market
          </p>
        </div>
        <Button className="bg-[#28A963] hover:bg-[#229954]">
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      <div className="grid gap-4">
        {DEMO_COMPETITORS.map((competitor) => (
          <Card key={competitor.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{competitor.name}</span>
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                        {competitor.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{competitor.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{competitor.market}</span>
                      <span>•</span>
                      <span>{competitor.accounts} accounts tracked</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {competitor.platforms.includes("instagram") && (
                      <Instagram className="h-4 w-4 text-pink-500" />
                    )}
                    {competitor.platforms.includes("youtube") && (
                      <Youtube className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}