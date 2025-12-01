import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Download, RefreshCw, X, Pencil, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { generateClaymationImage } from './services/geminiService';
import { AppStep, Language } from './types';

const translations = {
  en: {
    title: "Wow! Claymation Maker Demo",
    subtitle: "Turn your photos into whimsical plasticine art instantly.",
    uploadTitle: "Upload a Photo",
    uploadDesc: "Click to select or drag and drop an image here.",
    back: "Back",
    clayify: "Clay-ify Now",
    sculpting: "Sculpting...",
    source: "Source",
    result: "Result",
    startOver: "Start Over",
    refine: "View Source",
    retry: "Retry",
    download: "Download Art",
    copyright: "© 2025 WowGituYa Studio",
    powered: "Powered by Gemini 2.5 Flash",
    errorType: "Please upload a valid image file (JPEG, PNG, WEBP).",
    errorSize: "Image is too large. Please use an image under 5MB.",
    errorGen: "Failed to generate image. Please try again.",
    limitReached: "Daily limit reached (3/3). Please try the non-demo or pro version for better results.",
    dailyLimitLabel: "Daily Usage: "
  },
  id: {
    title: "Wow! Claymation Maker Demo",
    subtitle: "Ubah foto Anda menjadi seni plastisin yang unik secara instan.",
    uploadTitle: "Unggah Foto",
    uploadDesc: "Klik untuk memilih atau seret dan lepas gambar di sini.",
    back: "Kembali",
    clayify: "Ubah Sekarang",
    sculpting: "Memahat...",
    source: "Asli",
    result: "Hasil",
    startOver: "Mulai Ulang",
    refine: "Lihat Asli",
    retry: "Coba Lagi",
    download: "Unduh",
    copyright: "© 2025 WowGituYa Studio",
    powered: "Ditenagai oleh Gemini 2.5 Flash",
    errorType: "Mohon unggah file gambar yang valid (JPEG, PNG, WEBP).",
    errorSize: "Gambar terlalu besar. Mohon gunakan gambar di bawah 5MB.",
    errorGen: "Gagal membuat gambar. Silakan coba lagi.",
    limitReached: "Percobaan dibatasi 3 kali perhari. Silakan mencoba versi non-demo atau pro untuk hasil yang lebih memuaskan.",
    dailyLimitLabel: "Penggunaan Harian: "
  }
};

const STORAGE_KEY = 'wcm_demo_usage';
const MAX_DAILY_ATTEMPTS = 3;

const App: React.FC = () => {
  // App state
  const [language, setLanguage] = useState<Language>('en');
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  
  // sourceImage is the original upload
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Initialize usage count on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const storage = localStorage.getItem(STORAGE_KEY);
    if (storage) {
      const parsed = JSON.parse(storage);
      if (parsed.date === today) {
        setDailyUsage(parsed.count);
      } else {
        setDailyUsage(0);
      }
    }
  }, []);

  const processFile = (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError(t.errorType);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t.errorSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSourceImage(result);
      setSourceMimeType(file.type);
      setStep(AppStep.EDIT);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const checkAndIncrementLimit = (): boolean => {
    const today = new Date().toDateString();
    const storage = localStorage.getItem(STORAGE_KEY);
    
    let usage = { date: today, count: 0 };
    
    if (storage) {
      const parsed = JSON.parse(storage);
      // If date matches, use existing count, otherwise reset to 0 (new day)
      if (parsed.date === today) {
        usage = parsed;
      }
    }

    if (usage.count >= MAX_DAILY_ATTEMPTS) {
      setDailyUsage(usage.count); // Ensure state matches storage
      return false;
    }

    // Increment and save
    usage.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    setDailyUsage(usage.count);
    return true;
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;

    setError(null);

    // Check limit
    const canProceed = checkAndIncrementLimit();
    if (!canProceed) {
      setError(t.limitReached);
      return;
    }

    setIsProcessing(true);

    try {
      // Use fixed intensity of 50 for the balanced "Classic Stop-Motion" look
      const result = await generateClaymationImage(sourceImage, sourceMimeType, 50);
      setGeneratedImage(result);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message || t.errorGen);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefine = () => {
    setGeneratedImage(null);
    setStep(AppStep.EDIT);
  };

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setError(null);
    setStep(AppStep.UPLOAD);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `claymation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12 px-4 flex flex-col items-center">
      <Header 
        language={language} 
        setLanguage={setLanguage}
        title={t.title}
        subtitle={t.subtitle}
      />

      <main className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-clay-200 overflow-hidden p-6 md:p-10 relative mt-4">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <X className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === AppStep.UPLOAD && (
          <div 
            className={`flex flex-col items-center justify-center py-12 border-4 border-dashed rounded-2xl transition-all duration-200 bg-clay-50 group cursor-pointer ${
              isDragging 
                ? 'border-clay-600 bg-clay-100 scale-[1.02]' 
                : 'border-clay-200 hover:border-clay-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <div className={`bg-white p-4 rounded-full shadow-md mb-4 transition-transform duration-200 ${isDragging ? 'scale-125' : 'group-hover:scale-110'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-clay-800' : 'text-clay-600'}`} />
            </div>
            <h3 className="text-xl font-bold text-clay-800 mb-2">{t.uploadTitle}</h3>
            <p className="text-clay-500 text-center max-w-xs">
              {t.uploadDesc}
            </p>
          </div>
        )}

        {/* Step 2: Preview & Actions */}
        {step === AppStep.EDIT && sourceImage && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Image Display */}
            <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-clay-100 bg-gray-100 mb-8 group">
              <img 
                src={sourceImage} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Main Actions */}
            <div className="flex gap-4 w-full justify-center">
              <Button 
                variant="secondary" 
                onClick={handleReset}
                disabled={isProcessing}
              >
                {t.back}
              </Button>
              <Button 
                onClick={handleGenerate} 
                isLoading={isProcessing}
                loadingText={t.sculpting}
                icon={<Sparkles className="w-5 h-5" />}
              >
                {t.clayify}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === AppStep.RESULT && generatedImage && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
              {/* Source (Smaller preview) */}
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 opacity-80 hover:opacity-100 transition-opacity">
                  <img 
                  src={sourceImage!} 
                  alt="Source" 
                  className="w-full h-full object-cover"
                />
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                  {t.source}
                </div>
              </div>

              {/* Result (Main focus) */}
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-xl border-4 border-clay-400 bg-gray-100 group">
                <img 
                  src={generatedImage} 
                  alt="Claymation" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-clay-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t.result}
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-center">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                dailyUsage >= MAX_DAILY_ATTEMPTS 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-clay-100 text-clay-700'
              }`}>
                {t.dailyLimitLabel} {dailyUsage}/{MAX_DAILY_ATTEMPTS}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 w-full justify-center">
              <Button 
                variant="secondary" 
                onClick={handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
                disabled={isProcessing}
              >
                {t.startOver}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleRefine}
                icon={<Pencil className="w-4 h-4" />}
                disabled={isProcessing}
              >
                {t.refine}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleGenerate} 
                isLoading={isProcessing}
                loadingText={t.sculpting}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                {t.retry}
              </Button>
              <Button 
                onClick={handleDownload} 
                icon={<Download className="w-5 h-5" />}
                disabled={isProcessing}
              >
                {t.download}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center">
        <p className="text-clay-700 font-bold mb-1">{t.copyright}</p>
        <p className="text-clay-500 text-sm font-medium">{t.powered}</p>
      </footer>
    </div>
  );
};

export default App;