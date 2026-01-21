"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import Image from "next/image"
import {
  Palette,
  Upload,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function OrwellBrandingPage() {
  // For demo purposes, we'll assume the current user is an Orwell Admin
  // In production, this would check against the actual logged-in user
  const isAdmin = true // TODO: Replace with actual auth check

  const activeBranding = useQuery(api.branding.getActiveBranding)
  const upsertBranding = useMutation(api.branding.upsertBranding)
  const generateUploadUrl = useMutation(api.branding.generateUploadUrl)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    platformName: "Orwell",
    tagline: "",
    primaryColor: "#28A963",
    secondaryColor: "",
    accentColor: "",
  })
  const [logoFiles, setLogoFiles] = useState<{
    logoLight: File | null
    logoDark: File | null
    logoIcon: File | null
    favicon: File | null
  }>({
    logoLight: null,
    logoDark: null,
    logoIcon: null,
    favicon: null,
  })
  const [previewUrls, setPreviewUrls] = useState<{
    logoLight: string | null
    logoDark: string | null
    logoIcon: string | null
    favicon: string | null
  }>({
    logoLight: null,
    logoDark: null,
    logoIcon: null,
    favicon: null,
  })

  // Load current branding into form when data is available
  const loadCurrentBranding = useCallback(() => {
    if (activeBranding && !activeBranding.isDefault) {
      setFormData({
        platformName: activeBranding.platformName,
        tagline: activeBranding.tagline || "",
        primaryColor: activeBranding.primaryColor,
        secondaryColor: activeBranding.secondaryColor || "",
        accentColor: activeBranding.accentColor || "",
      })
      setPreviewUrls({
        logoLight: activeBranding.logoLightUrl || null,
        logoDark: activeBranding.logoDarkUrl || null,
        logoIcon: activeBranding.logoIconUrl || null,
        favicon: activeBranding.faviconUrl || null,
      })
    }
  }, [activeBranding])

  const handleFileChange = (type: keyof typeof logoFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFiles((prev) => ({ ...prev, [type]: file }))
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrls((prev) => ({ ...prev, [type]: url }))
    }
  }

  const uploadFile = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl()
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })
    const { storageId } = await response.json()
    return storageId
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Upload any new logo files
      let logoLightStorageId = activeBranding && !activeBranding.isDefault 
        ? (activeBranding as any).logoLightStorageId 
        : undefined
      let logoDarkStorageId = activeBranding && !activeBranding.isDefault 
        ? (activeBranding as any).logoDarkStorageId 
        : undefined
      let logoIconStorageId = activeBranding && !activeBranding.isDefault 
        ? (activeBranding as any).logoIconStorageId 
        : undefined
      let faviconStorageId = activeBranding && !activeBranding.isDefault 
        ? (activeBranding as any).faviconStorageId 
        : undefined

      if (logoFiles.logoLight) {
        logoLightStorageId = await uploadFile(logoFiles.logoLight)
      }
      if (logoFiles.logoDark) {
        logoDarkStorageId = await uploadFile(logoFiles.logoDark)
      }
      if (logoFiles.logoIcon) {
        logoIconStorageId = await uploadFile(logoFiles.logoIcon)
      }
      if (logoFiles.favicon) {
        faviconStorageId = await uploadFile(logoFiles.favicon)
      }

      await upsertBranding({
        id: activeBranding && !activeBranding.isDefault ? (activeBranding as any)._id : undefined,
        platformName: formData.platformName,
        tagline: formData.tagline || undefined,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor || undefined,
        accentColor: formData.accentColor || undefined,
        logoLightStorageId,
        logoDarkStorageId,
        logoIconStorageId,
        faviconStorageId,
        isActive: true,
      })

      setIsEditing(false)
      setLogoFiles({ logoLight: null, logoDark: null, logoIcon: null, favicon: null })
    } catch (error) {
      console.error("Failed to save branding:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-red-800">Access Denied</h1>
          <p className="text-red-600 mt-2">
            This page is only accessible to Orwell Administrators.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="h-7 w-7 text-[#28A963]" />
            Platform Branding
          </h1>
          <p className="text-gray-400 mt-1">
            Manage the Orwell dashboard branding and visual identity
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => {
                loadCurrentBranding()
                setIsEditing(true)
              }}
              className="px-4 py-2 bg-[#28A963] text-white rounded-lg hover:bg-[#228b53] transition-colors flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Edit Branding
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-[#28A963] text-white rounded-lg hover:bg-[#228b53] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Current Branding Preview */}
      <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-400" />
          Current Branding
        </h2>
        
        {activeBranding ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Light Mode Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <span className="text-xs text-gray-500 mb-2 block">Light Mode</span>
              <div className="flex items-center gap-3">
                {activeBranding.logoLightUrl ? (
                  <Image
                    src={previewUrls.logoLight || activeBranding.logoLightUrl}
                    alt={activeBranding.platformName}
                    width={150}
                    height={40}
                    className="h-10 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold" style={{ color: activeBranding.primaryColor }}>
                    {activeBranding.platformName}
                  </span>
                )}
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <span className="text-xs text-gray-400 mb-2 block">Dark Mode</span>
              <div className="flex items-center gap-3">
                {activeBranding.logoDarkUrl ? (
                  <Image
                    src={previewUrls.logoDark || activeBranding.logoDarkUrl}
                    alt={activeBranding.platformName}
                    width={150}
                    height={40}
                    className="h-10 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {activeBranding.platformName}
                  </span>
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="col-span-2 grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Platform Name</span>
                <span className="font-medium text-white">{activeBranding.platformName}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Primary Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md border border-gray-600"
                    style={{ backgroundColor: activeBranding.primaryColor }}
                  />
                  <span className="font-mono text-sm text-gray-300">{activeBranding.primaryColor}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Status</span>
                <span className="inline-flex items-center gap-1 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Loading branding configuration...
          </div>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Edit Branding</h2>
          
          <div className="space-y-6">
            {/* Platform Name & Tagline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, platformName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#28A963] focus:border-transparent"
                  placeholder="Orwell"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#28A963] focus:border-transparent"
                  placeholder="Social Listening Platform"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="h-10 w-16 rounded border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#28A963] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor || "#000000"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    className="h-10 w-16 rounded border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#28A963] focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor || "#000000"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                    className="h-10 w-16 rounded border border-gray-700 cursor-pointer bg-gray-800"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#28A963] focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Logo Uploads */}
            <div className="grid grid-cols-2 gap-4">
              {/* Logo Light */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Logo (Light Background)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-white hover:border-[#28A963] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange("logoLight")}
                    className="hidden"
                    id="logo-light-upload"
                  />
                  <label htmlFor="logo-light-upload" className="cursor-pointer">
                    {previewUrls.logoLight ? (
                      <Image
                        src={previewUrls.logoLight}
                        alt="Logo preview"
                        width={200}
                        height={60}
                        className="mx-auto h-12 w-auto object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Click to upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Logo Dark */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Logo (Dark Background)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-800 hover:border-[#28A963] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange("logoDark")}
                    className="hidden"
                    id="logo-dark-upload"
                  />
                  <label htmlFor="logo-dark-upload" className="cursor-pointer">
                    {previewUrls.logoDark ? (
                      <Image
                        src={previewUrls.logoDark}
                        alt="Logo preview"
                        width={200}
                        height={60}
                        className="mx-auto h-12 w-auto object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">Click to upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Icon Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Icon Logo (Square)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-800 hover:border-[#28A963] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange("logoIcon")}
                    className="hidden"
                    id="logo-icon-upload"
                  />
                  <label htmlFor="logo-icon-upload" className="cursor-pointer">
                    {previewUrls.logoIcon ? (
                      <Image
                        src={previewUrls.logoIcon}
                        alt="Icon preview"
                        width={60}
                        height={60}
                        className="mx-auto h-12 w-12 object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">Click to upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Favicon (16x16 or 32x32)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-800 hover:border-[#28A963] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.ico"
                    onChange={handleFileChange("favicon")}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    {previewUrls.favicon ? (
                      <Image
                        src={previewUrls.favicon}
                        alt="Favicon preview"
                        width={32}
                        height={32}
                        className="mx-auto h-8 w-8 object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-sm text-gray-400">Click to upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notice */}
      <div className="mt-6 bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-400">Orwell Admin Access</h3>
            <p className="text-sm text-amber-300/80 mt-1">
              This page is only visible to Orwell platform administrators. Changes made here will
              affect the branding across all client dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
