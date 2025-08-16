/* eslint-disable jsx-a11y/alt-text */
"use client";
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
    family: 'THSarabunNew',
    src: '/fonts/Sarabun-Light.ttf',
})

const styles = StyleSheet.create({
    body: { fontFamily: 'THSarabunNew', fontSize: 14, padding: 28 },
    image: { width: 80, height: 80, marginHorizontal: 240, marginVertical: 20 },
    text: { marginBottom: 8 },
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
    // section: { marginBottom: 10 }
});
const todayFormat = new Date();
const today = format(todayFormat, 'dd/MM/yyyy');
// ✅ รับ props: data
export default function PDFPreviewButton({ data }: { data: any[] }) {
    console.log("data === ",data)
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

  return (
    <Dialog onOpenChange={(open) => open && generatePDF()}>
      <DialogTrigger asChild>
      <Button><Printer/>พิมพ์เอกสารการเรียกคืนยา</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[90vh]">
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
          <PDFPage pageNumber={1} width={600} />
          </PDFViewer>
        </div>
        )}
      </div>
      <DialogFooter className="mt-4">
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
  };

// ✅ PDF Document ที่ใช้ mock data
const MySimplePDF = ({ data }: { data: MyDocumentProps[] }) => (
  <PDFDocGen>
              <Page size="A4" style={styles.body}>
                  <Image style={styles.image} src="/krut_mark.jpg"/>
                  <View style={[styles.table, { marginBottom: 10 }]}>
                      {/* Row 1 */}
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'left' }]}>ที่ สข. 80231</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{data?.[0] ? `${data[0].hospitalName}\nที่อยู่ ${data[0].address}` : ''}</Text>
                      </View>

                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'left' }]}></Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}></Text>
                      </View>

                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'left' }]}></Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}></Text>
                      </View>
                  </View>
  
                  <Text style={{ textAlign: 'center' }} >{today}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{} </Text>
                  <Text style={styles.text}>เรื่อง    ขอเรียกคืนเวชภัณฑ์ยาที่ครบกำหนด</Text>
                  <Text style={styles.text}>เรียน    ผู้อำนวยการ{data?.[0] ? data[0].hospitalName : ''}</Text>
                  <Text style={{ marginTop: 6, textIndent: 80 }}>
                      เนื่องด้วย {data?.[0] ? data[0].hospitalName : ''} มีความประสงค์ที่จะขอเรียกคืนยาที่ครบกำหนดระยะเวลาการยืม ดังรายการต่อไปนี้
                  </Text>
  
                  <View style={[styles.table, { marginTop: 14 }]}>
                      <View style={styles.tableRow}>
                          <Text style={styles.tableHeader}>รายการ</Text>
                          <Text style={styles.tableHeader}>จำนวน </Text>
                          <Text style={styles.tableHeader}>ราคา </Text>
                          <Text style={styles.tableHeader}>มูลค่า </Text>
                          <Text style={styles.tableHeader}>วันที่ยืม </Text>
                          <Text style={styles.tableHeader}>กำหนดรับคืน </Text>
                          <Text style={styles.tableHeader}>จำนวนวันที่ยืม</Text>
                      </View>
                      {data.map((item, index) => (
                      <View key={index} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.offeredMedicine.name : item.sharingMedicine.name}</Text>
                            <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? Number(item.offeredMedicine.offerAmount).toLocaleString() : Number(item.sharingMedicine.sharingAmount).toLocaleString()}</Text>
                            <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? Number(item.offeredMedicine.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(item.sharingMedicine.pricePerUnit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? (Number(item.offeredMedicine.offerAmount) * Number(item.offeredMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (Number(item.sharingMedicine.sharingAmount) * Number(item.sharingMedicine.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                          <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.responseDetails[0].updatedAt) : formatDate(item.responseDetails[0].createdAt)}</Text>
                          <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? formatDate(item.requestTerm.expectedReturnDate) : formatDate(item.responseDetails[0].acceptedOffer.expectedReturnDate)}</Text>
                          <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.ticketType === 'request' ? item.dayAmount : item.dayAmount} วัน</Text>
                      </View> ))}
                  </View>
  
                  {/* <Text style={{ marginTop: 30, textIndent: 80 }}>
                      ทั้งนี้ {} จะส่งคืนยาให้แก่โรงพยาบาล {} ภายในวันที่ {} และหากมีการเปลี่ยนแปลงจะต้องแจ้งให้ทราบล่วงหน้า
                  </Text> */}
                  <Text style={{ marginTop: 30, textIndent: 80 }}>
                      จึงเรียนมาเพื่อโปรดดำเนินการ
                  </Text>
  
                  <Text style={{ marginTop: 30, textIndent: 280 }}>ขอแสดงความนับถือ</Text>
                  <Text style={{ marginTop: 100, textIndent: 280 }}>{data[0]?.director}</Text>
                  <Text style={{ textIndent: 280 }}>ผู้อำนวยการ{data[0]?.hospitalName}</Text>
                  <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                  <Text>ติดต่อ</Text>
              </Page>
          </PDFDocGen>
);

