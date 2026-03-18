import * as en from "./en";
import * as zh from "./zh";

export const siteContent = {
    en,
    zh
};

export type SiteContent = typeof en;

// Re-export types if needed
export type { SectionCopy, TheoryModule, FaqItem, GlossaryItem, HeroOption } from "./en";

// Compatibility exports for existing imports that might not be updated yet
// These will be removed once all components use the hook/siteContent object
export const {
    applications,
    bibtex,
    faqItems,
    glossaryItems,
    heroOptions,
    navItems,
    paperAbstract,
    sectionCopy,
    theoryModules,
    whyNew
} = en;
