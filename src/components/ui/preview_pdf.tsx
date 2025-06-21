/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Document as PDFDocGen, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { Document as PDFViewer, Page as PDFPage } from 'react-pdf';
import { saveAs } from 'file-saver';

import { pdfjs } from 'react-pdf';
import { formatDate } from '@/lib/utils';
import { format } from 'date-fns';

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

function MyDocument({ pdfData }: any) {
    console.log('MyDocument data', pdfData);
    const selectedResponseId = pdfData.responseId;

    const selectedResponseDetail = pdfData.responseDetails.find(
        (item: any) => item.id === selectedResponseId
    );

    if (!selectedResponseDetail) return null;

    const requestedMedicineName = pdfData.requestDetails.name;
    const requestedQuantity = pdfData.requestDetails.requestAmount;
    const lendingHospitalNameTH = pdfData.postingHospitalNameTH;
    const lendingHospitalAddress = "15 ถนนกาญจนวณิชย์ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110  "
    const borrowingHospitalNameTH = selectedResponseDetail.respondingHospitalNameTH;
    const expectedReturnDate = formatDate(pdfData.requestTerm.expectedReturnDate);
    const mockNote = "รอการส่งมอบจากตัวแทนจำหน่าย  "

    const todayFormat = new Date();
    const today = format(todayFormat, 'dd/MM/yyyy');

    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <Image style={styles.image} src="/krut_mark.jpg"/>
                <View style={[styles.table, { marginBottom: 10 }]}>
                    {/* Row 1 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}>ที่ สข. 80231</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        {/* <Text style={[styles.tableCell, { flex: 1 }]}></Text> */}
                        <Text style={[styles.tableCell, { flex: 1 }]}>{lendingHospitalNameTH} </Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                        {/* <Text style={[styles.tableCell, { flex: 1 }]}></Text> */}
                        <Text style={[styles.tableCell, { flex: 1 }]}>ที่อยู่ {lendingHospitalAddress}</Text>
                    </View>
                </View>

                <Text style={{ textAlign: 'center' }} >{today}</Text>
                <Text style={styles.text}>เรื่อง    ขอยืมเวชภัณฑ์ยา</Text>
                <Text style={styles.text}>เรียน    ผู้อำนวยการ {borrowingHospitalNameTH}</Text>
                <Text style={{ marginTop: 6, textIndent: 80 }}>
                    ตามที่โรงพยาบาล {borrowingHospitalNameTH} มีความประสงค์ที่จะขอยืมยา ดังรายการต่อไปนี้
                </Text>

                <View style={[styles.table, { marginTop: 14 }]}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>รายการ</Text>
                        <Text style={styles.tableHeader}>จำนวน </Text>
                        <Text style={styles.tableHeader}>วันกำหนดคืน </Text>
                        <Text style={styles.tableHeader}>หมายเหตุ</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{requestedMedicineName}</Text>
                        <Text style={styles.tableCell}>{requestedQuantity}</Text>
                        <Text style={styles.tableCell}>{expectedReturnDate}</Text>
                        <Text style={styles.tableCell}>{mockNote}</Text>
                    </View>
                </View>

                <Text style={{ marginTop: 30, textIndent: 80 }}>
                    ทั้งนี้ {borrowingHospitalNameTH} จะส่งคืนยาให้แก่โรงพยาบาล {lendingHospitalNameTH} ภายในวันที่ {expectedReturnDate} และหากมีการเปลี่ยนแปลงจะต้องแจ้งให้ทราบล่วงหน้า
                </Text>
                <Text style={{ marginTop: 30, textIndent: 80 }}>
                    จึงเรียนมาเพื่อโปรดพิจารณาและ {borrowingHospitalNameTH} ขอขอบคุณ {lendingHospitalNameTH} ณ โอกาสนี้
                </Text>

                <Text style={{ marginTop: 30, textIndent: 280 }}>ขอแสดงความนับถือ</Text>
                <Text style={{ marginTop: 100, textIndent: 280 }}>ชื่อผู้อำนวยการ</Text>
                <Text style={{ textIndent: 280 }}>ผู้อำนวยการ {borrowingHospitalNameTH}</Text>
                <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text>ติดต่อ</Text>
            </Page>
        </PDFDocGen>
    );
}


const PdfPreview = forwardRef(({ data: pdfData }: any, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument pdfData={pdfData} />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, [pdfData]);

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
                <PDFViewer file={pdfUrl} key={pdfUrl}>
                    <PDFPage pageNumber={1} width={520} renderAnnotationLayer={false} renderTextLayer={false} />
                </PDFViewer>
            )}
        </div>
    );
});

PdfPreview.displayName = 'PdfPreview';
export default PdfPreview;