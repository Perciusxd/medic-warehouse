/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Document as PDFDocGen, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { Document as PDFViewer, Page as PDFPage } from 'react-pdf';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { pdfjs } from 'react-pdf';

Font.register({
    family: 'TH SarabunPSK',
    src: '/fonts/thsarabun.ttf',
})

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const cm = (value: number) => value * 28.3464567;

const styles = StyleSheet.create({
    body: {},
    image: { width: 80, height: 80, alignSelf: 'center' },
    page: {
        fontFamily: 'TH SarabunPSK',
        fontSize: 16,
        size: 'A4',
        paddingTop: cm(1.5),
        paddingLeft: cm(3),
        paddingRight: cm(2),
        paddingBottom: cm(2),
    },
    coppy_page: {
        fontFamily: 'TH SarabunPSK',
        fontSize: 16,
        size: 'A4',
        paddingTop: cm(1.5),
        paddingLeft: cm(3),
        paddingRight: cm(2),
        paddingBottom: cm(2),
    },
    title: {
        marginBottom: 15,
        textAlign: "center",
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 2,
    },
    table: {
        display: 'flex',
        width: 'auto',
        justifyContent: 'center'
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        width: '25%',
        padding: 2,
        fontWeight: 'bold',
    },
    tableCell: {
        width: '25%',
        padding: 2,
        flexWrap: 'wrap',
        maxWidth: '100%',
    },
    text: {
        marginBottom: 2
    },
});

