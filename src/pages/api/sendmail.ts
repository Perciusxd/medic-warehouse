import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailTemplate } from '../../components/ui/email/template';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_API_RESEND_API_KEY);
const fromEmail = process.env.NEXT_PUBLIC_API_RESEND_FROM_EMAIL!.toString();

const sendMailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev", // ใช้ sender ของ Resend
    to: ["pupzaporjict@gmail.com"], // ✅ ต้องใส่ email ตัวเองตามที่ Resend บอก
    subject: "Hello Resend",
    html: `
    <div>
      <h1>ยินดีต้อนรับ!</h1>
      <p>กดที่ลิ้งค์นี้เพื่อลงทะเบียนเข้าใช้:</p>
      <a href="http://localhost:3000/register" target="_blank" style="color:blue;">เข้าสู่เว็บไซต์</a>
    </div>
    `
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json(data);
};

export default sendMailHandler;