"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Plus,
  X,
  Save,
  Star,
  Tag,
  DollarSign,
  Layers,
  Map,
  ChevronDown,
  Hash,
  Check,
} from "lucide-react";

interface UnitType {
  id: string;
  label: string;
  price: number;
  size: number;
  totalUnits: number;
  availableUnits: number;
  tags: string[];
}

interface StarRange {
  min: number;
  max: number;
}

interface Project {
  id: string;
  name: string;
  status: "pre-sale" | "under-construction" | "ready";
}

interface PropertyTag {
  label: string;
  color: string;
}

export default function ProjectsPage() {
  // Multi-project support
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Ocean Tower Panama", status: "under-construction" },
    { id: "2", name: "Costa Verde Residences", status: "pre-sale" },
    { id: "3", name: "Skyline Plaza", status: "ready" },
  ]);
  const [activeProjectId, setActiveProjectId] = useState("1");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const [projectName, setProjectName] = useState("Ocean Tower Panama");
  const [projectDescription, setProjectDescription] = useState("Luxury oceanfront residential tower with panoramic views of the Pacific Ocean and Panama City skyline.");
  const [projectStatus, setProjectStatus] = useState<"pre-sale" | "under-construction" | "ready">("under-construction");
  
  // Location with Manual/Map toggle
  const [locationMode, setLocationMode] = useState<"manual" | "map">("manual");
  const [address, setAddress] = useState("Avenida Balboa, Punta Pacifica");
  const [city, setCity] = useState("Panama City");
  const [country, setCountry] = useState("Panama");
  const [latitude, setLatitude] = useState("8.9824");
  const [longitude, setLongitude] = useState("-79.5199");

  // Available Tags for the project
  const [availableTags, setAvailableTags] = useState<PropertyTag[]>([
    { label: "Luxury", color: "amber" },
    { label: "Sea View", color: "blue" },
    { label: "Investment", color: "purple" },
    { label: "Beachfront", color: "cyan" },
    { label: "Penthouse", color: "pink" },
  ]);
  const [newTagName, setNewTagName] = useState("");
  const [showTagCreator, setShowTagCreator] = useState(false);

  // Unit Types / Inventory with Tags
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([
    { id: "1", label: "Studio", price: 95000, size: 45, totalUnits: 20, availableUnits: 8, tags: ["Investment"] },
    { id: "2", label: "1 Bedroom", price: 150000, size: 72, totalUnits: 40, availableUnits: 15, tags: ["Investment", "Sea View"] },
    { id: "3", label: "2 Bedroom", price: 245000, size: 110, totalUnits: 30, availableUnits: 12, tags: ["Luxury", "Sea View"] },
    { id: "4", label: "Ocean View Penthouse", price: 850000, size: 280, totalUnits: 4, availableUnits: 2, tags: ["Luxury", "Penthouse", "Sea View"] },
  ]);

  // Star Rating Logic
  const [starRanges, setStarRanges] = useState<StarRange[]>([
    { min: 0, max: 80000 },
    { min: 80000, max: 150000 },
    { min: 150000, max: 250000 },
    { min: 250000, max: 500000 },
    { min: 500000, max: 10000000 },
  ]);

  const [editingUnitTags, setEditingUnitTags] = useState<string | null>(null);

  const addUnitType = () => {
    const newUnit: UnitType = {
      id: Date.now().toString(),
      label: "New Unit Type",
      price: 0,
      size: 0,
      totalUnits: 0,
      availableUnits: 0,
      tags: [],
    };
    setUnitTypes([...unitTypes, newUnit]);
  };

  const updateUnitType = (id: string, field: keyof UnitType, value: string | number | string[]) => {
    setUnitTypes(unitTypes.map(unit => 
      unit.id === id ? { ...unit, [field]: value } : unit
    ));
  };

  const removeUnitType = (id: string) => {
    setUnitTypes(unitTypes.filter(unit => unit.id !== id));
  };

  const toggleUnitTag = (unitId: string, tagLabel: string) => {
    setUnitTypes(unitTypes.map(unit => {
      if (unit.id === unitId) {
        const hasTag = unit.tags.includes(tagLabel);
        return {
          ...unit,
          tags: hasTag 
            ? unit.tags.filter(t => t !== tagLabel)
            : [...unit.tags, tagLabel]
        };
      }
      return unit;
    }));
  };

  const updateStarRange = (index: number, field: "min" | "max", value: number) => {
    const newRanges = [...starRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setStarRanges(newRanges);
  };

  const createNewTag = () => {
    if (newTagName.trim()) {
      const colors = ["blue", "green", "amber", "purple", "pink", "cyan"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setAvailableTags([...availableTags, { label: newTagName.trim(), color: randomColor }]);
      setNewTagName("");
      setShowTagCreator(false);
    }
  };

  const getTagColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };
    return colorMap[color] || colorMap.blue;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleProjectSwitch = (projectId: string) => {
    setActiveProjectId(projectId);
    setProjectDropdownOpen(false);
    // In real app, would load project data here
  };

  const handleCreateNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "New Project",
      status: "pre-sale",
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
    setProjectDropdownOpen(false);
  };

  const totalUnits = unitTypes.reduce((sum, unit) => sum + unit.totalUnits, 0);
  const totalAvailable = unitTypes.reduce((sum, unit) => sum + unit.availableUnits, 0);
  const inventoryPercentage = totalUnits > 0 ? Math.round((totalAvailable / totalUnits) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header with Project Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Project Selection Bar */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted transition-colors"
            >
              <Building2 className="h-5 w-5 text-[#28A963]" />
              <span className="font-semibold">{activeProject?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeProject?.status === "ready" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : activeProject?.status === "under-construction"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {activeProject?.status === "under-construction" ? "Building" : activeProject?.status === "pre-sale" ? "Pre-Sale" : "Ready"}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${projectDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {projectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-lg border bg-card shadow-lg z-50">
                <div className="p-2">
                  <p className="text-xs text-muted-foreground px-2 py-1">Switch Project</p>
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSwitch(project.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors ${
                        project.id === activeProjectId ? "bg-muted" : ""
                      }`}
                    >
                      <span className="font-medium">{project.name}</span>
                      {project.id === activeProjectId && (
                        <Check className="h-4 w-4 text-[#28A963]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Create New Project Button */}
          <Button
            onClick={handleCreateNewProject}
            size="sm"
            className="bg-[#28A963] hover:bg-[#229954]"
            title="Create New Project"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button className="bg-[#28A963] hover:bg-[#229954]">
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Project Configuration</h1>
        <p className="text-muted-foreground">
          Define project parameters, pricing matrix, and lead qualification rules
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{totalUnits}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-[#28A963]">{totalAvailable}</p>
              </div>
              <Layers className="h-8 w-8 text-[#28A963]/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory</p>
                <p className="text-2xl font-bold">{inventoryPercentage}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">{inventoryPercentage > 50 ? "✓" : "!"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unit Types</p>
                <p className="text-2xl font-bold">{unitTypes.length}</p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section A: Project Details & Location */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Building2 className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Project Details & Location</CardTitle>
              <CardDescription>Basic project information and geographic data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Project Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as typeof projectStatus)}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                >
                  <option value="pre-sale">Pre-Sale</option>
                  <option value="under-construction">Under Construction</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
            </div>

            {/* Right: Location with Toggle */}
            <div className="space-y-4">
              {/* Location Mode Toggle */}
              <div>
                <label className="text-sm font-medium mb-2 block">Address Input Mode</label>
                <div className="flex rounded-lg border border-input p-1 bg-muted/30">
                  <button
                    onClick={() => setLocationMode("manual")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      locationMode === "manual"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Manual Address
                  </button>
                  <button
                    onClick={() => setLocationMode("map")}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      locationMode === "map"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pin on Map
                  </button>
                </div>
              </div>

              {locationMode === "manual" ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Street Address</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Map Mode - Interactive placeholder */
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6 text-center h-[180px] flex flex-col items-center justify-center">
                  <Map className="h-10 w-10 text-[#28A963]/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">Drop Pin on Map</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click anywhere on the map to set location
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 font-mono">
                    Lat: {latitude}, Long: {longitude}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    Set Pin
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Unit Configuration with Tags */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
                <DollarSign className="h-5 w-5 text-[#28A963]" />
              </div>
              <div>
                <CardTitle>Unit Configuration</CardTitle>
                <CardDescription>Dynamic pricing matrix, inventory, and tagging</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTagCreator(!showTagCreator)} 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground"
              >
                <Hash className="h-4 w-4 mr-1" />
                Create Tag
              </Button>
              <Button onClick={addUnitType} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Unit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tag Creator */}
          {showTagCreator && (
            <div className="mb-4 p-4 rounded-lg border bg-muted/30 flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#28A963]/50"
                onKeyDown={(e) => e.key === "Enter" && createNewTag()}
              />
              <Button onClick={createNewTag} size="sm">Create</Button>
              <Button onClick={() => setShowTagCreator(false)} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Available Tags Display */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground mr-2">Available Tags:</span>
            {availableTags.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTagColorClasses(tag.color)}`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price ($)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size (m²)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avail.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {unitTypes.map((unit) => (
                  <tr key={unit.id} className="bg-background">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={unit.label}
                        onChange={(e) => updateUnitType(unit.id, "label", e.target.value)}
                        className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setEditingUnitTags(editingUnitTags === unit.id ? null : unit.id)}
                          className="flex flex-wrap gap-1 min-h-[28px] items-center"
                        >
                          {unit.tags.length > 0 ? (
                            unit.tags.map((tagLabel) => {
                              const tag = availableTags.find(t => t.label === tagLabel);
                              return (
                                <span
                                  key={tagLabel}
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTagColorClasses(tag?.color || "blue")}`}
                                >
                                  {tagLabel}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">+ Add tags</span>
                          )}
                        </button>

                        {/* Tag Selector Dropdown */}
                        {editingUnitTags === unit.id && (
                          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-card shadow-lg z-50 p-2">
                            <p className="text-xs text-muted-foreground px-2 mb-2">Select tags:</p>
                            {availableTags.map((tag) => {
                              const isSelected = unit.tags.includes(tag.label);
                              return (
                                <button
                                  key={tag.label}
                                  onClick={() => toggleUnitTag(unit.id, tag.label)}
                                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${
                                    isSelected ? "bg-muted" : ""
                                  }`}
                                >
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTagColorClasses(tag.color)}`}>
                                    {tag.label}
                                  </span>
                                  {isSelected && <Check className="h-3 w-3 text-[#28A963]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={unit.price}
                        onChange={(e) => updateUnitType(unit.id, "price", parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={unit.size}
                        onChange={(e) => updateUnitType(unit.id, "size", parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={unit.totalUnits}
                        onChange={(e) => updateUnitType(unit.id, "totalUnits", parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={unit.availableUnits}
                        onChange={(e) => updateUnitType(unit.id, "availableUnits", parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm font-medium text-[#28A963] focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUnitType(unit.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This inventory data feeds directly into the Commercial Intent module to qualify leads automatically. Tags help filter and categorize units (e.g., "The Penthouse has [Luxury] and [Sea View] tags").
          </p>
        </CardContent>
      </Card>

      {/* Section C: Smart Categorization (Star Logic) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28A963]/10">
              <Star className="h-5 w-5 text-[#28A963]" />
            </div>
            <div>
              <CardTitle>Price Segmentation Logic</CardTitle>
              <CardDescription>Define star rating thresholds for lead qualification</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {starRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 w-24">
                  {Array.from({ length: index + 1 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  {Array.from({ length: 5 - (index + 1) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={range.min}
                    onChange={(e) => updateStarRange(index, "min", parseInt(e.target.value) || 0)}
                    className="w-28 rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={range.max}
                    onChange={(e) => updateStarRange(index, "max", parseInt(e.target.value) || 0)}
                    className="w-28 rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#28A963]/50"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-32">
                  {formatCurrency(range.min)} - {range.max >= 10000000 ? "$10M+" : formatCurrency(range.max)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>How it works:</strong> When a lead mentions a budget, the AI assigns a star rating based on these thresholds. This auto-segments leads and matches them to appropriate unit types.
          </p>
        </CardContent>
      </Card>

      {/* Property Tags card REMOVED - functionality merged into Unit Configuration table */}
    </div>
  );
}
