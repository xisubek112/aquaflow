import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  WifiOff,
  Layers,
  HelpCircle,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'INSTALL' | 'GUIDE' | 'STANDALONE_APK'>('INSTALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);

      // Generate QR Code for scanning with Android phone
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0369a1',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => setQrCodeDataUrl(dataUrl))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setDownloadSuccess("AquaFlow ilovasi telefoningizga muvaffaqiyatli o'rnatildi!");
      }
    }
  };

  const handleDownloadAndroidBundle = () => {
    // Generate an Android Manifest & TWA project configuration file for building standalone APK
    const manifestContent = {
      package_name: 'uz.aquaflow.delivery',
      app_name: 'AquaFlow Suv Yetkazib Berish',
      version: '1.2.0',
      version_code: 120,
      host_url: currentUrl,
      start_url: '/',
      theme_color: '#0284c7',
      background_color: '#0284c7',
      display: 'standalone',
      orientation: 'portrait',
      android_manifest_xml: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="uz.aquaflow.delivery">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AquaFlow"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar">
        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
      build_commands: {
        bubblewrap_cli: "npx @bubblewrap/cli init --manifest=" + currentUrl + "manifest.json && npx @bubblewrap/cli build",
        pwabuilder: "https://www.pwabuilder.com/?url=" + encodeURIComponent(currentUrl),
      },
      instructions: "Ushbu konfiguratsiya fayli orqali Google Bubblewrap yoki PWABuilder yordamida imzolangan .APK yoki .AAB (Google Play) fayl yaratishingiz mumkin."
    };

    const blob = new Blob([JSON.stringify(manifestContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aquaflow-android-apk-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess("Android APK konfiguratsiya paketi (aquaflow-android-apk-config.json) yuklab olindi!");
  };

  const pwabuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with AquaFlow branding */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Android APK & Mobil Ilova</h2>
                <span className="bg-emerald-400 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full uppercase">
                  v1.2.0 APK
                </span>
              </div>
              <p className="text-xs text-sky-100 mt-0.5">
                Telefoningizga 1 bosishda o'rnating yoki APK faylini oling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('INSTALL')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'INSTALL'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-600" />
            <span>1-Klikda O'rnatish (WebAPK)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STANDALONE_APK')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'STANDALONE_APK'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Tayyor .APK Yasash & Fayl</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GUIDE')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Oson Yo'riqnoma</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {downloadSuccess && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-medium animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="flex-1">{downloadSuccess}</span>
            <button
              onClick={() => setDownloadSuccess(null)}
              className="text-emerald-700 font-bold hover:underline"
            >
              OK
            </button>
          </div>
        )}

        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-6">

          {/* TAB 1: 1-KLIKDA O'RNATISH (WEBAPK / NATIVE ANDROID) */}
          {activeTab === 'INSTALL' && (
            <div className="space-y-6">
              {/* Status Banner */}
              {isInstalled ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Ilova allaqachon o'rnatilgan!</h4>
                    <p className="text-xs text-emerald-700">
                      AquaFlow telefoningizda mustaqil Android ilova sifatida ishlayapti.
                    </p>
                  </div>
                </div>
              ) : isInstallable ? (
                <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-200">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Android Telefonga O'rnatishga Tayyor!
                      </h4>
                      <p className="text-xs text-slate-600">
                        1 bosishda telefon xotirasiga WebAPK sifatida o'rnatiladi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>Hozir O'rnatish</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sky-900">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>Android tizimida to'g'ridan-to'g'ri o'rnatish (WebAPK)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Android telefoningizda Chrome brauzerida ushbu sahifani ochganingizda, pastda
                    avtomatik <strong>"AquaFlow ilovasini o'rnatish"</strong> taklifi chiqadi yoki brauzer
                    menyu tugmasi (⋮) orqali <strong>"Ilovani o'rnatish"</strong> ni tanlashingiz mumkin.
                    Android uni avtomatik ravishda rasmiy <strong>APK</strong> qilib o'rnatadi!
                  </p>
                </div>
              )}

              {/* QR Code Section for easy phone access */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 shrink-0">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="AquaFlow QR Code"
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                      QR Kod yuklanmoqda...
                    </div>
                  )}
                  <p className="text-[11px] text-center font-bold text-sky-700 mt-2">
                    Kamera bilan skaner qiling
                  </p>
                </div>

                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Telefonga 30 soniyada yuklash
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Telefoningiz kamerasini QR-kodga qarating
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Telefoningizda havola ochiladi va darhol <strong>APK ilova</strong> sifatida bosh ekranga o'rnatiladi. Hech qanday murakkab sozlamalarsiz!
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      <span>{copied ? 'Havola nusxalandi!' : 'Havolani nusxalash'}</span>
                    </button>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Yangi oynada ochish</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Key Features for Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Oflayn Rejim</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Internet o'chganda ham ochiladi</p>
                </div>
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Xavfsiz WebAPK</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google himoyalangan formatda</p>
                </div>
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">Katta Shrift Rejimi</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">Katta yoshdagilarga juda qulay</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE .APK FAYL YARATISH (PWABUILDER / BUBBLEWRAP) */}
          {activeTab === 'STANDALONE_APK' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                    Standart .APK Fayl Yaratish (Google & Microsoft PWABuilder)
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  AquaFlow to'liq PWA va WebAPK standartlariga ega. PWABuilder yoki Bubblewrap yordamida
                  to'g'ridan-to'g'ri <strong>.apk</strong> yoki Google Play uchun <strong>.aab</strong> faylini
                  30 soniyada yuklab olishingiz mumkin.
                </p>
              </div>

              {/* Action 1: 1-Click PWABuilder APK Generator */}
              <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
                      Eng Oson Usul (Tavsiya etiladi)
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      PWABuilder orqali 1-klikda APK yuklab olish
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Microsoft va Google rasmiy PWA-to-APK tizimi. Sizning AquaFlow havolangiz avtomatik kiritilgan.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>

                <a
                  href={pwabuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-200 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>PWABuilder-da APK Yasash va Yuklab Olish</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              {/* Action 2: Download Android Project Config Bundle */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                      Dasturchilar & Android Studio uchun
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Android Manifest & Paket Konfiguratsiyasini Yuklab Olish
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <code>AndroidManifest.xml</code>, <code>build.gradle</code> va TWA Bubblewrap sozlamalari paketi.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAndroidBundle}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Paketni Yuklab Olish (aquaflow-android-apk-config.json)</span>
                </button>
              </div>

              {/* Technical Details Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <h5 className="font-bold text-slate-800">APK Texnik Ma'lumotlari:</h5>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono">
                  <div>Paket nomi: <strong className="text-slate-900">uz.aquaflow.delivery</strong></div>
                  <div>Versiya: <strong className="text-slate-900">1.2.0 (Build 120)</strong></div>
                  <div>Min Android: <strong className="text-slate-900">Android 5.0+ (Lollipop)</strong></div>
                  <div>Target Android: <strong className="text-slate-900">Android 14 (API 34)</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OSON YO'RIQNOMA (KATTA VA YOSH ODAMLAR UCHUN) */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-5">
              <div className="text-center max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  Katta yoshdagilar va barcha uchun oson
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Telefonda ilovani o'rnatishning 3 ta oddiy qadami
                </h3>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 bg-white border border-sky-100 rounded-2xl shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-sky-200">
                    1
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Telefoningizda oching
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      QR-kodni telefon kamerasi bilan skaner qiling yoki telefoningizdagi <strong>Google Chrome</strong> brauzeriga havolani kiriting.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-white border border-sky-100 rounded-2xl shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
                    2
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      "O'rnatish" tugmasini bosing
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ekranning pastida <strong>"AquaFlow dasturini telefoningizga o'rnatish"</strong> yozuvi chiqadi. Uni bosing. Yoki o'ng yuqoridagi 3 ta nuqta (⋮) belgisini bosib, <strong>"Ilovani o'rnatish"</strong> (yoki "Bosh ekranga qo'shish") ni bosing.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-white border border-sky-100 rounded-2xl shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Tayyor! Bosh ekrandan foydalaning
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Android tizimi ilovani telefoningizga to'liq o'rnatadi. Bosh ekranda AquaFlow tomchi logotipi paydo bo'ladi. Xuddi Play Market dasturlaridek tez va qulay ishlaydi!
                    </p>
                  </div>
                </div>
              </div>

              {/* iOS Guide if needed */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>iPhone (Apple) foydalanuvchilari uchun:</strong> Safari brauzerida pastdagi "Ulashish" (Share) belgisini bosing va "Bosh ekranga qo'shish" (Add to Home Screen) ni tanlang.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Xavfsiz va sertifikatlangan tizim</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
};
