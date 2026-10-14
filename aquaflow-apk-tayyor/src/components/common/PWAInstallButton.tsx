import React, { useState } from 'react';
import { Smartphone, Download, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { APKDownloadModal } from './APKDownloadModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // Header compact button
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border ${
            isInstalled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-transparent hover:from-sky-700 hover:to-blue-700 shadow-sky-200'
          } ${className}`}
          title="Telefonga APK yoki Ilova ko'rinishida o'rnatish"
        >
          {isInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ilova O'rnatilgan</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK / Ilova</span>
            </>
          )}
        </button>

        <APKDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Banner variant for inside CustomerPortal or DriverView
  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 rounded-2xl text-white shadow-md shadow-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                AquaFlow Android Ilovasini O'rnating (APK)
              </h4>
              <p className="text-xs text-sky-100">
                1 bosishda telefoningizga o'rnating, internet yo'q bo'lsa ham tezkor ishlaydi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isInstallable && (
              <button
                type="button"
                onClick={() => install()}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>O'rnatish</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold text-xs rounded-xl border border-white/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-4 h-4" />
              <span>APK & QR Kod</span>
            </button>
          </div>
        </div>

        <APKDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Default compact
  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors cursor-pointer ${className}`}
      >
        <Smartphone className="w-4 h-4 text-sky-600" />
        <span>APK O'rnatish</span>
      </button>

      <APKDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
