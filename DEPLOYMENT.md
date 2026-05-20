نشر مجاني (واجهة + خادم) - خطوات سريعة

الخطوات العامة (GitHub → Vercel + Render):

1. ارفع المشروع إلى GitHub
   - أنشئ مستودعًا جديدًا ثم:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/<your-user>/<repo>.git
     git push -u origin main
     ```

2. نشر الواجهة على Vercel (مجاني، يدعم React + Vite)
   - ادخل إلى https://vercel.com، اربط حساب GitHub، واختر المستودع.
   - إعدادات:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Add Environment Variable: `VITE_API_URL` = `https://your-backend-url`
   - نشر تلقائي عند كل دفع إلى الفرع `main`.

3. نشر الـ backend على Render (مجاني لخطط صغيرة) أو Railway
   - سجل في https://render.com، اختر "New Web Service" → Connect GitHub → اختر المستودع
   - Build Command: empty
   - Start Command: `npm start`
   - Environment: ضع أي متغيرات إن احتجت (PORT يضبط تلقائياً)
   - بعد النشر ستحصل على عنوان HTTPS للخادم.

4. اربط المتغير `VITE_API_URL` في Vercel إلى عنوان الخادم من Render.

بدائل سريعة ولا تتطلب GitHub:
- شارك محليًا باستخدام `ngrok` أو `localtunnel` (مؤقت):
  ```bash
  npm run server
  npx localtunnel --port 4000
  # أو
  npx ngrok http 4000
  ```

## نشر مجاني كامل

إعداد مشروع GitHub وإرسال الكود:
```bash
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin https://github.com/<your-user>/<repo>.git
git push -u origin main
```

بعد رفع الكود:
- في Vercel: أنشئ مشروعًا جديدًا من نفس المستودع.
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - أضف في Environment Variables: `VITE_API_URL` = `https://<render-service>.onrender.com`

- في Render: أنشئ Web Service من نفس المستودع.
  - Start Command: `npm start`
  - Render سيعطيك رابط HTTPS للخادم.

- بعد ذلك حدّث `VITE_API_URL` في Vercel إلى رابط Render النهائي.

ملاحظات أمان:
- لا تضف بيانات حساسة إلى الكود. استخدم متغيرات البيئة.
- فعل CORS حسب نطاق الواجهة إذا أردت تقييد الوصول.
