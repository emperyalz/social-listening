"use client";

import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, MessageCircle, Eye, Play, Clock, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Demo post data for Grupo Horizonte
const DEMO_POSTS = [
  {
    id: "1",
    platform: "instagram",
    username: "grupo_horizonte",
    caption: "Descubre el lujo de vivir en El Poblado! Nuestro nuevo proyecto Torre Esmeralda ofrece vistas espectaculares y acabados de primera. Agenda tu visita hoy! 🏙️✨ #InversionColombia #ApartamentosMedellin",
    thumbnailUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop",
    postType: "carousel",
    postedAt: Date.now() - 1000 * 60 * 60 * 2,
    likes: 2450,
    comments: 89,
    views: 12500,
    hashtags: ["InversionColombia", "ApartamentosMedellin", "LujoEnElPoblado"],
    postUrl: "https://instagram.com/p/example1",
  },
  {
    id: "2",
    platform: "tiktok",
    username: "grupohorizonte",
    caption: "Tour completo por nuestro apartamento modelo en Cartagena! 🌴🏠 Que te parece? #TourApartamento #CartagenaLujo #InmobiliariaColombia",
    thumbnailUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop",
    postType: "video",
    postedAt: Date.now() - 1000 * 60 * 60 * 8,
    likes: 15600,
    comments: 234,
    views: 89000,
    duration: 45,
    hashtags: ["TourApartamento", "CartagenaLujo", "InmobiliariaColombia"],
    postUrl: "https://tiktok.com/@grupohorizonte/video/example2",
  },
  {
    id: "3",
    platform: "youtube",
    username: "GrupoHorizonteTV",
    caption: "Por que invertir en Bogota en 2025? Analisis completo del mercado inmobiliario colombiano",
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
    postType: "video",
    postedAt: Date.now() - 1000 * 60 * 60 * 24,
    likes: 1890,
    comments: 156,
    views: 45000,
    duration: 612,
    hashtags: ["InversionBogota", "MercadoInmobiliario"],
    postUrl: "https://youtube.com/watch?v=example3",
  },
  {
    id: "4",
    platform: "instagram",
    username: "grupo_horizonte",
    caption: "Zonas comunes que transforman tu estilo de vida. Gimnasio, piscina, coworking y mas en Proyecto Marina! 💪🏊‍♂️ #VidaEnCondominio #ProyectoMarina",
    thumbnailUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop",
    postType: "reel",
    postedAt: Date.now() - 1000 * 60 * 60 * 48,
    likes: 3200,
    comments: 67,
    views: 18900,
    duration: 30,
    hashtags: ["VidaEnCondominio", "ProyectoMarina", "ZonasComunes"],
    postUrl: "https://instagram.com/reel/example4",
  },
  {
    id: "5",
    platform: "instagram",
    username: "constructora_colpatria",
    caption: "Nuevo lanzamiento! Apartamentos desde 45m2 en el corazon de Chapinero. Preventa con precios especiales.",
    thumbnailUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=400&fit=crop",
    postType: "image",
    postedAt: Date.now() - 1000 * 60 * 60 * 72,
    likes: 1890,
    comments: 45,
    views: 8500,
    hashtags: ["Chapinero", "ApartamentosBogota"],
    postUrl: "https://instagram.com/p/example5",
  },
  {
    id: "6",
    platform: "tiktok",
    username: "amarilo_co",
    caption: "3 tips para comprar tu primer apartamento en Colombia 🏠💡 #TipsInmobiliarios #PrimerApartamento",
    thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
    postType: "video",
    postedAt: Date.now() - 1000 * 60 * 60 * 96,
    likes: 8900,
    comments: 312,
    views: 56000,
    duration: 60,
    hashtags: ["TipsInmobiliarios", "PrimerApartamento"],
    postUrl: "https://tiktok.com/@amarilo_co/video/example6",
  },
  {
    id: "7",
    platform: "youtube",
    username: "GrupoHorizonteTV",
    caption: "Recorrido completo: Torre Esmeralda - Apartamento de 3 habitaciones con vista panoramica",
    thumbnailUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop",
    postType: "video",
    postedAt: Date.now() - 1000 * 60 * 60 * 120,
    likes: 2340,
    comments: 89,
    views: 34000,
    duration: 480,
    hashtags: ["TorreEsmeralda", "ApartamentoLujo"],
    postUrl: "https://youtube.com/watch?v=example7",
  },
  {
    id: "8",
    platform: "instagram",
    username: "grupo_horizonte",
    caption: "El atardecer desde tu nuevo hogar. Vista desde piso 25, Torre Esmeralda 🌅 #AtardecerMedellin #VistasPanoramicas",
    thumbnailUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=400&fit=crop",
    postType: "image",
    postedAt: Date.now() - 1000 * 60 * 60 * 144,
    likes: 4100,
    comments: 112,
    views: 22000,
    hashtags: ["AtardecerMedellin", "VistasPanoramicas"],
    postUrl: "https://instagram.com/p/example8",
  },
];

