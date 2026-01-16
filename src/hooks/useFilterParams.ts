"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilterParams() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

  // Get current filter values from URL
  const selectedMarkets = searchParams.get("markets")?.split(",").filter(Boolean) || [];
    const selectedPlatforms = searchParams.get("platforms")?.split(",").filter(Boolean) || [];
    const selectedTypes = searchParams.get("types")?.split(",").filter(Boolean) || [];

  // Update URL params
  const updateParams = useCallback(
        (updates: { markets?: string[]; platforms?: string[]; types?: string[] }) => {
                const params = new URLSearchParams(searchParams.toString());

          if (updates.markets !== undefined) {
                    if (updates.markets.length > 0) {
                                params.set("markets", updates.markets.join(","));
                    } else {
                                params.delete("markets");
                    }
          }

          if (updates.platforms !== undefined) {
                    if (updates.platforms.length > 0) {
                                params.set("platforms", updates.platforms.join(","));
                    } else {
                                params.delete("platforms");
                    }
          }

          if (updates.types !== undefined) {
                    if (updates.types.length > 0) {
                                params.set("types", updates.types.join(","));
                    } else {
                                params.delete("types");
                    }
          }

          const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
                router.push(newUrl, { scroll: false });
        },
        [searchParams, router, pathname]
      );

  const setSelectedMarkets = useCallback(
        (markets: string[]) => updateParams({ markets }),
        [updateParams]
      );

  const setSelectedPlatforms = useCallback(
        (platforms: string[]) => updateParams({ platforms }),
        [updateParams]
      );

  const setSelectedTypes = useCallback(
        (types: string[]) => updateParams({ types }),
        [updateParams]
      );

  const clearAllFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
        selectedMarkets,
        selectedPlatforms,
        selectedTypes,
        setSelectedMarkets,
        setSelectedPlatforms,
        setSelectedTypes,
        clearAllFilters,
  };
}