function toThaiDigits(input: string | number): string {
    const s = typeof input === 'number' ? String(input) : String(input ?? '');
    return s.replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

function formatThaiNumber(n: number): string {
    try {
        return new Intl.NumberFormat('th-TH-u-nu-thai').format(n);
    } catch {
        return toThaiDigits(Number(n).toLocaleString('th-TH'));
    }
}

function formatThaiDateFromAny(input: any): string {
    if (!input && input !== 0) return '';
    const n = Number(input);
    const d = new Date(isNaN(n) ? input : n);
    if (isNaN(d.getTime())) return '';
    return toThaiDigits(`${format(d, 'dd/MM')}/${d.getFullYear() + 543}`);
}

function PdfContent({ documentData, userdata, docType, variant = 'original' }: { documentData: any[], docType: string, userdata: any, variant?: 'original' | 'copy' }) {
    const lendingHospitalNameTH = userdata?.name || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const lendingHospitalAddress = userdata?.address || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const contact = userdata?.contact || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const director = userdata?.director || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const documentType = docType === "normalReturn" ? "เอกสารขอยืม" : "เอกสารขอสนับสนุน";
    const datacount = documentData.length;
    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, 'dd/MM')}/${todayDate.getFullYear() + 543}`);

    const borrowingHospitalNameTH = documentData.length > 0 ? documentData[0].SharingHospital : "ไม่ทราบโรงพยาบาล";
    const description = documentData.length > 0
        ? documentData.map(item => item.Description).join(' และ ')
        : "ไม่ทราบเหตุผล";

    const expectedReturnDate = documentData.length > 0
        ? documentData
            .map(item => {
                if (!item.ExpectedReturnDate) {
                    return "ไม่มีวันที่";
                }
                const timestamp = parseInt(item.ExpectedReturnDate, 10);
                if (isNaN(timestamp)) {
                    return "ข้อมูลวันที่ผิดพลาด";
                }
                const date = new Date(timestamp);
                return date.toLocaleDateString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            })
            .join(', ')
        : "ไม่ทราบเหตุผล";

    return (
        <>
            {variant === 'original' ? (
                <Image style={styles.image} src="/krut_mark.jpg" />
            ) : (
                <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 43 }}>สำเนา </Text>
            )}

            <View style={[styles.table, { marginBottom: 10 }]}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{toThaiDigits('ที่ สข. 80231')}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>โรงพยาบาล{lendingHospitalNameTH} </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1, flexWrap: 'wrap', maxWidth: '100%' }]}>ที่อยู่  {toThaiDigits(lendingHospitalAddress ?? '')} <span style={{ display: 'none' }}>hidden</span></Text>
                </View>
            </View>

            <Text style={{ textAlign: 'center' }} >{today}</Text>
            <Text style={styles.text}>เรื่อง    {documentType}</Text>
            <Text style={styles.text}>เรียน    ผู้อำนวยการ {borrowingHospitalNameTH}</Text>
            {docType === "normalReturn" && (
                <div>
                    <Text style={{ marginTop: 5, textIndent: 80 }}>
                        เนื่องด้วย โรงพยาบาล{lendingHospitalNameTH} มีความประสงค์จะขอยืมเวชภัณฑ์ยา จำนวน {formatThaiNumber(Number(datacount))} รายการ เนื่องจาก {description} ดังรายละเอียดต่อไปนี้
                    </Text>
                    <View style={[styles.table, { marginTop: 14 }]} >
                        <View style={[styles.tableRow, { justifyContent: 'space-between' }]}>
                            <Text style={[styles.tableHeader, { width: 20 }]}>ลำดับ</Text>
                            <Text style={[styles.tableHeader, { width: '50%', }]}>รายการ</Text>
                            <Text style={styles.tableHeader}>จำนวน </Text>
                        </View>
                        {documentData.map((item, index) => (
                            <View style={[styles.tableRow, { justifyContent: 'space-between' }]} key={index} >
                                <Text style={[styles.tableCell, { width: 20 }]}>{formatThaiNumber(index + 1)}</Text>
                                <Text style={[styles.tableCell, { width: '50%', }]}>{item.Medname} {toThaiDigits(item.Quantity)} </Text>
                                <Text style={styles.tableCell}>{formatThaiNumber(Number(item.Amount))} {item.Unit ? toThaiDigits(item.Unit) : ''}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ marginTop: 20, textIndent: 80 }}>
                        ทั้งนี้ โรงพยาบาล{lendingHospitalNameTH} จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในเวลาที่ {toThaiDigits(expectedReturnDate)}
                    </Text>
                    <Text style={{ marginTop: 5, textIndent: 80 }}>
                        จึงเรียนมาเพื่อโปรดพิจารณา และ{borrowingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้
                    </Text>
                </div>
            )}
            {docType === "supportReturn" && (
                <div>
                    <Text style={{ marginTop: 5, textIndent: 80 }}>
                        เนื่องด้วย โรงพยาบาล{lendingHospitalNameTH} มีความประสงค์จะขอสนับสนุนเวชภัณฑ์ยา จำนวน {formatThaiNumber(Number(datacount))}รายการ โดยการ {description} โดยมีรายละเอียดดังต่อไปนี้
                    </Text>
                    <View style={[styles.table, { marginTop: 14 }]} >
                        <View style={[styles.tableRow, { justifyContent: 'space-between' }]}>
                            <Text style={[styles.tableHeader, { width: 20 }]}>ลำดับ</Text>
                            <Text style={[styles.tableHeader, { width: '50%', }]}>รายการ</Text>
                            <Text style={styles.tableHeader}>จำนวน </Text>
                        </View>
                        {documentData.map((item, index) => (
                            <View style={[styles.tableRow, { justifyContent: 'space-between' }]} key={index} >
                                <Text style={[styles.tableCell, { width: 20 }]}>{formatThaiNumber(index + 1)}</Text>
                                <Text style={[styles.tableCell, { width: '50%', }]}>{item.Medname} {toThaiDigits(item.Quantity)} </Text>
                                <Text style={styles.tableCell}>{formatThaiNumber(Number(item.Amount))} {item.Unit ? toThaiDigits(item.Unit) : ''}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ marginTop: 20, textIndent: 80 }}>
                        จึงเรียนมาเพื่อโปรดพิจารณา และโรงพยาบาล{lendingHospitalNameTH} ขอขอบคุณมา ณ โอกาสนี้
                    </Text>
                </div>
            )}
            <View style={{
                alignSelf: 'flex-end',
                width: '50%',
                maxWidth: 200,
                flexDirection: 'column',
                textAlign: 'center',
                marginTop: 20,
            }}>
                <Text>ขอแสดงความนับถือ</Text>
                <Text style={{ marginTop: 50 }}>.......................................................................</Text>
                <Text>( {director} ) </Text>
                <Text>ตำแหน่งผู้มีอำนาจลงนาม โรงพยาบาล{lendingHospitalNameTH}</Text>
            </View>

            <div>
                <Text >กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text>ติดต่อ {contact}</Text>
            </div>
        </>
    );
}

function MyDocument({ documentData, userdata, docType, variant = 'original' }: any) {
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.page}>
                <PdfContent documentData={documentData} docType={docType} userdata={userdata} variant={variant} />
            </Page>
        </PDFDocGen>
    );
}

function DualDocument({ documentData, userdata, docType }: any) {
    const chunkSize = 3;
    const chunkedData = [];
    for (let i = 0; i < documentData.length; i += chunkSize) {
        chunkedData.push(documentData.slice(i, i + chunkSize));
    }

    return (
        <PDFDocGen>
            {chunkedData.map((group, pageIndex) => (
                <React.Fragment key={`original-${pageIndex}`}>
                    <Page size="A4" style={styles.page}>
                        <PdfContent
                            documentData={group}
                            docType={docType}
                            userdata={userdata}
                            variant="original"
                        />
                    </Page>
                    <Page size="A4" style={styles.coppy_page}>
                        <PdfContent
                            documentData={group}
                            docType={docType}
                            userdata={userdata}
                            variant="copy"
                        />
                    </Page>
                </React.Fragment>
            ))}
        </PDFDocGen>
    );
}

const NewRequestPdfPreview = forwardRef(({ data: sharingMed, userData }: any, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Transform sharingMed data to match the format expected by new_request_pdf
    const transformedData = React.useMemo(() => {
        if (!sharingMed) return [];
        
        const sharingDetails = sharingMed.sharingDetails;
        const sharingMedicine = sharingMed.offeredMedicine 
            ? sharingMed.sharingMedicine 
            : sharingDetails?.sharingMedicine;
        const acceptedOffer = sharingMed.acceptedOffer || sharingMed.offeredMedicine;
        const returnTerm = sharingMed.returnTerm || sharingMed.sharingReturnTerm;

        return [{
            SharingHospital: sharingDetails?.postingHospitalNameTH ?? "ไม่ทราบโรงพยาบาล",
            Medname: sharingMedicine?.name ?? "ไม่ทราบชื่อยา",
            Amount: acceptedOffer?.responseAmount ?? acceptedOffer?.offerAmount ?? "ไม่ทราบจำนวน",
            ExpectedReturnDate: acceptedOffer?.expectedReturnDate ?? "ไม่ทราบวันที่คืน",
            Unit: sharingMedicine?.unit ?? "ไม่ทราบหน่วย",
            Quantity: sharingMedicine?.quantity ?? "ไม่ทราบขนาด",
            Description: acceptedOffer?.description ?? "ไม่ทราบเหตุผล",
            SupportType: returnTerm?.supportType ?? returnTerm?.returnType ?? "normalReturn",
        }];
    }, [sharingMed]);

    const docType = React.useMemo(() => {
        if (!sharingMed) return "normalReturn";
        const returnTerm = sharingMed.returnTerm || sharingMed.sharingReturnTerm;
        return returnTerm?.returnType === "supportReturn" ? "supportReturn" : "normalReturn";
    }, [sharingMed]);

    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            try {
                const generatedBlob = await pdf(
                    <MyDocument 
                        documentData={transformedData} 
                        userdata={userData} 
                        docType={docType} 
                        variant="original" 
                    />
                ).toBlob();
                if (!cancelled) {
                    setBlob(generatedBlob);
                    setPdfUrl(URL.createObjectURL(generatedBlob));
                }
            } catch (error) {
                console.error('Failed to generate PDF preview:', error);
            }
        };
        
        if (transformedData.length > 0 && userData) {
            generatePdf();
        }
        
        return () => {
            cancelled = true;
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [transformedData, userData, docType]);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            (async () => {
                try {
                    const combinedBlob = await pdf(
                        <DualDocument 
                            documentData={transformedData} 
                            userdata={userData} 
                            docType={docType} 
                        />
                    ).toBlob();
                    saveAs(combinedBlob, 'request_document.pdf');
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

    const A4_HEIGHT_PER_WIDTH = Math.SQRT2;
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

NewRequestPdfPreview.displayName = 'NewRequestPdfPreview';
export default NewRequestPdfPreview;

