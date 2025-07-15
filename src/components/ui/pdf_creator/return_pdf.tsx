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
    const { offeredMedicine, requestDetails, requestTerm, responseDetail, returnData } = pdfData;
    const returnMedicine = returnData.returnMedicine;
    console.log("offeredMedicine", offeredMedicine)
    console.log('returnData', returnData)
    const { returnConditions } = offeredMedicine;
    const { exactType, otherType, supportType, subType } = returnConditions;
    const returnTerm = exactType ? "ส่งคืนตามประเภท" : otherType ? "คืนรายการอื่น" : supportType ? "แบบสนับสนุน" : "คืนรายการทดแทน";
    
    const selectedResponseId = pdfData.responseId;

    const selectedResponseDetail = pdfData.responseDetails.find(
        (item: any) => item.id === selectedResponseId
    );

    if (!selectedResponseDetail) return null;

    // Handle both request and sharing data structures
    const isRequestType = pdfData.ticketType === "request";

    const requestedMedicineName = isRequestType
        ? pdfData.requestDetails?.name || pdfData.requestMedicine?.name
        : pdfData.sharingDetails?.name || pdfData.sharingMedicine?.name;

    const requestedQuantity = isRequestType
        ? pdfData.requestDetails?.requestAmount || pdfData.requestMedicine?.requestAmount
        : pdfData.sharingDetails?.sharingAmount || pdfData.sharingMedicine?.sharingAmount;

    const lendingHospitalNameTH = pdfData.postingHospitalNameTH;
    const lendingHospitalAddress = "15 ถนนกาญจนวณิชย์ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110  "
    const borrowingHospitalNameTH = selectedResponseDetail.respondingHospitalNameTH;

    const documentType = isRequestType ? "ขอยืมเวชภัณฑ์ยา" : "ขอรับแบ่งปันเวชภัณฑ์ยา";

    const todayFormat = new Date();
    const today = format(todayFormat, 'dd/MM/yyyy');

    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <Image style={styles.image} src="/krut_mark.jpg" />
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
                <Text style={styles.text}>เรื่อง    {documentType}</Text>
                <Text style={styles.text}>เรียน    ผู้อำนวยการ {borrowingHospitalNameTH}</Text>
                <Text style={{ marginTop: 6, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>
                    เนื่องด้วย {lendingHospitalNameTH} มีความประสงค์ที่จะขอคืนยา ซึ่งเป็นการคืนยา{returnTerm} ดังรายการต่อไปนี้  
                </Text>

                <Text style={{ marginTop: 14, textDecoration: 'underline' }}>รายการยาที่ยืม</Text>

                <View style={[styles.table, { marginTop: 6 }]}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>รายการ</Text>
                        <Text style={styles.tableHeader}>จำนวน </Text>
                        <Text style={styles.tableHeader}>ราคา </Text>
                        <Text style={styles.tableHeader}>มูลค่า</Text>
                        <Text style={styles.tableHeader}>ผู้ผลิต</Text>
                        <Text style={styles.tableHeader}>วันที่ขอยืม </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{requestedMedicineName}</Text>
                        <Text style={styles.tableCell}>{requestedQuantity} {offeredMedicine.unit}</Text>
                        <Text style={styles.tableCell}>{offeredMedicine.pricePerUnit}</Text>
                        <Text style={styles.tableCell}>{requestedQuantity * offeredMedicine.pricePerUnit}</Text>
                        <Text style={styles.tableCell}>{offeredMedicine.manufacturer}</Text>
                        <Text style={styles.tableCell}>{formatDate(pdfData.requestTerm?.expectedReturnDate)}</Text>
                    </View>
                </View>

                <Text style={{ marginTop: 14, textDecoration: 'underline' }}>รายการยาที่คืน</Text>

                <View style={[styles.table, { marginTop: 6 }]}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableHeader}>รายการ</Text>
                        <Text style={styles.tableHeader}>จำนวน </Text>
                        <Text style={styles.tableHeader}>ราคาต่อหน่วย</Text>
                        <Text style={styles.tableHeader}>มูลค่า</Text>
                        <Text style={styles.tableHeader}>ผู้ผลิต</Text>
                        <Text style={styles.tableHeader}>วันที่คืน </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, {width: '20%'}]}>{returnMedicine.name}</Text>
                        <Text style={styles.tableCell}>{returnMedicine.returnAmount} ({returnMedicine.quantity})</Text>
                        <Text style={styles.tableCell}>{returnMedicine.pricePerUnit}</Text>
                        <Text style={styles.tableCell}>{returnMedicine.returnAmount * returnMedicine.pricePerUnit}</Text>
                        <Text style={styles.tableCell}>{returnMedicine.manufacturer}</Text>
                        <Text style={styles.tableCell}>{formatDate(returnMedicine.returnDate)}</Text>
                    </View>
                </View>

                <Text style={{
                    marginTop: 30, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%', }}>
                    จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป
                </Text>

                <Text style={{ marginTop: 30, textIndent: 280 }}>ขอแสดงความนับถือ</Text>
                <Text style={{ marginTop: 100, textIndent: 280 }}>ชื่อผู้อำนวยการ </Text>
                <Text style={{ textIndent: 280 }}>ผู้อำนวยการ {lendingHospitalNameTH}</Text>
                <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text>ติดต่อ</Text>
            </Page>
        </PDFDocGen>
    );
}


const ReturnPdfPreview = forwardRef(({ data: pdfData, returnData }: any, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument pdfData={{...pdfData, returnData}} />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, [pdfData, returnData]);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            const currentDate = new Date(); 
            const formattedDate = format(currentDate, 'ddMMyyyy');
            if (blob) {
                saveAs(blob, `return_document_${formattedDate}.pdf`);
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

ReturnPdfPreview.displayName = 'ReturnPdfPreview';
export default ReturnPdfPreview;