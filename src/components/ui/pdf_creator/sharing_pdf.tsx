/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Document as PDFDocGen, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { Document as PDFViewer, Page as PDFPage } from 'react-pdf';
import { saveAs } from 'file-saver';

import { pdfjs } from 'react-pdf';
// Thai date formatting helper (Buddhist calendar)
const formatThaiDate = (input: string | number | Date | undefined): string => {
    if (!input) return '';
    let date: Date;
    if (input instanceof Date) {
        date = input;
    } else if (typeof input === 'string') {
        date = isNaN(Number(input)) ? new Date(input) : new Date(Number(input));
    } else {
        date = new Date(input);
    }
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    }).format(date);
};

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
        flexWrap: 'wrap',
        maxWidth: '100%',
    },
    // section: { marginBottom: 10 }
});

function ContentPage({ pdfData, variant = 'original' }: any) {
    const { responseDetail, sharingMedicineDetail, userData } = pdfData;
    const { postingHospitalNameTH, sharingMedicine } = sharingMedicineDetail;
    const { respondingHospitalNameTH, acceptedOffer } = responseDetail;
    const { address, director, contact } = userData;

    const today = formatThaiDate(new Date());
    const mockNote = "รอการส่งมอบจากตัวแทนจำหน่าย  ";
    const expectedReturnDate = formatThaiDate(acceptedOffer.expectedReturnDate);

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
                    <Text style={[styles.tableCell, { flex: 1 }]}>{respondingHospitalNameTH} </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1, flexWrap: 'wrap', maxWidth: '100%' }]}>ที่อยู่ {address}   </Text>
                </View>
            </View>

            <Text style={{ textAlign: 'center' }} >{today}</Text>
            <Text style={styles.text}>เรื่อง    ขอยืมเวชภัณฑ์ยา</Text>
            <Text style={styles.text}>เรียน    ผู้อำนวยการ {postingHospitalNameTH}</Text>
            <Text style={{ marginTop: 6, textIndent: 80 }}>
                เนืื่องด้วย {respondingHospitalNameTH} มีความประสงค์ที่จะขอยืมยา ดังรายการต่อไปนี้
            </Text>

            <View style={[styles.table, { marginTop: 14 }]}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableHeader}>รายการ</Text>
                    <Text style={styles.tableHeader}>จำนวน </Text>
                    <Text style={styles.tableHeader}>วันกำหนดคืน </Text>
                    <Text style={styles.tableHeader}>หมายเหตุ</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{sharingMedicine.name} ({sharingMedicine.quantity})</Text>
                    <Text style={styles.tableCell}>{acceptedOffer.responseAmount} ({sharingMedicine.unit})</Text>
                    <Text style={styles.tableCell}>{expectedReturnDate}</Text>
                    <Text style={styles.tableCell}>{mockNote}</Text>
                </View>
            </View>

            <Text style={{ marginTop: 30, textIndent: 80 }}>
                ทั้งนี้{respondingHospitalNameTH}จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในวันที่กำหนด วันที่ {expectedReturnDate}
            </Text>
            <Text style={{ marginTop: 30, textIndent: 80 }}>
                จึงเรียนมาเพื่อโปรดพิจารณา และ{respondingHospitalNameTH} ขอขอบคุณ ณ โอกาสนี้
            </Text>

            <Text style={{ marginTop: 30, textIndent: 310 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 100, textIndent: 280 }}>{director} </Text>
            <Text style={{ textIndent: 280 }}>ผู้อำนวยการ {respondingHospitalNameTH}  </Text>
            <Text style={{ marginTop: 120 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
            <Text>ติดต่อ {contact}</Text>
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


const SharingPdfPreview = forwardRef(({ data: pdfData, userData }: any, ref) => {
    //console.log('sharingDatapdf', pdfData)
    // //console.log('user data at pdf preview', userData)
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument pdfData={{ ...pdfData, userData }} variant="original" />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
    }, [pdfData, userData]);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            (async () => {
                try {
                    const combinedBlob = await pdf(<DualDocument pdfData={{ ...pdfData, userData }} />).toBlob();
                    saveAs(combinedBlob, 'document.pdf');
                } catch (error) {
                    console.error('Failed to generate PDFs:', error);
                }
            })();
        },
    }));

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);
    const [viewportHeight, setViewportHeight] = useState<number>(
        typeof window !== 'undefined' ? window.innerHeight : 0
    );

    useEffect(() => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const updateWidth = () => setContainerWidth(element.clientWidth);

        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Maintain aspect ratio for A4 portrait: height ≈ width * sqrt(2)
    const A4_HEIGHT_PER_WIDTH = Math.SQRT2; // ~1.4142
    const maxWidthByHeight = viewportHeight
        ? Math.floor((viewportHeight * 0.85) / A4_HEIGHT_PER_WIDTH)
        : undefined;

    const widthCandidates = [containerWidth ?? undefined, maxWidthByHeight].filter(
        (v): v is number => typeof v === 'number' && isFinite(v) && v > 0
    );
    const computedWidth = widthCandidates.length > 0 ? Math.min(...widthCandidates) : undefined;

    return (
        <div className="w-full">
            <div ref={containerRef} className="w-full flex justify-center">
                {pdfUrl && (
                    <PDFViewer file={pdfUrl} key={pdfUrl}>
                        <PDFPage
                            pageNumber={1}
                            width={computedWidth}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                        />
                    </PDFViewer>
                )}
            </div>
        </div>
    );
});

SharingPdfPreview.displayName = 'SharingPdfPreview';
export default SharingPdfPreview;