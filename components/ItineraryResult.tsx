
import React from 'react';
import { ItineraryResponse, Language } from '../types';
import { MapPin, Utensils, Umbrella, Lightbulb, Clock, ArrowLeft, Heart, RefreshCw, Navigation, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ItineraryResultProps {
  data: ItineraryResponse;
  onReset: () => void;
  onReroll: () => void;
  language: Language;
  isRerolling: boolean;
}

const ItineraryResult: React.FC<ItineraryResultProps> = ({ data, onReset, onReroll, language, isRerolling }) => {
  const t = TRANSLATIONS[language];

  const getMapLink = (query: string) => {
    // Basic detection for Chinese characters to prefer Amap, otherwise Google Maps
    const hasChinese = /[\u4e00-\u9fa5]/.test(query);
    if (language === 'zh' || hasChinese) {
       return `https://www.amap.com/search?query=${encodeURIComponent(query)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <button 
        onClick={onReset}
        className="flex items-center text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t.planNew}
      </button>

      <div className="text-center space-y-1">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t.resultTitle}</h2>
        <p className="text-rose-500 font-medium">{t.resultSubtitle}</p>
      </div>

      <div className="space-y-6">
        
        {/* Main Activity Card */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
          
          <div className="relative pl-10 space-y-6">
            
            {/* Timeline Item 1: Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md hover:border-sky-200">
              <div className="absolute -left-[45px] top-6 bg-sky-100 text-sky-600 p-2 rounded-full border-4 border-slate-50 z-10">
                <MapPin className="w-5 h-5" />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {data.mainActivity.time}
                </span>
                <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                  {t.mainEvent}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{data.mainActivity.name}</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {data.mainActivity.description}
              </p>
              
              {/* Trust Layer: Match Reason */}
              <div className="flex items-start bg-sky-50 p-3 rounded-xl mb-4 border border-sky-100">
                <Sparkles className="w-4 h-4 text-sky-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-sky-700 uppercase mb-0.5">{t.whyThisFits}</span>
                  <span className="text-xs text-sky-800 leading-snug">
                    {data.mainActivity.matchReason}
                  </span>
                </div>
              </div>

              {/* Navigation Button */}
              <div className="space-y-2">
                <a 
                  href={getMapLink(data.mainActivity.locationName)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-sky-600 text-white font-bold text-sm rounded-xl hover:bg-sky-700 transition-colors shadow-sm shadow-sky-200"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t.checkReviews}</span>
                </a>
                <p className="text-[10px] text-center text-slate-400">
                  {t.checkOpenStatus}
                </p>
              </div>
            </div>

            {/* Timeline Item 2: Dining */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md hover:border-amber-200">
              <div className="absolute -left-[45px] top-6 bg-amber-100 text-amber-600 p-2 rounded-full border-4 border-slate-50 z-10">
                <Utensils className="w-5 h-5" />
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {data.dining.time}
                </span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  {t.fuelUp}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{data.dining.name}</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                {data.dining.description}
              </p>
              
              <div className="flex items-start bg-amber-50 p-3 rounded-xl mb-4 border border-amber-100">
                <Heart className="w-4 h-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-xs text-amber-800 font-medium leading-snug">
                  {data.dining.matchReason}
                </span>
              </div>

               {/* Navigation Button */}
              <div className="space-y-2">
                <a 
                  href={getMapLink(data.dining.locationName)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 transition-colors shadow-sm shadow-amber-200"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t.checkReviews}</span>
                </a>
                <p className="text-[10px] text-center text-slate-400">
                  {t.checkOpenStatus}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Extras Grid */}
        <div className="grid grid-cols-1 gap-4 mt-6">
          
          {/* Pro Tip - High Value */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center mb-3">
              <div className="bg-white p-1.5 rounded-lg mr-3 shadow-sm text-rose-500">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-rose-700">{t.proTip}</h4>
            </div>
            <p className="text-rose-900 text-sm italic leading-relaxed">
              "{data.proTip}"
            </p>
          </div>

          {/* Backup Plan */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors">
            <div className="flex items-center mb-3">
              <div className="bg-slate-200 p-1.5 rounded-lg mr-3">
                <Umbrella className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="font-bold text-slate-700">{t.backupPlan}</h4>
            </div>
            <h5 className="font-semibold text-slate-800 text-sm mb-1">{data.backupPlan.name}</h5>
            <p className="text-slate-500 text-xs">{data.backupPlan.description}</p>
          </div>

          {/* Reroll Button */}
          <button 
            onClick={onReroll}
            disabled={isRerolling}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRerolling ? 'animate-spin' : ''}`} />
            <span>{isRerolling ? t.loading : t.rerollButton}</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default ItineraryResult;
