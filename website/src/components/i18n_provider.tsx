"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh";

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const uiStrings = {
    en: {
        "nav.overview": "Overview",
        "nav.glossary": "Glossary",
        "nav.why": "Why It Matters",
        "nav.primer": "Primer",
        "nav.problem": "Problem",
        "nav.algorithm": "Algorithm",
        "nav.theory": "Theory",
        "nav.results": "Results",
        "nav.resources": "Resources",
        "nav.backToTop": "Back to top",
        "edition.en": "English edition",
        "edition.zh": "中文版",
        "footer.builtBy": "Built around the paper's fixed-budget duplex setting. Matching-based structural controllability, not dominating sets, FVS, deep learning, or reinforcement learning.",
        "footer.backToTop": "Back to top",
        "hero.tone.academic": "Academic",
        "hero.tone.explainer": "Explainer",
        "hero.tone.visual": "Visual",
        "app.tagline": "Duplex Control",
        "app.cite": "Cite & Explore",
        "app.repo": "GitHub Repository",
        "app.download": "Download PDF",
        "app.authors": "Authors",
        "app.navigation": "Navigation",
        "app.overall": "Overall: Performance mirrors exact ILP with polynomial time scaling.",
        "clap.title": "Animation D · CLAP execution trace on the paper's toy duplex",
        "clap.subtitle": "Step through the three shortest CLAPs reported in the case study and watch DD1, DD2, CDS, and CMS evolve.",
        "clap.layer": "Layer",
        "clap.legend": "Node Types Legend",
        "clap.activePath": "Active path",
        "clap.explains": "This frame explains",
        "clap.currentSets": "Current sets",
        "clap.relayRule": "Relay rule in view: nodes reached by a layer-1 segment must be in $CMS$ before the next layer-2 move, while nodes reached by a layer-2 segment must be in $CDS$ before the next layer-1 move.",
        "clap.delta": "Difference mass",
        "clap.unionSize": "Union driver set size",
        "clap.empty": "empty",
        "clap.deltaDecrease": "$\\Delta$ decreases by {delta}, $|U|$ decreases by 1",
    },
    zh: {
        "nav.overview": "概述",
        "nav.glossary": "术语表",
        "nav.why": "核心意义",
        "nav.primer": "入门指南",
        "nav.problem": "问题定义",
        "nav.algorithm": "算法实现",
        "nav.theory": "理论证明",
        "nav.results": "实验结果",
        "nav.resources": "资源下载",
        "nav.backToTop": "返回顶部",
        "edition.en": "English edition",
        "edition.zh": "中文版",
        "footer.builtBy": "基于论文的固定预算双层网络设定。采用基于匹配的结构可控性框架，而非支配集、FVS、深度学习或强化学习。",
        "footer.backToTop": "返回顶部",
        "hero.tone.academic": "学术版",
        "hero.tone.explainer": "解说版",
        "hero.tone.visual": "视觉版",
        "app.tagline": "双层网络控制",
        "app.cite": "引用与探索",
        "app.repo": "GitHub 仓库",
        "app.download": "下载 PDF",
        "app.authors": "作者",
        "app.navigation": "导航",
        "app.overall": "总体而言：性能与精确的 ILP 解一致，且具备多项式级时间扩展性。",
        "clap.title": "动画 D · 在论文示例双构网络上的 CLAP 执行追踪",
        "clap.subtitle": "分步查看案例研究中报告的三条最短 CLAP，观察 DD1, DD2, CDS, 和 CMS 的演变过程。",
        "clap.layer": "层",
        "clap.legend": "节点类型图例",
        "clap.activePath": "激活路径",
        "clap.explains": "本帧说明",
        "clap.currentSets": "当前集合",
        "clap.relayRule": "视口中的中继规则：由第 1 层到达的节点在下一次第 2 层移动前必须处于 $CMS$ 中；而由第 2 层到达的节点在下一次第 1 层移动前必须处于 $CDS$ 中。",
        "clap.delta": "差异质量",
        "clap.unionSize": "驱动节点并集大小",
        "clap.empty": "空",
        "clap.deltaDecrease": "$\\Delta$ 减少了 {delta}，$|U|$ 减少了 1",
    }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    // Load language from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "zh")) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
    };

    const t = (key: string, params?: Record<string, any>) => {
        let text = uiStrings[language][key as keyof typeof uiStrings["en"]] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}
