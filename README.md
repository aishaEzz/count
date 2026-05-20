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
