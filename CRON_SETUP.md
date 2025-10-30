# Cron Job Setup Guide

## วิธีตั้งค่า Cron Job สำหรับแจ้งเตือนการส่งคืนยา

### 1. ติดตั้ง Dependencies

```bash
npm install resend
```

หรือถ้าติดตั้งแล้ว ไม่ต้องทำอะไร (โปรเจกต์มี Resend อยู่แล้ว)

### 2. ตั้งค่า Environment Variables

เพิ่มค่าเหล่านี้ในไฟล์ `.env`:

```env
CRON_SECRET="your-secret-key-change-this-in-production"
NEXT_PUBLIC_API_RESEND_API_KEY="re_xxxxxxxxxxxx"
NEXT_PUBLIC_API_RESEND_FROM_EMAIL="no-reply@bcmed.online"
```

### 3. รับ Resend API Key

1. ไปที่ https://resend.com/
2. สร้าง account หรือ login
3. สร้าง API Key ใหม่
4. Verify domain ของคุณ (เช่น bcmed.online)
5. นำ API Key มาใส่ใน `.env`

### 4. วิธีตั้งค่า Cron Job

#### A. ใช้ Vercel Cron (แนะนำถ้า deploy บน Vercel)

สร้างไฟล์ `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-return-reminder",
      "schedule": "0 6 * * *"
    }
  ]
}
```

#### B. ใช้ External Cron Service (เช่น cron-job.org)

1. ไปที่ https://cron-job.org หรือ https://easycron.com
2. สร้าง cron job ใหม่:
   - URL: `https://your-domain.com/api/cron/check-return-reminder`
   - Schedule: `0 6 * * *` (ทุกวัน 6 โมงเช้า)
   - Method: POST
   - Headers: `Authorization: Bearer your-secret-key`

#### C. ใช้ Linux Crontab (ถ้า deploy บน VPS/Server)

```bash
# เปิด crontab editor
crontab -e

# เพิ่มบรรทัดนี้ (ทุกวัน 6 โมงเช้า)
0 6 * * * curl -X POST https://your-domain.com/api/cron/check-return-reminder -H "Authorization: Bearer your-secret-key"
```

#### D. ใช้ GitHub Actions (ถ้าใช้ GitHub)

สร้างไฟล์ `.github/workflows/cron-check-return.yml`:

```yaml
name: Check Return Reminder

on:
  schedule:
    - cron: '0 23 * * *'  # 6:00 AM GMT+7 = 23:00 UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cron API
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/check-return-reminder \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 5. ทดสอบ Cron Job

```bash
# ทดสอบด้วย curl
curl -X POST http://localhost:3000/api/cron/check-return-reminder \
  -H "Authorization: Bearer your-secret-key"

# หรือใช้ Postman/Insomnia
```

### 6. Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── วันในสัปดาห์ (0-7, 0 และ 7 = อาทิตย์)
│ │ │ └───── เดือน (1-12)
│ │ └─────── วันที่ (1-31)
│ └───────── ชั่วโมง (0-23)
└─────────── นาที (0-59)
```

ตัวอย่าง:
- `0 6 * * *` - ทุกวันเวลา 6:00 น.
- `0 */6 * * *` - ทุก 6 ชั่วโมง
- `0 6,18 * * *` - เวลา 6:00 น. และ 18:00 น.
- `0 6 * * 1-5` - จันทร์-ศุกร์ เวลา 6:00 น.

### 7. Monitoring และ Logging

API จะบันทึก log ลงใน collection `email_logs` โดยอัตโนมัติ สามารถ query ดูได้:

```javascript
db.email_logs.find({ type: 'return_reminder' }).sort({ sentAt: -1 })
```

### 8. Security Best Practices

- เปลี่ยน `CRON_SECRET` ให้แตกต่างจาก JWT_SECRET
- ใช้ HTTPS สำหรับ production
- ตั้งค่า rate limiting ถ้าจำเป็น
- เก็บ Resend API Key ใน environment variables เท่านั้น
- ไม่ควร commit `.env` เข้า git

### 9. Troubleshooting

**ปัญหา: อีเมล์ไม่ออก**
- ตรวจสอบ Resend API Key ว่าถูกต้อง
- ตรวจสอบว่า domain ถูก verify แล้ว
- ตรวจสอบว่า email ของโรงพยาบาลมีในฐานข้อมูลหรือไม่
- ดู log ใน API response และ Resend dashboard

**ปัญหา: Cron ไม่ทำงาน**
- ตรวจสอบ timezone (UTC vs local time)
- ตรวจสอบ Authorization header
- ดู server logs

**ปัญหา: Performance ช้า**
- เพิ่ม index ใน MongoDB: `db.sharing.createIndex({ "responseDetails.0.status": 1 })`
- พิจารณาใช้ batch processing ถ้ามีข้อมูลเยอะ
