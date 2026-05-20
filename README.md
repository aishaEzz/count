# Coal ERP System

واجهة React + خادم Express بسيط لنظام إدارة المبيعات والمخزون.

## تشغيل المشروع

1. افتح الطرفية في مجلد المشروع.
2. ثبت الحزم:

```bash
npm install
```

3. شغّل خادم API:

```bash
npm run server
```

4. شغّل واجهة Vite في طرفية ثانية:

```bash
npm run dev
```

5. افتح المتصفح على:

- واجهة المستخدم: `http://localhost:5173`
- خادم API: `http://localhost:4000/api/*`

## ملاحظات

- البيانات تحفظ في `server/data.json`.
- يمكنك إضافة عملاء وأصناف وفواتير من الواجهة.

## نشر مجاني

هذا المشروع جاهز للنشر المجاني باستخدام GitHub + Vercel للواجهة وRender للخادم.

1. افتح حسابين مجانين:
   - https://github.com
   - https://vercel.com
   - https://render.com

2. ارفع المشروع إلى GitHub:
   - `git add .`
   - `git commit -m "Prepare for deployment"`
   - `git branch -M main`
   - `git remote add origin https://github.com/<your-user>/<repo>.git`
   - `git push -u origin main`

3. في Vercel: اربط المستودع وانشر الواجهة.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - أضف متغير بيئة `VITE_API_URL` بعد نشر الخادم على Render.

4. في Render: اربط المستودع وأنشئ Web Service.
   - Start Command: `npm start`
   - Render سيعمل خادم Express على HTTPS تلقائياً.

5. بعد نشر الخادم، حدّث `VITE_API_URL` في Vercel إلى رابط Render.
