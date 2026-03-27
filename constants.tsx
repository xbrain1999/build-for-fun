
import React from 'react';
import { EnergyLevel, DurationType, WeatherType, Language } from './types';
import { 
  Sun, CloudRain, Zap, Coffee, Battery
} from 'lucide-react';

export const TRANSLATIONS = {
  en: {
    appTitle: "Weekend Rescuer",
    appSubtitle: "Let's save your weekend.",
    locationLabel: "Where are you?",
    locationPlaceholder: "e.g. Brooklyn, NY",
    ageLabel: "Child's Age",
    ageNewborn: "Newborn",
    agePreTeen: "Pre-Teen",
    energyLabel: "Energy Level",
    weatherLabel: "Weather",
    durationLabel: "Duration",
    interestsLabel: "Interests (Max 2)",
    indoorOnlyLabel: "Indoor Activities Only",
    submitButton: "Rescue My Weekend",
    loading: "Thinking...",
    
    // Results
    resultTitle: "The Mission",
    resultSubtitle: "Operation: Happy Weekend",
    planNew: "Plan New Adventure",
    mainEvent: "Main Event",
    fuelUp: "Fuel Up",
    backupPlan: "Plan B (Backup)",
    proTip: "Pro Parent Tip",
    rerollButton: "Nah, try another",
    checkReviews: "View Location & Reviews",
    checkOpenStatus: "Tip: Please verify opening hours in the map app.",
    whyThisFits: "Why this fits:",
    
    // Energy Options
    energyLowTitle: "Chill Mode",
    energyLowDesc: "Low key, minimal effort",
    energyModTitle: "Moderate",
    energyModDesc: "Burn some energy",
    energyHighTitle: "High Energy",
    energyHighDesc: "Burn them out",
    
    weatherSunny: "Sunny",
    weatherRainy: "Rainy",
    
    durationHalf: "Half Day",
    durationFull: "Full Day",
  },
  zh: {
    appTitle: "周末拯救计划",
    appSubtitle: "拯救你的周末，从现在开始。",
    locationLabel: "坐标哪里？",
    locationPlaceholder: "例如：上海徐汇区",
    ageLabel: "吞金兽年龄",
    ageNewborn: "幼崽",
    agePreTeen: "神兽",
    energyLabel: "今日耗电需求",
    weatherLabel: "天气状况",
    durationLabel: "持续时间",
    interestsLabel: "兴趣偏好 (最多选2个)",
    indoorOnlyLabel: "仅限室内 (怕晒/雨天)",
    submitButton: "拯救我的周末",
    loading: "正在生成...",

    // Results
    resultTitle: "行动代号",
    resultSubtitle: "目标：带娃不废妈",
    planNew: "重新策划",
    mainEvent: "核心任务",
    fuelUp: "能量补给",
    backupPlan: "B计划 (以防万一)",
    proTip: "老母亲/父亲 锦囊",
    rerollButton: "不行，换一个",
    checkReviews: "查看具体位置 / 评分",
    checkOpenStatus: "Tip: 跳转地图后请确认营业状态",
    whyThisFits: "推荐理由：",

    // Energy Options
    energyLowTitle: "佛系躺平",
    energyLowDesc: "主打一个不累",
    energyModTitle: "正常遛娃",
    energyModDesc: "耗电量中等",
    energyHighTitle: "极限放电",
    energyHighDesc: "回家秒睡",

    weatherSunny: "晴天/户外",
    weatherRainy: "下雨/室内",

    durationHalf: "半天 (4h)",
    durationFull: "全天 (8h+)",
  }
};

// 5 Broad Categories
export const INTEREST_OPTIONS = [
  { value: "Nature & Parks", label: { en: "🌳 Nature & Parks", zh: "🌳 亲近自然 (吸氧)" } },
  { value: "Indoor Play", label: { en: "🛝 Indoor Play", zh: "🛝 室内撒欢 (空调房)" } },
  { value: "Culture & Edu", label: { en: "🦕 Culture & Edu", zh: "🦕 看展涨知识 (博物馆)" } },
  { value: "Sports & Action", label: { en: "🧗 Sports & Action", zh: "🧗 运动放电 (长个子)" } },
  { value: "Relaxation & Food", label: { en: "☕️ Relaxing/Food", zh: "☕️ 休闲逛吃 (爸妈回血)" } },
];

export const getEnergyOptions = (lang: Language) => [
  { 
    value: EnergyLevel.LOW, 
    title: TRANSLATIONS[lang].energyLowTitle,
    desc: TRANSLATIONS[lang].energyLowDesc,
    icon: <Coffee className="w-5 h-5 mb-1" /> 
  },
  { 
    value: EnergyLevel.MODERATE, 
    title: TRANSLATIONS[lang].energyModTitle,
    desc: TRANSLATIONS[lang].energyModDesc,
    icon: <Battery className="w-5 h-5 mb-1" /> 
  },
  { 
    value: EnergyLevel.HIGH, 
    title: TRANSLATIONS[lang].energyHighTitle,
    desc: TRANSLATIONS[lang].energyHighDesc,
    icon: <Zap className="w-5 h-5 mb-1" /> 
  },
];

export const getWeatherOptions = (lang: Language) => [
  { value: WeatherType.SUNNY, label: TRANSLATIONS[lang].weatherSunny, icon: <Sun className="w-4 h-4" /> },
  { value: WeatherType.RAINY, label: TRANSLATIONS[lang].weatherRainy, icon: <CloudRain className="w-4 h-4" /> },
];

export const getDurationOptions = (lang: Language) => [
  { value: DurationType.HALF_DAY, label: TRANSLATIONS[lang].durationHalf },
  { value: DurationType.FULL_DAY, label: TRANSLATIONS[lang].durationFull },
];
