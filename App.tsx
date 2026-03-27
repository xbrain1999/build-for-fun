import React, { useState, useCallback } from 'react';
import InputForm from './components/InputForm';
import ItineraryResult from './components/ItineraryResult';
import LoadingState from './components/LoadingState';
import { generateItinerary } from './services/geminiService';
import { FormData, ItineraryResponse, Language } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectedPlaces, setRejectedPlaces] = useState<string[]>([]);

  const handleFormSubmit = useCallback(async (data: FormData) => {
    setLoading(true);
    setError(null);
    setFormData(data); // Save for rerolls
    try {
      const result = await generateItinerary(data, language, []);
      setItinerary(result);
    } catch (err) {
      console.error(err);
      setError("Oops! The AI got distracted by a butterfly. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleReroll = useCallback(async () => {
    if (!formData || !itinerary) return;

    setLoading(true);
    const newRejected = [...rejectedPlaces, itinerary.mainActivity.name];
    setRejectedPlaces(newRejected);

    try {
      const result = await generateItinerary(formData, language, newRejected);
      setItinerary(result);
    } catch (err) {
      console.error(err);
      setError("Could not find another plan. Maybe the first one was destiny?");
    } finally {
      setLoading(false);
    }
  }, [formData, itinerary, language, rejectedPlaces]);

  const handleReset = useCallback(() => {
    setItinerary(null);
    setError(null);
    setRejectedPlaces([]);
    // We don't clear formData so user doesn't have to re-type if they go back
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-xs font-bold underline hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Switching */}
        {loading ? (
          <LoadingState language={language} />
        ) : itinerary ? (
          <ItineraryResult 
            data={itinerary} 
            onReset={handleReset} 
            onReroll={handleReroll}
            language={language}
            isRerolling={loading}
          />
        ) : (
          <InputForm 
            onSubmit={handleFormSubmit} 
            isLoading={loading} 
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {/* Footer */}
        {!loading && (
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Powered by Gemini • {language === 'en' ? "Built for tired parents" : "为疲惫的父母而生"}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;