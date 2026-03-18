"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { DEFAULT_STYLE_CONFIG, type NetworkStyleConfig } from "@/features/animations/network/types";
import { deepMerge, setByPath, type DeepPartial } from "@/lib/object";
import { useThemeMode } from "./theme-provider";

type VisualizationSettingsContextType = {
  styleConfig: NetworkStyleConfig;
  applyPatch: (patch: DeepPartial<NetworkStyleConfig>) => void;
  setValue: (path: string, value: number | string | boolean) => void;
  reset: () => void;
};

const VisualizationSettingsContext = createContext<VisualizationSettingsContextType | undefined>(undefined);

const DARK_STYLE_OVERRIDES: DeepPartial<NetworkStyleConfig> = {
  nodes: {
    matching: {
      strokeColor: "#7dd3fc",
      textColor: "#bae6fd",
      fillColor: "#082f49",
      fillColorOpacity: 0.3
    },
    driver: {
      strokeColor: "#fb7185",
      textColor: "#feb4b4ff",
      fillColor: "#422006",
      fillColorOpacity: 0.35
    },
    regular: {
      strokeColor: "#cbd5f5",
      textColor: "#e2e8f0",
      fillColor: "#020617",
      fillColorOpacity: 1
    },
    hover: {
      strokeColor: "#fde68a",
      textColor: "#fde68a"
    }
  },
  edges: {
    matching: {
      color: "#fb7185"
    },
    nonMatching: {
      color: "#94a3b8"
    },
    alternativeNonMatching: {
      color: "#7dd3fc"
    },
    alternativeMatching: {
      color: "#fb7185"
    },
    virtual: {
      color: "rgba(255,255,255,0.12)"
    },
    hover: {
      color: "#fde68a"
    }
  }
};

const mergePartialOverrides = (...patches: DeepPartial<NetworkStyleConfig>[]): DeepPartial<NetworkStyleConfig> => {
  return deepMerge({} as NetworkStyleConfig, ...patches) as DeepPartial<NetworkStyleConfig>;
};

export function VisualizationSettingsProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeMode();
  const [overrides, setOverrides] = useState<DeepPartial<NetworkStyleConfig>>({});

  const baseConfig = useMemo(
    () => (theme === "dark" ? deepMerge(DEFAULT_STYLE_CONFIG, DARK_STYLE_OVERRIDES) : DEFAULT_STYLE_CONFIG),
    [theme]
  );

  const styleConfig = useMemo(
    () => deepMerge(baseConfig, overrides),
    [baseConfig, overrides]
  );

  const applyPatch = useCallback((patch: DeepPartial<NetworkStyleConfig>) => {
    setOverrides((prev) => mergePartialOverrides(prev ?? {}, patch));
  }, []);

  const setValue = useCallback((path: string, value: number | string | boolean) => {
    setOverrides((prev) => setByPath(prev ?? {}, path, value));
  }, []);

  const reset = useCallback(() => setOverrides({}), []);

  const contextValue = useMemo(
    () => ({
      styleConfig,
      applyPatch,
      setValue,
      reset
    }),
    [styleConfig, applyPatch, setValue, reset]
  );

  return <VisualizationSettingsContext.Provider value={contextValue}>{children}</VisualizationSettingsContext.Provider>;
}

export function useVisualizationSettings() {
  const context = useContext(VisualizationSettingsContext);
  if (!context) {
    throw new Error("useVisualizationSettings must be used within a VisualizationSettingsProvider");
  }
  return context;
}
