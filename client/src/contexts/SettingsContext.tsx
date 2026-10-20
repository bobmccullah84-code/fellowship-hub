import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

type SiteSettings = {
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  featuresTitle: string;
  featuresSubtitle: string;
  typography: {
    heroTitleSize: string;
    heroSubtitleSize: string;
    sectionTitleSize: string;
    cardTitleSize: string;
    bodyTextSize: string;
  };
  layout: {
    cardSize: string;
    cardsPerRow: number;
    sectionSpacing: string;
    maxContentWidth: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

type SettingsContextType = {
  settings: SiteSettings | null;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  return (
    <SettingsContext.Provider value={{ settings: settings || null, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
