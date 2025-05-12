'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Document as PDFDocGen, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { Document as PDFViewer, Page as PDFPage } from 'react-pdf';
import { saveAs } from 'file-saver';
import Sarabun from '/fonts/Sarabun-Light.ttf'

import { pdfjs } from 'react-pdf';
import { formatDate } from '@/lib/utils';

Font.register({
    family: 'THSarabunNew',
    src: '/fonts/Sarabun-Light.ttf',
})

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const styles = StyleSheet.create({
    body: { fontFamily: 'THSarabunNew', fontSize: 10, padding: 28 },
    image: { width: 80, height: 80, marginHorizontal: 240, marginVertical: 20 },
    text: { marginBottom: 8 },
    // section: { marginBottom: 10 }
});

function MyDocument({ data }) {
    console.log('MyDocument data', data);
    const requestMedName = data.requestDetails.requestMedicine.name;
    const requestAmount = data.requestDetails.requestMedicine.requestAmount;
    const postingHospitalNameTH = data.requestDetails.postingHospitalNameTH;
    const respondingHospitalNameTH = data.respondingHospitalNameTH;
    const expectedReturnDate = formatDate(data.requestDetails.requestTerm.expectedReturnDate);
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <Image style={styles.image} src="/krut_mark.jpg" />
                <Text style={styles.text}>ที่ สข. 80231</Text>
                <Text style={styles.text}>{postingHospitalNameTH}</Text>
                <Text style={styles.text}>ที่อยู่</Text>
                <Text style={styles.text}>วัน เดือน ปี</Text>
                <Text style={styles.text}>เรื่อง    ขอยืมเวชภัณฑ์ยา</Text>
                <Text style={styles.text}>เรียน    ผู้อำนวยการ {respondingHospitalNameTH}</Text>
                <Text style={{ marginTop: 6, textIndent: 80 }}>ตามที่โรงพยาบาล {respondingHospitalNameTH} มีความประสงค์ที่จะขอยืมยา ดังรายการต่อไปนี้</Text>
                <Text style={{ marginTop: 14 }}>รายการ                               จำนวน                             วันกำหนดคืน                     หมายเหตุ</Text>
                <Text style={{ marginTop: 14, textDecorationStyle: "bold" }}>{requestMedName}                                    {requestAmount}                                  {expectedReturnDate}                           ...</Text>
                <Text style={{ marginTop: 30, textIndent: 80 }}>ทั้งนี้ {respondingHospitalNameTH} จะส่งคืนยาให้แก่โรงพยาบาล {postingHospitalNameTH} ภายในวันที่ {expectedReturnDate} และหากมีการเปลี่ยนแปลงจะต้องแจ้งให้ทราบล่วงหน้า</Text>
                <Text style={{ marginTop: 30, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดพิจารณาและ {respondingHospitalNameTH} ขอขอบคุณ {postingHospitalNameTH} ณ โอกาสนี้</Text>
                <Text style={{ marginTop: 30, textIndent: 280 }}>ขอแสดงความนับถือ</Text>
                <Text style={{ marginTop: 100, textIndent: 280 }}>ชื่อผู้อำนวยการ </Text>
                <Text style={{ textIndent: 280 }}>ผู้อำนวยการ{respondingHospitalNameTH}</Text>
                <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text style={{}}>ติดต่อ</Text>
            </Page>
        </PDFDocGen>
    )

}

const PdfPreview = forwardRef(({ data }, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument data={data} />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, []);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            if (blob) {
                saveAs(blob, 'document.pdf');
            }
        },
    }));

    return (
        <div>
            {pdfUrl && (
                <PDFViewer file={pdfUrl}>
                    <PDFPage pageNumber={1} width={520} renderAnnotationLayer={false} renderTextLayer={false} />
                </PDFViewer>
            )}
        </div>
    );
});

PdfPreview.displayName = 'PdfPreview';
export default PdfPreview;