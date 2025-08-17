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

function ContentPage({ pdfData, variant = 'original' }: any) {
    const { userData } = pdfData;
    const baseMedicine = pdfData?.offeredMedicine
        ?? pdfData?.sharingDetails?.sharingMedicine
        ?? pdfData?.sharingMedicine
        ?? {};

    const returnData = pdfData?.returnData ?? {};
    const returnMedicine = returnData?.returnMedicine ?? {};

    const receiveConditions = pdfData?.offeredMedicine?.returnConditions
        ?? pdfData?.returnTerm
        ?? pdfData?.sharingDetails?.sharingReturnTerm?.receiveConditions
        ?? {};

    const selectedReturnType = returnData?.returnType
        ?? (receiveConditions?.exactType ? 'exactType'
            : receiveConditions?.otherType ? 'otherType'
                : receiveConditions?.supportType ? 'supportType'
                    : receiveConditions?.subType ? 'subType'
                        : 'exactType');

    const returnTerm = selectedReturnType === 'exactType'
        ? 'ส่งคืนตามประเภท'
        : selectedReturnType === 'otherType'
            ? 'คืนรายการอื่น'
            : selectedReturnType === 'supportType'
                ? 'แบบสนับสนุน'
                : 'คืนรายการทดแทน';

    const selectedResponseId = pdfData?.responseId;
    const respondingFromArray = (() => {
        const list = pdfData?.responseDetails;
        if (selectedResponseId && Array.isArray(list)) {
            const detail = list.find((item: any) => item.id === selectedResponseId);
            return detail?.respondingHospitalNameTH ?? detail?.respondingHospitalNameEN;
        }
        return undefined;
    })();

    const lendingHospitalNameTH = pdfData?.postingHospitalNameTH
        ?? pdfData?.sharingDetails?.postingHospitalNameTH
        ?? pdfData?.postingHospitalNameEN
        ?? '';
    const lendingHospitalAddress = "15 ถนนกาญจนวณิชย์ ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110  ";
    const borrowingHospitalNameTH = respondingFromArray
        ?? pdfData?.respondingHospitalNameTH
        ?? pdfData?.respondingHospitalNameEN
        ?? pdfData?.sharingDetails?.respondingHospitalNameTH
        ?? '';

    const isRequestType = pdfData?.ticketType === "request" || !!pdfData?.requestDetails || !!pdfData?.requestMedicine;

    const requestedMedicineName = pdfData?.requestDetails?.name
        ?? pdfData?.requestMedicine?.name
        ?? pdfData?.sharingDetails?.sharingMedicine?.name
        ?? pdfData?.sharingMedicine?.name
        ?? baseMedicine?.name
        ?? '';

    const requestedQuantity = pdfData?.offeredMedicine?.offerAmount
        ?? pdfData?.acceptedOffer?.responseAmount
        ?? 0;

    const unit = baseMedicine?.unit ?? '';
    const pricePerUnit = baseMedicine?.pricePerUnit ?? 0;
    const manufacturer = baseMedicine?.manufacturer ?? '';

    const expectedReturnDate = pdfData?.requestTerm?.expectedReturnDate
        ?? pdfData?.acceptedOffer?.expectedReturnDate
        ?? pdfData?.sharingReturnTerm?.expectedReturnDate
        ?? undefined;

    const resolveSupport = (v: any): boolean => {
        if (typeof v === 'string') return v === 'support';
        if (typeof v === 'boolean') return v;
        return false;
    };
    const isSupport = resolveSupport(pdfData?.returnData?.supportRequest ?? pdfData?.supportRequest);
    const documentType = isSupport
        ? 'ขอสนับสนุนเวชภัณฑ์ยา'
        : 'ขอคืนเวชภัณฑ์ยา';

    const todayDate = new Date();
    const today = `${format(todayDate, 'dd/MM')}/${todayDate.getFullYear() + 543}`;

    return (
        <>
            {variant === 'original' ? (
                <Image style={styles.image} src="/krut_mark.jpg" />
            ) : (
                <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 40 }}>สำเนา </Text>
            )}
            <View style={[styles.table, { marginBottom: 10 }]}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>ที่ สข. 80231</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{lendingHospitalNameTH} </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>ที่อยู่ {userData.address}</Text>
                </View>
            </View>

            <Text style={{ textAlign: 'center' }} >{today}</Text>
            <Text style={styles.text}>เรื่อง    {documentType}</Text>
            <Text style={styles.text}>เรียน    ผู้อำนวยการ {borrowingHospitalNameTH}</Text>

            {isSupport ? (
                <Text style={{ marginTop: 6, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>
                    เนื่องด้วย {lendingHospitalNameTH} มีความประสงค์จะขอสนับสนุนแทนการส่งคืนยาเนื่องจาก{returnMedicine?.reason ?? ''} ดังรายการต่อไปนี้
                </Text>
            ) : (
                <Text style={{ marginTop: 6, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>
                    เนื่องด้วย {lendingHospitalNameTH} มีความประสงค์ที่จะขอคืนยา ซึ่งเป็นการคืนยา{returnTerm} ดังรายการต่อไปนี้
                </Text>
            )}

            <Text style={{ marginTop: 14, textDecoration: 'underline' }}>รายการยาที่ยืม</Text>

            <View style={[styles.table, { marginTop: 6 }]}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableHeader, { width: '25%' }]}>รายการ</Text>
                    <Text style={[styles.tableHeader, { width: '15%' }]}>จำนวน </Text>
                    <Text style={[styles.tableHeader, { width: '10%' }]}>ราคา </Text>
                    <Text style={[styles.tableHeader, { width: '15%' }]}>มูลค่า</Text>
                    <Text style={[styles.tableHeader, { width: '15%' }]}>ผู้ผลิต</Text>
                    <Text style={[styles.tableHeader, { width: '20%' }]}>วันที่ขอยืม </Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{requestedMedicineName}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>{requestedQuantity} ({unit})</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>{Number(pricePerUnit).toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>{Number(requestedQuantity * pricePerUnit).toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>{manufacturer}</Text>
                    <Text style={[styles.tableCell, { width: '20%' }]}>{(() => {
                        if (!pdfData?.createdAt) return '';
                        const d = new Date(Number(pdfData?.createdAt));
                        if (isNaN(d.getTime())) return '';
                        return `${format(d, 'dd/MM')}/${d.getFullYear() + 543}`;
                    })()}</Text>
                </View>
            </View>

            {!isSupport && (
                <View style={[styles.table, { marginTop: 6 }]}>
                    <Text style={{ marginTop: 14, textDecoration: 'underline' }}>รายการยาที่คืน</Text>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { width: '25%' }]}>รายการ</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>จำนวน </Text>
                        <Text style={[styles.tableHeader, { width: '10%' }]}>ราคา</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>มูลค่า</Text>
                        <Text style={[styles.tableHeader, { width: '15%' }]}>ผู้ผลิต</Text>
                        <Text style={[styles.tableHeader, { width: '20%' }]}>วันหมดอายุ </Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '25%' }]}>{returnMedicine?.name ?? ''}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{(returnMedicine?.returnAmount ?? 0)} ({returnMedicine?.quantity ?? ''})</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>{Number(returnMedicine?.pricePerUnit ?? 0).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{Number((returnMedicine?.returnAmount ?? 0) * (returnMedicine?.pricePerUnit ?? 0)).toFixed(2)}</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>{returnMedicine?.manufacturer ?? ''}</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>{(() => {
                            if (!returnMedicine?.returnDate) return '';
                            const d = new Date(Number(returnMedicine.returnDate));
                            const lotNumber = returnMedicine?.batchNumber ?? '';
                            if (isNaN(d.getTime())) return '';
                            return `${format(d, 'dd/MM')}/${d.getFullYear() + 543} (${lotNumber})`;
                        })()}</Text>
                    </View>
                </View>
            )}

            {isSupport ? (
                <Text style={{ marginTop: 14, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>จึงเรียนมาเพื่อพิจารณาดำเนินการหักจากงบประมาณ{lendingHospitalNameTH} และ{borrowingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้</Text>
            ) : (
                <Text style={{ marginTop: 30, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%', }}>จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป <p>hidden</p></Text>
            )}

            <Text style={{ marginTop: 30, textIndent: 350 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 100, textIndent: 310 }}>ผู้อำนวยการ{userData.director} </Text>
            <Text style={{ textIndent: 310 }}>ผู้อำนวยการ{lendingHospitalNameTH}   </Text>
            <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
            <Text>ติดต่อ {userData.contact}   </Text>
        </>
    );
}

function MyDocument({ pdfData, variant = 'original' }: any) {
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} variant={variant} />
            </Page>
        </PDFDocGen>
    );
}

function DualDocument({ pdfData }: any) {
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} variant="original" />
            </Page>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} variant="copy" />
            </Page>
        </PDFDocGen>
    );
}


const ReturnPdfPreview = forwardRef(({ data: pdfData, returnData, userData }: any, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument pdfData={{ ...pdfData, returnData, userData }} />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, [pdfData, returnData, userData]);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            (async () => {
                try {
                    const currentDate = new Date();
                    const formattedDate = format(currentDate, 'ddMMyyyy');
                    const combinedBlob = await pdf(<DualDocument pdfData={{ ...pdfData, userData, returnData }} />).toBlob();
                    saveAs(combinedBlob, `return_document_${formattedDate}.pdf`);
                } catch (error) {
                    console.error('Failed to generate return PDFs:', error);
                }
            })();
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