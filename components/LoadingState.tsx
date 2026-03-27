import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Language } from '../types';

const LOADING_MESSAGES = {
  en: [
    "Scanning for fun...",
    "Checking parent stress levels...",
    "Locating coffee shops nearby...",
    "Avoiding potential meltdowns...",
    "Calculating nap times...",
    "Optimizing for maximum smiles..."
  ],
  zh: [
    "正在检索不废妈的方案...",
    "正在计算神兽放电量...",
    "寻找最近的续命咖啡...",
    "正在规避崩溃风险...",
    "优化午睡时间...",
    "为了家庭和睦全力计算中..."
  ]
};

interface LoadingStateProps {
  language: Language;
}

const LoadingState: React.FC<LoadingStateProps> = ({ language }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = LOADING_MESSAGES[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-full shadow-lg border-2 border-rose-100">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-700">
          {language === 'en' ? "Generating Plan" : "正在生成计划"}
        </h3>
        <p className="text-slate-500 min-w-[250px] transition-all duration-300">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingState;