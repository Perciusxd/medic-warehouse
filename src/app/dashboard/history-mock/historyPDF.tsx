/* eslint-disable jsx-a11y/alt-text */
"use client";
import '@/utils/polyfill';
import { useEffect, useState } from "react";
import { pdf, Document as PDFDocGen, Page, Text, View, StyleSheet ,Font ,Image} from "@react-pdf/renderer";
import { Document as PDFViewer, Page as PDFPage, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
    ).toString();


Font.register({
    family: 'TH SarabunPSK',
    src: '/fonts/thsarabun.ttf',
})

const cm = (value: number) => value * 28.3464567;


const styles = StyleSheet.create({
    body: { fontFamily: 'TH SarabunPSK', fontSize: 16, paddingLeft: cm(2), paddingRight: cm(2), paddingTop: cm(1.5), paddingBottom: cm(1.5) },
    image: { width: 80, height: 80, marginHorizontal: 200 },
    text: { marginBottom: 8, fontFamily: 'TH SarabunPSK', fontSize: 16 },
    table: {
        display: 'flex',
        width: 'auto',
        // borderStyle: 'solid',
        // borderWidth: 1,
        // borderRightWidth: 0,
        // borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        width: '25%',
        // borderStyle: 'solid',
        // borderBottomWidth: 1,
        // borderRightWidth: 1,
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tableCell: {
        width: '25%',
        // borderStyle: 'solid',
        // borderBottomWidth: 1,
        // borderRightWidth: 1,
        padding: 4,
    },
    // Bordered versions for data tables
    tableWithBorder: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableHeaderWithBorder: {
        width: '25%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tableCellWithBorder: {
        width: '25%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 4,
    },
    // section: { marginBottom: 10 }
});

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const toThaiDigits = (input: string | number) =>
  input.toString().replace(/\d/g, d => "๐๑๒๓๔๕๖๗๘๙"[Number(d)]);

const todayFormat = new Date();
const day = todayFormat.getDate();
const month = thaiMonths[todayFormat.getMonth()];
const buddhistYear = todayFormat.getFullYear() + 543;

const today = `${toThaiDigits(day)} ${month} ${toThaiDigits(buddhistYear)}`;

function toThaiDigits_(input: string | number): string {
    const s = typeof input === 'number' ? String(input) : String(input ?? '');
    return s.replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

// ฟังก์ชันสำหรับสร้างและเปิด PDF โดยตรง
export async function generateAndOpenPDF(data: any[]) {
  try {
    // สร้าง PDF พร้อมหน้าสำเนา (isCopy = true)
    const blob = await pdf(<MySimplePDF data={data} isCopy={true} />).toBlob();
    const url = URL.createObjectURL(blob);
    
    // เปิด PDF ในแท็บใหม่
    window.open(url, '_blank');
    
    // ทำความสะอาด URL หลังจาก 1 นาที
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    
    return true;
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการสร้างเอกสาร');
    return false;
  }
}

// ✅ รับ props: data
export default function PDFPreviewButton({ data, disabled = false }: { data: any[], disabled?: boolean }) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
        
    const generatePDF = async () => {
        const blob = await pdf(<MySimplePDF data={data} />).toBlob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
  };    
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const downloadPDF = async () => {
    const blob = await pdf(<MySimplePDF data={data} isCopy={true} />).toBlob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const dateStr = format(new Date(), 'ddMMyyyy');
    link.download = `medicine_recall_${dateStr}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Dialog onOpenChange={(open) => open && !disabled && generatePDF()}>
      <DialogTrigger asChild>
      <Button disabled={disabled}
          className={`transition-opacity ${disabled ? "opacity-50" : "opacity-100"}`}><Printer/>พิมพ์เอกสารการเรียกคืนยา</Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit w-full h-[90vh]">
      <DialogHeader>
        <DialogTitle>Preview PDF</DialogTitle>
      </DialogHeader>
      <div className="bg-white p-2 rounded border w-full h-[70vh] flex justify-center items-center overflow-auto">
        {blobUrl && (
        <div className="w-full h-full flex justify-center items-center">
          <PDFViewer
          key={blobUrl}
          file={blobUrl}
          className="w-full h-full"
          >
          <PDFPage pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} />
          </PDFViewer>
        </div>
        )}
      </div>
      <DialogFooter className="mt-4">
        <Button onClick={downloadPDF}>ดาวน์โหลด PDF</Button>
        <DialogClose asChild>
          <Button variant="ghost">ปิด</Button>
        </DialogClose>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

 type MyDocumentProps = 
  {
    name: string;
    amount: number;
    price: number;
    value: number;
    lendingDate: string;
    expectedReturnDate: string;
    daysLending: number;
    ticketType: string;
    responseDetails: any;
    sharingMedicine: any;
    sharingReturnTerm: any;
    dayAmount: number;
    overDue: boolean;
    requestMedicine: any;
    offeredMedicine: any;
    requestTerm:any;
    address: string;
    hospitalName: string;
    director: string;
    contact: string;
    hostHospital: string;
    directorPosition: string;
  };

  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };
  

// ✅ PDF Document ที่ใช้ mock data
// const MySimplePDF = ({ data }: { data: MyDocumentProps[] }) => (
//   <PDFDocGen>
//               <Page size="A4" style={styles.body}>
//                   {/* <Image style={styles.image} src="/krut_mark.jpg"/> */}
//                   <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 40 }}>สำเนา </Text>
//                   <View style={[styles.table, { marginBottom: 10 }]} fixed>
//                       <View style={styles.tableRow}>
//                           <Text style={[styles.tableCell, { flex: 1 }]}>ที่ สข. 80231</Text>
//                           <Text style={[styles.tableCell, { flex: 1 }]}></Text>
//                           <Text style={[styles.tableCell, { flex: 1 }]}>{data[0].hospitalName} </Text>
//                       </View>
      
//                       <View style={styles.tableRow}>
//                           <Text style={[styles.tableCell, { flex: 1 }]}></Text>
//                           <Text style={[styles.tableCell, { flex: 1 }]}></Text>
//                           <Text style={[styles.tableCell, { flex: 1, flexWrap: 'wrap', maxWidth: '100%' }]}>ที่อยู่ {data[0].address}  <span style={{ display: 'none' }}>hidden</span> </Text>
//                       </View>

//                   </View>
  
//                   <Text style={{ textAlign: 'center' }} >{today}</Text>
//                   {/* <Text style={[styles.tableCell, { flex: 1 }]}>{} </Text> */}
//                   <Text style={styles.text}>เรื่อง    ขอเรียกคืนเวชภัณฑ์ยาที่ครบกำหนด </Text>
//                   <Text style={styles.text}>เรียน    ผู้อำนวยการ{data?.[0] ? data[0].hospitalName : ''}</Text>
//                   <Text style={{ marginTop: 6, textIndent: 80 }}>เนื่องด้วย {data?.[0] ? data[0].hospitalName : ''} มีความประสงค์ที่จะขอเรียกคืนยาที่ครบกำหนดระยะเวลาการยืม ดังรายการต่อไปนี้ </Text>
  
//                   <View style={[styles.table, { marginTop: 14 }]}>
//                       <View style={styles.tableRow}>
//                           <Text style={styles.tableHeader}>รายการ</Text>
//                           <Text style={styles.tableHeader}>จำนวน </Text>
//                           <Text style={styles.tableHeader}>ราคา </Text>
//                           <Text style={styles.tableHeader}>มูลค่า </Text>
//                           <Text style={styles.tableHeader}>วันที่ยืม </Text>
//                           <Text style={styles.tableHeader}>กำหนดรับคืน </Text>
//                           <Text style={styles.tableHeader}>จำนวนวันที่ยืม </Text>
//                       </View>
//                       {data.map((item, index) => (
//                       <View key={index} style={styles.tableRow}>
//                           <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.offeredMedicine?.name ?? '-' : item.sharingMedicine.name ?? '-'}</Text>
//                             <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? Number(item.offeredMedicine?.offerAmount).toLocaleString() : Number(item.sharingMedicine.sharingAmount).toLocaleString() + `(${item.sharingMedicine.unit})`}</Text>
//                             <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? Number(item.offeredMedicine?.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(item.sharingMedicine.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
//                             <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? (Number(item.offeredMedicine?.offerAmount) * Number(item.offeredMedicine?.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (Number(item.sharingMedicine.sharingAmount) * Number(item.sharingMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
//                           <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.responseDetails[0].updatedAt) : formatDate(item.responseDetails[0].createdAt)}</Text>
//                           <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.requestTerm.expectedReturnDate) : formatDate(item.responseDetails[0].acceptedOffer?.expectedReturnDate)}</Text>
//                           <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.dayAmount : item.dayAmount} วัน</Text>
//                       </View> ))}
//                   </View>
  
//                   {/* <Text style={{ marginTop: 30, textIndent: 80 }}>
//                       ทั้งนี้ {} จะส่งคืนยาให้แก่โรงพยาบาล {} ภายในวันที่ {} และหากมีการเปลี่ยนแปลงจะต้องแจ้งให้ทราบล่วงหน้า
//                   </Text> */}
//                   <Text style={{ marginTop: 30, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ </Text>
  
//                   <Text style={{ marginTop: 30, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
//                   <Text style={{ marginTop: 100, textIndent: 305 }}>{data[0]?.director}</Text>
//                   <Text style={{ textIndent: 297 }}>ผู้อำนวยการ{data[0]?.hospitalName}</Text>
//                   <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
//                   <Text>ติดต่อ {data[0]?.contact}</Text>
//               </Page>
//           </PDFDocGen>
// );

const MySimplePDF = ({ data, isCopy }: { data: MyDocumentProps[], isCopy?: boolean }) => {
  // กำหนดว่า 1 หน้าอยากให้มีไม่เกินกี่แถว
  const rowsPerPage = 3;
  const pages = chunkArray(data, rowsPerPage);

  return (
    <PDFDocGen>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.body}>
          <Image style={styles.image} src="/krut_mark.jpg" />
          {/* {isCopy
            ? <Text style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>สำเนา</Text>
            : <Image style={styles.image} src="/krut_mark.jpg" />
          } */}
          <View style={[styles.table, { marginBottom: 10 }]} fixed>
              <View style={styles.tableRow}>
                  <Text style={[ { flex: 1 }]}>ที่ สข. ๘๐๒๓๑</Text>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1, flexWrap: 'wrap' }]}>{data[0].hostHospital} </Text>
              </View>

              <View style={styles.tableRow}>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1, flexWrap: 'wrap' }]}>ที่อยู่ {toThaiDigits_(data[0].address)} </Text>
              </View>

          </View>
  
          <Text style={{ textAlign: 'center' }} >{today}</Text>
          {/* <Text style={[styles.tableCell, { flex: 1 }]}>{} </Text> */}
          <Text style={styles.text}>เรื่อง    ขอเรียกคืนเวชภัณฑ์ยาที่ครบกำหนด </Text>
          <Text style={styles.text}>เรียน    ผู้อำนวยการ{data?.[0] ? data[0].hospitalName : ''}</Text>
          <Text style={{ marginTop: 6, textIndent: 80 }}>เนื่องด้วย {data?.[0] ? data[0].hospitalName : ''} มีความประสงค์จะขอเรียกคืนยาที่ครบกำหนดระยะเวลาการยืม โดยมีรายละเอียดดังต่อไปนี้ </Text>

          {/* Table Header */}
          <View style={[styles.tableWithBorder, { marginTop: 14 }]} wrap={false}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderWithBorder}>ลำดับ </Text>
              <Text style={styles.tableHeaderWithBorder}>รายการ </Text>
              <Text style={styles.tableHeaderWithBorder}>จำนวน </Text>
              <Text style={styles.tableHeaderWithBorder}>ราคาต่อหน่วย </Text>
              <Text style={styles.tableHeaderWithBorder}>ราคารวม </Text>
              <Text style={styles.tableHeaderWithBorder}>จำนวนวันที่ยืม </Text>
            </View>

            {/* Table Rows */}
            {pageData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(pageIndex * rowsPerPage + index + 1)}</Text>
                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.responseDetails.requestMedicine?.name + ` (${toThaiDigits(Number(item.responseDetails.requestMedicine.requestAmount).toLocaleString())}/${item.responseDetails.requestMedicine.unit})` : item.sharingMedicine?.name + ` (${toThaiDigits(Number(item.sharingMedicine.sharingAmount).toLocaleString())}/${item.sharingMedicine.unit})`}</Text>
                {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.offeredMedicine?.name ?? '-' : item.sharingMedicine?.name + ` (${item.sharingMedicine?.quantity})`}</Text> */}
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? Number(item.responseDetails.requestMedicine?.quantity).toLocaleString() : Number(item.sharingMedicine.quantity).toLocaleString())}</Text>
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? Number(item.responseDetails.requestMedicine?.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(item.sharingMedicine.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</Text>
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? (Number(item.responseDetails.requestMedicine.requestAmount) * Number(item.responseDetails.requestMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (Number(item.sharingMedicine.sharingAmount) * Number(item.sharingMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</Text>
                    {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.responseDetails[0].updatedAt) : formatDate(item.responseDetails[0].createdAt)}</Text> */}
                    {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.requestTerm?.expectedReturnDate) : formatDate(item.responseDetails[0].acceptedOffer?.expectedReturnDate)}</Text> */}
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? item.dayAmount === 0 ? 1 : item.dayAmount : item.dayAmount === 0 ? item.dayAmount : 1)} วัน</Text>
                </View> ))}
            {/* <Text style={{ marginTop: 10, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ </Text>

            <Text style={{ marginTop: 10, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 80, textIndent: 295 }}>{data[0]?.director}</Text>
            <Text style={{ textIndent: 297 }}>ผู้อำนวยการ{data[0]?.hospitalName}</Text> */}
          </View>

          {/* Footer section - ชิดขอบล่างเสมอ (ห่าง 2 ซม. จากขอบ) */}
          <View style={{ position: 'absolute', bottom: cm(1.5), left: 50, right: 50 }} fixed>
            <Text style={{ marginTop: 20, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ </Text>
            <Text style={{ marginTop: 10, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 80, textIndent: 0, textAlign: 'right', marginRight: 85 }}>{data[0]?.director}</Text>
            <Text style={{ marginBottom: 10, textIndent: 297 }}>{data[0].directorPosition}{data[0].hostHospital}</Text>
            <Text>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
            <Text>ติดต่อ {toThaiDigits_(data[0]?.contact)}</Text>
          </View>
        </Page>
      ))}

      {isCopy && pages.map((pageData, pageIndex) => (
        <Page key={`copy-${pageIndex}`} size="A4" style={styles.body}>
          {isCopy
            ? <Text style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>สำเนา </Text>
            : <Image style={styles.image} src="/krut_mark.jpg" />
          }
          {/* Footer เหมือนเดิม */}
          <View style={[styles.table, { marginBottom: 10 }]} fixed>
              <View style={styles.tableRow}>
                  <Text style={[ { flex: 1 }]}>ที่ สข. ๘๐๒๓๑</Text>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1, flexWrap: 'wrap' }]}>{data[0].hostHospital} </Text>
              </View>

              <View style={styles.tableRow}>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1 }]}></Text>
                  <Text style={[ { flex: 1, flexWrap: 'wrap' }]}>ที่อยู่ {toThaiDigits_(data[0].address)} </Text>
              </View>
          </View>
  
          <Text style={{ textAlign: 'center' }} >{today}</Text>
          {/* <Text style={[styles.tableCell, { flex: 1 }]}>{} </Text> */}
          <Text style={styles.text}>เรื่อง    ขอเรียกคืนเวชภัณฑ์ยาที่ครบกำหนด </Text>
          <Text style={styles.text}>เรียน    ผู้อำนวยการ{data?.[0] ? data[0].hospitalName : ''}</Text>
          <Text style={{ marginTop: 6, textIndent: 80 }}>เนื่องด้วย {data?.[0] ? data[0].hospitalName : ''} มีความประสงค์จะขอเรียกคืนยาที่ครบกำหนดระยะเวลาการยืม โดยมีรายละเอียดดังต่อไปนี้ </Text>

          {/* Table Header */}
          <View style={[styles.tableWithBorder, { marginTop: 14 }]} wrap={false}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderWithBorder}>ลำดับ </Text>
              <Text style={styles.tableHeaderWithBorder}>รายการ </Text>
              <Text style={styles.tableHeaderWithBorder}>จำนวน </Text>
              <Text style={styles.tableHeaderWithBorder}>ราคาต่อหน่วย </Text>
              <Text style={styles.tableHeaderWithBorder}>ราคารวม </Text>
              <Text style={styles.tableHeaderWithBorder}>จำนวนวันที่ยืม </Text>
            </View>

            {/* Table Rows */}
            {pageData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(pageIndex * rowsPerPage + index + 1)}</Text>
                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.responseDetails.requestMedicine?.name + ` (${toThaiDigits(Number(item.responseDetails.requestMedicine.requestAmount).toLocaleString())}/${item.responseDetails.requestMedicine.unit})` : item.sharingMedicine?.name + ` (${toThaiDigits(Number(item.sharingMedicine.sharingAmount).toLocaleString())}/${item.sharingMedicine.unit})`}</Text>
                {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.offeredMedicine?.name ?? '-' : item.sharingMedicine?.name + ` (${item.sharingMedicine?.quantity})`}</Text> */}
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? Number(item.responseDetails.requestMedicine?.quantity).toLocaleString() : Number(item.sharingMedicine.quantity).toLocaleString())}</Text>
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? Number(item.responseDetails.requestMedicine?.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(item.sharingMedicine.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</Text>
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? (Number(item.responseDetails.requestMedicine?.quantity) * Number(item.responseDetails.requestMedicine?.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (Number(item.sharingMedicine.sharingAmount) * Number(item.sharingMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</Text>
                    {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.responseDetails[0].updatedAt) : formatDate(item.responseDetails[0].createdAt)}</Text> */}
                    {/* <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.requestTerm?.expectedReturnDate) : formatDate(item.responseDetails[0].acceptedOffer?.expectedReturnDate)}</Text> */}
                    <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>{toThaiDigits(item.ticketType === 'request' ? item.dayAmount === 0 ? 1 : item.dayAmount : item.dayAmount === 0 ? item.dayAmount : 1)} วัน</Text>
                </View> ))}
          </View>

          {/* <Text style={{ marginTop: 20, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ </Text>
          <Text style={{ marginTop: 20, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
          <Text style={{ marginTop: 80, textIndent: 295 }}>{data[0]?.director}</Text>
          <Text style={{ textIndent: 297 }}>ผู้อำนวยการ{data[0]?.hospitalName}</Text> */}

          {/* Footer section - ชิดขอบล่างเสมอ (ห่าง 2 ซม. จากขอบ) */}
          <View style={{ position: 'absolute', bottom: cm(1.5), left: 50, right: 50 }} fixed>
            <Text style={{ marginTop: 20, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ </Text>
            <Text style={{ marginTop: 10, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 80, textIndent: 0, textAlign: 'right', marginRight: 85 }}>{data[0]?.director}</Text>
            <Text style={{ marginBottom: 10, textIndent: 297 }}>{data[0].directorPosition}{data[0].hostHospital}</Text>
            <Text>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
            <Text>ติดต่อ {toThaiDigits_(data[0]?.contact)}</Text>
          </View>
        </Page>
      ))}
    </PDFDocGen>
  );
};