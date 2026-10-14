# AquaFlow: APK qilish (3 qadam, Android Studio shart emas)

APK bulutda (GitHub Actions) avtomatik yig'iladi.

## 1. Backendni Render.com ga joylash
1. Loyihani GitHub'ga yuklang (yangi private repo, `main` branch).
2. render.com -> New -> Blueprint -> repongizni tanlang. `render.yaml` hammasini o'zi sozlaydi.
3. Deploy tugagach manzil chiqadi, masalan `https://aquaflow-api.onrender.com`.
   Tekshirish: brauzerda `.../health` oching, `healthy` chiqishi kerak.

## 2. API manzilini GitHub'ga kiritish
GitHub repo -> Settings -> Secrets and variables -> Actions -> **Variables** -> New repository variable:
- Name: `API_URL`
- Value: `https://aquaflow-api.onrender.com/api`  (oxirida `/api` bo'lsin)

## 3. APK ni olish
GitHub repo -> Actions -> "Build Android APK" -> Run workflow.
5-10 daqiqadan keyin tayyor bo'lgan run ichidagi **Artifacts -> AquaFlow-apk** ni yuklab oling,
zip ichidan `app-debug.apk` chiqadi. Telefonga o'tkazib o'rnating
(Sozlamalar'da "noma'lum manbalardan o'rnatish"ga ruxsat bering).

## Muhim eslatmalar
- Render bepul tarifida server 15 daqiqa ishlatilmasa uxlaydi, birinchi so'rov ~1 daqiqa kutadi.
- `server/db.ts` ma'lumotni faqat xotirada saqlaydi: server qayta ishga tushsa, hammasi o'chadi.
  Haqiqiy ishlatishdan oldin PostgreSQL kabi bazaga o'tish kerak.
- Bu "debug" APK: sinov uchun. Play Market uchun imzolangan (signed) `.aab` kerak bo'ladi.
- Kodni o'zgartirsangiz, `main` ga push qiling va workflow'ni qayta ishga tushiring.

## O'zgartirilgan fayllar
- `src/services/api.ts`: API manzili `VITE_API_URL` dan olinadi
- `server.ts`: CORS qo'shildi
- `package.json`: Capacitor qo'shildi, esbuild versiyasi tuzatildi (npm install xatosi bor edi)
- Yangi: `capacitor.config.ts`, `render.yaml`, `.github/workflows/build-apk.yml`, `assets/`, `.npmrc`
