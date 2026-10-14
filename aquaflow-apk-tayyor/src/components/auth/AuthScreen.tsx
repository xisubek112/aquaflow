/**
 * Authentication Screen (Kirish va Ro'yxatdan O'tish)
 * Login with login/password for Admin, Operator, Driver, and Customer registration
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Droplets,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  MapPin,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Headphones,
  Truck,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton.js';

export const AuthScreen: React.FC = () => {
  const { loginWithCredentials, registerCustomer } = useAuth();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [identifier, setIdentifier] = useState('admin@aquaflow.uz');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form state
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '+998 ',
    email: '',
    password: '',
    confirmPassword: '',
    district: 'Yunusobod',
    addressLine: '',
    companyName: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setLoginError(res.error || 'Login yoki parol noto\'g\'ri');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill demo credentials
  const fillCredentials = (idVal: string, passVal: string) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setLoginError(null);
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Kiritilgan parollar bir-biriga mos kelmadi!');
      return;
    }
    if (regForm.password.length < 4) {
      setRegError('Parol kamida 4 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerCustomer({
        name: regForm.name,
        phone: regForm.phone,
        email: regForm.email,
        password: regForm.password,
        addressLine: regForm.addressLine,
        district: regForm.district,
        companyName: regForm.companyName,
      });

      if (!res.success) {
        setRegError(res.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    } catch (err: any) {
      setRegError(err.message || 'Xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 mb-3">
            <Droplets className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AquaFlow</h1>
          <p className="text-xs text-sky-200 mt-1">
            Suv Yetkazib Berish Boshqaruv Tizimi
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-sky-100/30 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setLoginError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'LOGIN'
                  ? 'bg-white text-sky-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tizimga Kirish
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setRegError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'REGISTER'
                  ? 'bg-white text-sky-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Yangi Mijoz Ro'yxatdan O'tishi
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {tab === 'LOGIN' ? (
              /* TAB 1: LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Role Switcher Chips */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Kirish uchun rolni tanlang (yoki o'z parolingizni yozing):
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => fillCredentials('admin@aquaflow.uz', 'admin123')}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        identifier.includes('admin')
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-purple-700'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials('operator@aquaflow.uz', 'operator123')}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        identifier.includes('operator')
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials('driver1@aquaflow.uz', 'driver123')}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        identifier.includes('driver')
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      Haydovchi
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials('ali@valiyev.uz', 'customer123')}
                      className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                        identifier.includes('ali') || identifier.includes('customer')
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-amber-700'
                      }`}
                    >
                      Mijoz
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Telefon raqam, Email yoki Login
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="admin@aquaflow.uz yoki +998 90..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Parol</label>
                    <span className="text-[11px] text-slate-400">Standart: admin123, driver123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Parolni kiriting..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Tizimga kirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Test Accounts for Instant Switching */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tezkor demo hisoblari (1-bosishda to'ldirish):
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillCredentials('admin@aquaflow.uz', 'admin123')}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        Admin
                      </div>
                      <div className="text-[10px] text-purple-700 truncate">Sardor Rahimov</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredentials('operator@aquaflow.uz', 'operator123')}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Headphones className="w-3.5 h-3.5 text-blue-600" />
                        Operator
                      </div>
                      <div className="text-[10px] text-blue-700 truncate">Nilufar Karimova</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredentials('driver1@aquaflow.uz', 'driver123')}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        Haydovchi
                      </div>
                      <div className="text-[10px] text-emerald-700 truncate">Jasurbek Toirov</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillCredentials('ali@valiyev.uz', 'customer123')}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                        Mijoz
                      </div>
                      <div className="text-[10px] text-amber-700 truncate">Ali Valiyev</div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB 2: CUSTOMER REGISTRATION */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ism va Familiya
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="Masalan: Sardor Aliyev"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefon raqami
                    </label>
                    <input
                      type="text"
                      value={regForm.phone}
                      onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tashkilot (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      value={regForm.companyName}
                      onChange={e => setRegForm({ ...regForm, companyName: e.target.value })}
                      placeholder="Kompaniya nomi"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tuman</label>
                    <select
                      value={regForm.district}
                      onChange={e => setRegForm({ ...regForm, district: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Yunusobod">Yunusobod</option>
                      <option value="Mirzo Ulug'bek">Mirzo Ulug'bek</option>
                      <option value="Chilonzor">Chilonzor</option>
                      <option value="Yashnobod">Yashnobod</option>
                      <option value="Shayxontohur">Shayxontohur</option>
                      <option value="Yakkasaroy">Yakkasaroy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Yetkazish manzili</label>
                    <input
                      type="text"
                      value={regForm.addressLine}
                      onChange={e => setRegForm({ ...regForm, addressLine: e.target.value })}
                      placeholder="11-mavze, 24-uy"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parol</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regForm.password}
                      onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Kamida 4 ta belgi"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parol tasdig'i</label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regForm.confirmPassword}
                      onChange={e => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      placeholder="Qayta kiriting"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Ro'yxatdan o'tish va Kirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mobile APK Install Prompt for New Visitors */}
        <div className="mt-4 flex justify-center">
          <PWAInstallButton variant="header" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 backdrop-blur-md px-4 py-2 text-xs" />
        </div>

        {/* Security badge footer */}
        <div className="text-center mt-4 text-[11px] text-slate-400">
          🔒 256-bit shifrlangan xavfsiz autentifikatsiya • AquaFlow Cloud
        </div>
      </div>
    </div>
  );
};
