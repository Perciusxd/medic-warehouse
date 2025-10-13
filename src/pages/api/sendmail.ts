import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailTemplate } from '../../components/ui/email/template';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_API_RESEND_API_KEY);
const fromEmail = process.env.NEXT_PUBLIC_API_RESEND_FROM_EMAIL!.toString();

const sendMailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // รับข้อมูลจากภายนอก (req.body)
  // คาดว่า body จะมี: to, subject, hospitalName, registerUrl
  const {requestData, selectedHospitals, shareData} = req.body ?? {};
  // console.log('req',requestData);
  // console.log('hos',selectedHospitals);
  // console.log('sha',shareData);
  


  if ((!requestData && !shareData) || !selectedHospitals) {
    return res.status(400).json({
      error: 'Missing required fields. Required: to, hospitalName, registerUrl',
    });
  }

  const sender = 'no-reply@bcmed.online';
  const to = 'lscinnopsu@gmail.com'
  // const to = 'pupzaporjict@gmail.com'
  let subjectNotice;
  let notice;
  let hospitalName
  let medName
  let medAmount
  let medQuantity
  let medUnit
  let urgent
  if (requestData && !shareData) {
    subjectNotice = `[ระบบแจ้งเตือนอัตโนมัติ] แจ้งเวชภัณฑ์ยาขาดแคลน`;
    notice = 'เวชภัณฑ์ยาขาดแคลน';
    hospitalName = selectedHospitals.nameTH;
    medName = requestData.requestMedicine.name;
    medAmount = requestData.requestMedicine.requestAmount;
    medQuantity = requestData.requestMedicine.quantity;
    medUnit = requestData.requestMedicine.unit;
    urgent = requestData.urgent;
  } else {
    subjectNotice = `[ระบบแจ้งเตือนอัตโนมัติ] แจ้งแบ่งปันเวชภัณฑ์ยา`
    notice = 'เวชภัณฑ์ยาที่ต้องการแบ่งปัน'
    hospitalName = selectedHospitals.nameTH;
    medName = shareData.sharingMedicine.name;
    medAmount = shareData.sharingMedicine.sharingAmount;
    medQuantity = shareData.sharingMedicine.quantity;
    medUnit = shareData.sharingMedicine.unit;
  }

  // console.log(sender, to, subjectNotice, notice, hospitalName, medName, medAmount, medQuantity, medUnit);
  

  // try {
  //   const { data, error } = await resend.emails.send({
  //     from: sender,
  //     to: to,
  //     subject: subjectNotice,
  //     html: `
  //       <div>
  //         <p>เรียน${String(hospitalName)}</p>
  //         <p>${String(hospitalName)} มีการแจ้งรายการ${String(notice)}มายังท่าน ${shareData ? '' : `(${urgent === 'urgent' ? 'ด่วนที่สุด' : urgent === 'immediate' ? 'ด่วน' : 'ปกติ'})`}</p>
  //         <p>รายการ ${medName} ${medQuantity} จำนวน ${medAmount} ${medUnit} </p>

  //         <p>ท่านสามารถตรวจสอบรายละเอียดได้จากระบบ Medicine sharing</p>
  //       </div>
  //     `,
  //   });

  //   if (error) return res.status(400).json(error);
  //   return res.status(200).json(data);
  // } catch (err) {
  //   console.error(err);
  //   return res.status(500).json({ error: 'Failed to send email' });
  // }
};

export default sendMailHandler;