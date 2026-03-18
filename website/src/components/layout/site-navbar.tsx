"use client";

import Link from "next/link";
import Image from "next/image";

import { type Language, useI18n } from "@/providers/i18n-provider";

type NavItem = {
  id: string;
  label: string;
};

type SiteNavbarProps = {
  navItems: NavItem[];
  onOpenSettings: () => void;
};

export function SiteNavbar({ navItems, onOpenSettings }: SiteNavbarProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-paper/85 backdrop-blur-md dark:border-white/5 dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="#hero" className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="CLAP-S icon"
            width={40}
            height={40}
            priority
            className="h-10 w-10"
          />
          <div>
            <div className="text-sm font-semibold tracking-[0.16em] text-ink">CLAP-S</div>
            <div className="text-xs text-ink/55">{t("navbar.subtitle")}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-ink/72 xl:flex">
          {navItems.map((item) => (
            <Link key={item.id} href={`#${item.id}`} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-ink/12 bg-surface px-3 text-sm font-medium text-ink shadow-sm transition hover:bg-ink/5 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800"
            aria-label={t("settings.open")}
          >
            <SettingsIcon />
            <span className="hidden md:inline">{t("settings.open")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  const options: { code: Language; label: string }[] = [
    { code: "en", label: t("language.option.en") },
    { code: "zh", label: t("language.option.zh") }
  ];

  return (
    <label className="relative inline-flex items-center rounded-full border border-ink/10 bg-surface/90 px-3 py-1 text-xs text-ink shadow-sm dark:border-white/10 dark:bg-slate-900/50">
      <span className="sr-only">{t("navbar.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="appearance-none bg-transparent pr-5 text-xs font-semibold text-ink focus:outline-none dark:text-white"
        aria-label={t("navbar.language")}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code} className="bg-surface text-ink dark:bg-slate-900 dark:text-white">
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink/60 dark:text-white/70">
        ▼
      </span>
    </label>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.61 1.2 1.65 1.65 0 0 1-3.18 0A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.2-1.61 1.65 1.65 0 0 1 0-3.18A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.61-1.2 1.65 1.65 0 0 1 3.18 0A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.83 0 1.54.58 1.7 1.39a1.65 1.65 0 0 1 0 3.18A1.65 1.65 0 0 0 19.4 15z" />
    </svg>
  );
}
