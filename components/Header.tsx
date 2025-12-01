import React from 'react';
import { Palette } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage, title, subtitle }) => {
  return (
    <header className="w-full py-6 flex flex-col items-center justify-center text-center relative">
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white p-1 rounded-lg border border-clay-200 shadow-sm">
         <button
           onClick={() => setLanguage('en')}
           className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'en' ? 'bg-clay-600 text-white' : 'text-clay-600 hover:bg-clay-100'}`}
         >
           EN
         </button>
         <button
           onClick={() => setLanguage('id')}
           className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${language === 'id' ? 'bg-clay-600 text-white' : 'text-clay-600 hover:bg-clay-100'}`}
         >
           ID
         </button>
      </div>

      <div className="bg-clay-100 p-4 rounded-full mb-3 shadow-inner">
        <Palette className="w-10 h-10 text-clay-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-clay-900 tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-clay-700 max-w-md mx-auto px-4">
        {subtitle}
      </p>
    </header>
  );
};