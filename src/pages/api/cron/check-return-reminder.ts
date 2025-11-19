import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';

const MONGODB_URI = process.env.NEXT_PUBLIC_API_MONGODB_URI || 'mongodb://127.0.0.1:27017/borrow-app?directConnection=true';
const resend = new Resend(process.env.NEXT_PUBLIC_API_RESEND_API_KEY);
// const fromEmail = process.env.NEXT_PUBLIC_API_RESEND_FROM_EMAIL?.toString() || 'no-reply@bcmed.online';
const fromEmail = 'no-reply@bcmed.online';

const testEmail = 'pupzaporjict@gmail.com'
const hospitalList = ['Songkla Hospital','Hatyai Hospital', 'Jana Hospital', 'Na Mom Hospital', 'Bang Klam Hospital', 'Khuanniang Hospital', 'Ranot Hospital', 'Krasae Sin Hospital', 'Sadao Hospital', 'Somdejpraboromrachineenart Na Thawi Hospital']

// ฟังก์ชันสำหรับค้นหา email จากฐานข้อมูลโดยใช้ชื่อโรงพยาบาล
async function findHospitalEmail(db: any, hospitalNameTH?: string, hospitalNameEN?: string): Promise<string | null> {
  try {
    const query: any = {};
    
    if (hospitalNameTH || hospitalNameEN) {
      query.$or = [];
      if (hospitalNameTH) {
        query.$or.push({ hospitalNameTH: hospitalNameTH });
      }
      if (hospitalNameEN) {
        query.$or.push({ hospitalNameEN: hospitalNameEN });
      }
    } else {
      return null;
    }

    const hospital = await db.collection('users').findOne(query);
    return hospital?.email || null;
  } catch (error) {
    console.error('Error finding hospital email:', error);
    return null;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูล sharing tickets จาก API
async function fetchSharingTicketsFromAPI(hospitalName: string) {
  const baseUrl = process.env.ENDPOINT_CRON || 'http://localhost:3000';
  
  try {
    const status = [
      'to-transfer',
                    'to-confirm',
                    'offered',
                    're-confirm',
                    'in-return',
                    'returned',
                    'confirm-return',
                  'pending','completed', 'to-return'
    ];
    
    const body = {
      loggedInHospital: hospitalName,
      status: JSON.stringify(status),
    };

    // console.log(`Fetching sharing tickets for ${hospitalName} from ${baseUrl}/api/querySharing`);
    
    const response = await fetch(`${baseUrl}/api/querySharing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error for ${hospitalName}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch sharing tickets for ${hospitalName}: ${response.status}`);
    }
    
    const tickets = await response.json();
    return tickets || [];
  } catch (error) {
    console.error(`Error fetching sharing tickets from API for ${hospitalName}:`, error);
    throw error;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูล request tickets จาก API
async function fetchRequestTicketsFromAPI(hospitalName: string) {
  const baseUrl = process.env.ENDPOINT_CRON || 'http://localhost:3000';
  
  try {
    const status = [
      'to-transfer',
      'to-confirm',
      'offered',
      're-confirm',
      'in-return',
      'returned',
      'confirm-return',
      'pending',
      'completed',
      'to-return'
    ];
    
    const body = {
      loggedInHospital: hospitalName,
      status: JSON.stringify(status),
    };

    // console.log(`Fetching request tickets for ${hospitalName} from ${baseUrl}/api/queryRequestByStatus`);
    
    const response = await fetch(`${baseUrl}/api/queryRequestByStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error for ${hospitalName}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch request tickets for ${hospitalName}: ${response.status}`);
    }
    
    const tickets = await response.json();
    return tickets || [];
  } catch (error) {
    console.error(`Error fetching request tickets from API for ${hospitalName}:`, error);
    throw error;
  }
}

// ฟังก์ชันสำหรับส่งอีเมล์ด้วย Resend
async function sendReminderEmail(hospitalName: string, email: string, medicineName: string, daysOverdue: number, ticketId: string) {
  console.log(`Sending reminder email to ${email} (${hospitalName})`);
  console.log(`Medicine: ${medicineName}, Days overdue: ${daysOverdue}, Ticket: ${ticketId}`);
  
  let statusText = '';
  let urgencyLevel = '';
  
  if (daysOverdue === 0) {
    statusText = 'ครบกำหนดส่งคืนวันนี้';
    urgencyLevel = 'ปกติ';
  } else if (daysOverdue === 7) {
    statusText = `เกินกำหนดส่งคืนแล้ว ${daysOverdue} วัน`;
    urgencyLevel = 'ด่วน';
  } else if (daysOverdue === 14) {
    statusText = `เกินกำหนดส่งคืนแล้ว ${daysOverdue} วัน`;
    urgencyLevel = 'ด่วนที่สุด';
  } else {
    statusText = `เกินกำหนดส่งคืนแล้ว ${daysOverdue} วัน`;
    urgencyLevel = 'ด่วนที่สุด';
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[ระบบแจ้งเตือนอัตโนมัติ] ${urgencyLevel} - แจ้งเตือนการส่งคืนยา`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${daysOverdue >= 14 ? '#d32f2f' : daysOverdue >= 7 ? '#f57c00' : '#1976d2'};">
            แจ้งเตือนการส่งคืนยา (${urgencyLevel})
          </h2>
          <p>เรียน ${hospitalName}</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>ยา:</strong> ${medicineName}</p>
            <p><strong>สถานะ:</strong> <span style="color: ${daysOverdue >= 14 ? '#d32f2f' : daysOverdue >= 7 ? '#f57c00' : '#1976d2'};">${statusText}</span></p>
            <p><strong>เลขที่รายการ:</strong> ${ticketId}</p>
          </div>
          <p>กรุณาดำเนินการส่งคืนยาโดยเร็วที่สุด</p>
          <p>ท่านสามารถตรวจสอบรายละเอียดเพิ่มเติมได้จากระบบ Medicine Sharing</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #757575;">
            อีเมล์นี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ กรุณาอย่าตอบกลับอีเมล์นี้
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error: any) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ตรวจสอบว่าเป็น cron job หรือมี authorization key
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-change-this';
  
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;

  try {
    const now = Date.now();
    const remindersSent: any[] = [];
    const errors: any[] = [];

    // เชื่อมต่อ MongoDB สำหรับบันทึก log เท่านั้น
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    // วนลูปผ่านโรงพยาบาลทั้งหมดใน hospitalList
    for (const hospital of hospitalList) {
      console.log(`Processing hospital: ${hospital}`);
      
      try {
        // ดึงข้อมูลจาก API สำหรับแต่ละโรงพยาบาล (ทั้ง sharing และ request)
        const sharingTickets = await fetchSharingTicketsFromAPI(hospital);
        const requestTickets = await fetchRequestTicketsFromAPI(hospital);
        const allTickets = [...sharingTickets, ...requestTickets];
        console.log(`Found ${sharingTickets.length} sharing tickets and ${requestTickets.length} request tickets for ${hospital}`);
        
        // ใช้ flatMap เหมือนกับหน้า history-mock เพื่อกรองและแยกข้อมูล
        const toReturnData = allTickets.flatMap((item: any) => {
          // กรณี sharing ticket - แยก responseDetails แต่ละตัว
          if (item.ticketType === 'sharing' && Array.isArray(item.responseDetails) && item.responseDetails.length > 0) {
            const { responseDetails, ...header } = item;

            return responseDetails
              .filter((resp: any) => resp.acceptedOffer && (resp.status === 'to-transfer' || resp.status === 'to-confirm' || resp.status === 'in-return'))
              .map((resp: any) => ({
                ...header,
                responseDetails: resp, // เปลี่ยนเป็น object แทน array
              }));
          }
          
          // กรณี request ticket - กรองตาม status
          if ((item.status === 'to-transfer' || item.status === 'to-confirm' || item.status === 'in-return') && item.ticketType === 'request') {
            return [item];
          }
          
          return [];
        });

        console.log(`Found ${toReturnData.length} items to check for ${hospital}`);
        
        for (const ticket of toReturnData) {
          try {
            // กำหนดตัวแปรตาม ticket type
            let expectedReturnDate;
            let respondingHospitalNameTH;
            let respondingHospitalNameEN;
            let medicineName;
            
            if (ticket.ticketType === 'sharing') {
              // สำหรับ sharing ticket
              const responseDetail = ticket.responseDetails;
              if (!responseDetail?.acceptedOffer?.expectedReturnDate) continue;
              
              expectedReturnDate = Number(responseDetail.acceptedOffer.expectedReturnDate);
              respondingHospitalNameTH = responseDetail.respondingHospitalNameTH;
              respondingHospitalNameEN = responseDetail.respondingHospitalNameEN;
              medicineName = ticket.sharingMedicine?.name || 
                            ticket.sharingMedicine?.[0]?.medicine?.tradeName || 
                            'ยา';
            } else if (ticket.ticketType === 'request') {
              // สำหรับ request ticket
              
              const requestDetail = ticket.requestDetails;
              if (!requestDetail?.requestTerm?.expectedReturnDate) continue;
              
              expectedReturnDate = Number(requestDetail.requestTerm.expectedReturnDate);
              respondingHospitalNameTH = requestDetail.postingHospitalNameTH;
              respondingHospitalNameEN = requestDetail.postingHospitalNameEN;
              medicineName = ticket.offeredMedicine?.name || 
                            ticket.requestMedicine?.medicine?.tradeName || 
                            'ยา';
            } else {
              continue;
            }

            const diffMs = now - expectedReturnDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            console.log(`[${ticket.ticketType}] Ticket ${ticket.id}: diff day ${diffDays}`);

            // เช็คว่าตรงเงื่อนไขส่งอีเมล์หรือไม่:
            // 1. วันนี้ครบกำหนด (diffDays === 0)
            // 2. เกินกำหนด 7 วัน (diffDays === 7)
            // 3. เกินกำหนด 14 วัน (diffDays === 14)
            const shouldSendReminder = diffDays === 0 || diffDays === 7 || diffDays === 14;

            if (shouldSendReminder) {
              // ใช้ test email สำหรับทดสอบ
              
              const email = testEmail;
              
              // ค้นหา email จากฐานข้อมูลโดยใช้ชื่อโรงพยาบาล
              // const email = await findHospitalEmail(db, respondingHospitalNameTH, respondingHospitalNameEN);
              
              if (!email) {
                errors.push({
                  ticketId: ticket._id,
                  ticketType: ticket.ticketType,
                  error: `No email found for hospital: ${respondingHospitalNameTH || respondingHospitalNameEN || 'Unknown'}`
                });
                continue;
              }

              // ใช้ชื่อโรงพยาบาลสำหรับแสดงในอีเมล์
              const hospitalName = respondingHospitalNameTH || respondingHospitalNameEN || 'Unknown';

              // ส่งอีเมล์
              await sendReminderEmail(
                hospitalName,
                email,
                medicineName,
                diffDays,
                ticket.id.toString()
              );

              remindersSent.push({
                ticketId: ticket.id,
                ticketType: ticket.ticketType,
                hospitalName: hospitalName,
                email,
                daysOverdue: diffDays,
                medicineName,
                queryHospital: hospital
              });

              // บันทึก log ลงฐานข้อมูล (optional)
              await db.collection('email_logs').insertOne({
                ticketId: ticket.id,
                ticketType: ticket.ticketType,
                type: 'return_reminder',
                sentAt: new Date(),
                recipient: email,
                hospitalName: hospitalName,
                daysOverdue: diffDays,
                queryHospital: hospital
              });
            }
          } catch (error: any) {
            errors.push({
              ticketId: ticket.id,
              hospital: hospital,
              error: error.message
            });
          }
        }
      } catch (error: any) {
        console.error(`Error processing hospital ${hospital}:`, error);
        errors.push({
          hospital: hospital,
          error: error.message
        });
      }
    }

    if (client) {
      await client.close();
    }

    return res.status(200).json({
      success: true,
      remindersSent: remindersSent.length,
      errors: errors.length,
      details: {
        remindersSent,
        errors
      }
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    
    if (client) {
      await client.close();
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
}
