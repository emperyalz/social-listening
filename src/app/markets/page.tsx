"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Building2, TrendingUp, Users } from "lucide-react";

// Demo market data for Colombia
const DEMO_MARKETS = [
  {
    id: "1",
    name: "Bogota",
    region: "Cundinamarca",
    competitors: 12,
    projects: 45,
    avgPrice: "$850M COP/m²",
    growth: "+8.5%",
  },
  {
    id: "2",
    name: "Medellin",
    region: "Antioquia",
    competitors: 8,
    projects: 32,
    avgPrice: "$720M COP/m²",
    growth: "+12.3%",
  },
  {
    id: "3",
    name: "Cartagena",
    region: "Bolivar",
    competitors: 5,
    projects: 18,
    avgPrice: "$950M COP/m²",
    growth: "+6.2%",
  },
  {
    id: "4",
    name: "Barranquilla",
    region: "Atlantico",
    competitors: 4,
    projects: 15,
    avgPrice: "$580M COP/m²",
    growth: "+9.8%",
  },
  {
    id: "5",
    name: "Cali",
    region: "Valle del Cauca",
    competitors: 6,
    projects: 22,
    avgPrice: "$620M COP/m²",
    growth: "+7.1%",
  },
];

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">
            Geographic markets and regional analysis for Colombian real estate
          </p>
        </div>
        <Button className="bg-[#28A963] hover:bg-[#229954]">
          <Plus className="h-4 w-4 mr-2" />
          Add Market
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Active Markets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">132</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">35</p>
                <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {DEMO_MARKETS.map((market) => (
          <Card key={market.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#28A963] to-[#1e8449] flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{market.name}</span>
                      <span className="text-sm text-muted-foreground">({market.region})</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{market.competitors} competitors</span>
                      <span>•</span>
                      <span>{market.projects} projects</span>
                      <span>•</span>
                      <span>{market.avgPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">{market.growth}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}