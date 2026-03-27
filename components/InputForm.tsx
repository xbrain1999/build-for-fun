import React, { useState } from 'react';
import { FormData, EnergyLevel, WeatherType, DurationType, Language } from '../types';
import { getEnergyOptions, getWeatherOptions, getDurationOptions, INTEREST_OPTIONS, TRANSLATIONS } from '../constants';
import { MapPin, Baby, Compass, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, language, onLanguageChange }) => {
  const t = TRANSLATIONS[language];
  const [formData, setFormData] = useState<FormData>({
    childAge: 5,
    energyLevel: EnergyLevel.MODERATE,
    location: '',
    weather: WeatherType.SUNNY,
    duration: DurationType.HALF_DAY,
    interests: [],
    indoorOnly: false
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      }
      if (prev.interests.length >= 2) {
        return prev; // Max 2 constraint
      }
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const energyOptions = getEnergyOptions(language);
  const weatherOptions = getWeatherOptions(language);
  const durationOptions = getDurationOptions(language);

  // Custom Shapes for Duration
  const HalfDayIcon = () => (
    <div className="w-6 h-6 rounded-full border-2 border-current relative overflow-hidden">
      <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-current"></div>
    </div>
  );
  
  const FullDayIcon = () => (
    <div className="w-6 h-6 rounded-full bg-current"></div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      
      {/* Language Toggle */}
      <div className="absolute -top-2 right-0">
        <button
          type="button"
          onClick={() => onLanguageChange(language === 'en' ? 'zh' : 'en')}
          className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
        >
          <Globe className="w-3 h-3" />
          <span>{language === 'en' ? 'EN' : '中'}</span>
        </button>
      </div>

      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t.appTitle}</h1>
        <p className="text-slate-500 text-sm">{t.appSubtitle}</p>
      </div>

      <div className="space-y-6">
        
        {/* Location Input */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-slate-700">
            <MapPin className="w-4 h-4 mr-2 text-rose-500" />
            {t.locationLabel}
          </label>
          <input 
            required
            type="text" 
            placeholder={t.locationPlaceholder}
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        {/* Age Slider */}
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center">
            <label className="flex items-center text-sm font-bold text-slate-700">
              <Baby className="w-4 h-4 mr-2 text-sky-500" />
              {t.ageLabel}
            </label>
            <span className="text-2xl font-black text-sky-600">{formData.childAge} <span className="text-sm font-medium text-slate-400">years</span></span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="12" 
            value={formData.childAge}
            onChange={(e) => setFormData({...formData, childAge: parseInt(e.target.value)})}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
            <span>{t.ageNewborn}</span>
            <span>{t.agePreTeen}</span>
          </div>
        </div>

        {/* Energy Level Select - Vertical Stacked Text */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-slate-700">
            {t.energyLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {energyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({...formData, energyLevel: opt.value})}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  formData.energyLevel === opt.value
                    ? 'bg-amber-50 border-amber-300 text-amber-700 ring-1 ring-amber-300 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className={`${formData.energyLevel === opt.value ? 'text-amber-500' : 'text-slate-300'} mb-1`}>
                  {opt.icon}
                </div>
                <span className="text-sm font-bold leading-tight w-full truncate">{opt.title}</span>
                <span className="text-[10px] opacity-80 font-normal leading-tight mt-0.5 w-full truncate">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Cards (Half/Full) - Visual 2 Col */}
        <div className="space-y-3">
          <span className="text-sm font-bold text-slate-700 block">{t.durationLabel}</span>
          <div className="grid grid-cols-2 gap-4">
            {durationOptions.map((opt) => {
              const isSelected = formData.duration === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({...formData, duration: opt.value})}
                  className={`flex flex-col items-center justify-center py-5 px-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md ring-1 ring-indigo-200'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <div className={`mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {opt.value === DurationType.HALF_DAY ? <HalfDayIcon /> : <FullDayIcon />}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weather & Indoor Toggle Row */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <span className="text-sm font-bold text-slate-700">{t.weatherLabel}</span>
          </div>
          
          <div className="flex gap-4">
            {/* Weather Toggle */}
            <div className="flex-1 flex bg-slate-100 p-1 rounded-lg">
              {weatherOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({...formData, weather: opt.value})}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all ${
                    formData.weather === opt.value
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="mr-1.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Indoor Only Switch */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, indoorOnly: !prev.indoorOnly }))}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                formData.indoorOnly
                  ? 'bg-sky-50 border-sky-300 text-sky-700'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                 {formData.indoorOnly ? <ToggleRight className="w-5 h-5 text-sky-500" /> : <ToggleLeft className="w-5 h-5" />}
                 <span className="text-xs font-bold">{t.indoorOnlyLabel}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-slate-700">
            <Compass className="w-4 h-4 mr-2 text-indigo-500" />
            {t.interestsLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((item) => {
              const isSelected = formData.interests.includes(item.value);
              const isMaxReached = formData.interests.length >= 2;
              const isDisabled = !isSelected && isMaxReached;

              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleInterest(item.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-indigo-100 border-indigo-200 text-indigo-700 shadow-sm scale-[1.02]'
                      : isDisabled
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {item.label[language]}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.location}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center"
      >
        {isLoading ? t.loading : t.submitButton}
      </button>

    </form>
  );
};

export default InputForm;