const PLATFORM_COLORS: Record<string, { primary: string; bg: string }> = {
  instagram: { primary: "#E1306C", bg: "from-purple-500 to-pink-500" },
  tiktok: { primary: "#00F2EA", bg: "from-black to-gray-800" },
  youtube: { primary: "#FF0000", bg: "from-red-600 to-red-700" },
};

const PLATFORM_EMOJI: Record<string, string> = { instagram: "📸", tiktok: "🎵", youtube: "📺" };

function PostsContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const filteredPosts = selectedPlatform 
    ? DEMO_POSTS.filter(p => p.platform === selectedPlatform)
    : DEMO_POSTS;

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString("es-CO", { month: "short", day: "numeric", year: "numeric" });
  const formatNumber = (num: number) => num >= 1000000 ? (num / 1000000).toFixed(1) + "M" : num >= 1000 ? (num / 1000).toFixed(1) + "K" : num.toString();
  const formatDuration = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, "0")}`; };

  const thisWeekPosts = filteredPosts.filter(p => p.postedAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
  const thisMonthPosts = filteredPosts.filter(p => p.postedAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground">Browse and analyze competitor content</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Demo Mode
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg text-foreground">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={selectedPlatform === null ? "default" : "outline"} size="sm" onClick={() => setSelectedPlatform(null)}>All</Button>
            {["instagram", "tiktok", "youtube"].map(p => (
              <Button key={p} variant={selectedPlatform === p ? "default" : "outline"} size="sm" onClick={() => setSelectedPlatform(p)} className="flex items-center gap-2">
                <span>{PLATFORM_EMOJI[p]}</span>
                <span className="capitalize">{p}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6"><p className="text-sm font-medium text-muted-foreground">Total Posts</p><p className="text-3xl font-bold text-foreground">{filteredPosts.length}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6"><p className="text-sm font-medium text-muted-foreground">This Week</p><p className="text-3xl font-bold text-foreground">{thisWeekPosts}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6"><p className="text-sm font-medium text-muted-foreground">This Month</p><p className="text-3xl font-bold text-foreground">{thisMonthPosts}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group bg-card border-border">
            <div className="relative aspect-square bg-muted overflow-hidden cursor-pointer">
              <img src={post.thumbnailUrl} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white flex items-center gap-1 bg-gradient-to-r ${PLATFORM_COLORS[post.platform].bg}`}>
                <span>{PLATFORM_EMOJI[post.platform]}</span>
                <span className="capitalize">{post.platform}</span>
              </div>
              
              <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-black/60 text-white">{post.postType}</div>
              
              {post.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium rounded bg-black/70 text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />{formatDuration(post.duration)}
                </div>
              )}
              
              {(post.postType === "video" || post.postType === "reel") && (
                <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity bg-black/10 group-hover:bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-gray-800 ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">@{post.username}</span>
                <span className="text-muted-foreground">{formatDate(post.postedAt)}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{post.caption}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1" title="Likes"><Heart className="h-4 w-4 text-red-500" /><span>{formatNumber(post.likes)}</span></div>
                <div className="flex items-center gap-1" title="Comments"><MessageCircle className="h-4 w-4 text-blue-500" /><span>{formatNumber(post.comments)}</span></div>
                {post.views > 0 && <div className="flex items-center gap-1" title="Views"><Eye className="h-4 w-4 text-green-500" /><span>{formatNumber(post.views)}</span></div>}
              </div>

              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {post.hashtags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                  {post.hashtags.length > 3 && <span className="text-xs text-muted-foreground">+{post.hashtags.length - 3} more</span>}
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => window.open(post.postUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />View Original
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <PostsContent />
    </Suspense>
  );
}