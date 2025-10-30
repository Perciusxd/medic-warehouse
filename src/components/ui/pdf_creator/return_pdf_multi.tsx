/* eslint-disable jsx-a11y/alt-text */
'use client';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Document as PDFDocGen, Page, Text, View, StyleSheet, pdf, Font, Image } from '@react-pdf/renderer';
import { Document as PDFViewer, Page as PDFPage } from 'react-pdf';
import { saveAs } from 'file-saver';
import { pdfjs } from 'react-pdf';
import { format } from 'date-fns';

Font.register({
    family: 'THSarabunNew',
    src: '/fonts/Sarabun-Light.ttf',
});

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const styles = StyleSheet.create({
    // 1 cm ≈ 28.3465 pt
    // Requested: left 3cm (~85.04pt), top 1.5cm (~42.52pt), right 2cm (~56.69pt)
    // Bottom left as previous default (~28pt)
    body: {
        fontFamily: 'THSarabunNew',
        fontSize: 10,
        paddingTop: 42.52,
        paddingLeft: 85.04,
        paddingRight: 56.69,
        paddingBottom: 28,
    },
    image: { width: 80, height: 80, marginHorizontal: 170, marginVertical: 0 },
    text: { marginBottom: 8 },
    table: { display: 'flex', width: 'auto' },
    tableRow: { flexDirection: 'row' },
    tableHeader: { width: '25%', padding: 4, fontWeight: 'bold' },
    tableCell: { width: '25%', padding: 4 },
    // Thin borders to be applied ONLY on the main 5-column table
    tableThin: { borderWidth: 0.5, borderColor: '#000', borderStyle: 'solid' },
    rowThin: { borderBottomWidth: 0.5, borderColor: '#000', borderStyle: 'solid' },
    cellThin: { borderRightWidth: 0.5, borderColor: '#000', borderStyle: 'solid' },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 20, paddingLeft: 85.04 },
});

function toThaiNumerals(num: number): string {
    return String(num).replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

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

function normalizeReturnList(raw: any): any[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map((item: any) => (item && item.returnMedicine ? item.returnMedicine : item));
}

function ContentPage({ pdfData, returnList, variant = 'original' }: any) {
    //console.log('pdfData', pdfData);
    const { userData } = pdfData;
    const { address } = userData;
    const baseMedicine = pdfData?.offeredMedicine
        ?? pdfData?.sharingDetails?.sharingMedicine
        ?? pdfData?.sharingMedicine
        ?? {};

    const lendingHospitalNameTH = pdfData?.postingHospitalNameTH
        ?? pdfData?.sharingDetails?.postingHospitalNameTH
        ?? pdfData?.postingHospitalNameEN
        ?? '';
    const borrowingHospitalNameTH = pdfData?.respondingHospitalNameTH
        ?? pdfData?.respondingHospitalNameEN
        ?? pdfData?.sharingDetails?.respondingHospitalNameTH
        ?? '';

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
    const quantity = baseMedicine?.quantity ?? '';
    const pricePerUnit = baseMedicine?.pricePerUnit ?? 0;
    const manufacturer = baseMedicine?.manufacturer ?? '';
    const createdAt = pdfData?.createdAt ?? '';

    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, 'dd/MM')}/${todayDate.getFullYear() + 543}`);

    return (
        <>
            {variant === 'original' ? (
                <Image style={styles.image} src="/krut_mark.jpg" />
            ) : (
                <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 40 }}>สำเนา </Text>
            )}

            <View style={[styles.table, { marginBottom: 10 }]}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{toThaiDigits('ที่ สข. 80231')}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>{borrowingHospitalNameTH} </Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>ที่อยู่ {toThaiDigits(address ?? '')}     </Text>
                </View>
            </View>

            <Text style={{ textAlign: 'center' }}>{today}</Text>
            <Text style={styles.text}>เรื่อง    ขอคืนเวชภัณฑ์ยา</Text>
            <Text style={styles.text}>เรียน    ผู้อำนวยการ {lendingHospitalNameTH}</Text>
            <Text style={{ marginTop: 6, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>
                เนื่องด้วย {borrowingHospitalNameTH} มีความประสงค์ที่จะขอคืนยาเวชภัณฑ์ยา จำนวน {formatThaiNumber(Number(requestedQuantity))} รายการ โดยรายละเอียดดังต่อไปนี้
            </Text>

            <View style={[styles.table, styles.tableThin, { marginTop: 12 }]}> 
                {/* Header Row: ลำดับ, รายการ, จำนวน, ราคาต่อหน่วย, ราคารวม */}
                <View style={[styles.tableRow, styles.rowThin]}> 
                    <Text style={[styles.tableHeader, styles.cellThin, { width: '10%' }]}>ลำดับ  </Text>
                    <Text style={[styles.tableHeader, styles.cellThin, { width: '40%' }]}>รายการ</Text>
                    <Text style={[styles.tableHeader, styles.cellThin, { width: '15%' }]}>จำนวน  </Text>
                    <Text style={[styles.tableHeader, styles.cellThin, { width: '15%' }]}>ราคาต่อหน่วย</Text>
                    <Text style={[styles.tableHeader, { width: '20%' }]}>ราคารวม</Text>
                </View>

                {/* Section: รายการยาที่ยืม */}
                <View style={[styles.tableRow, styles.rowThin]}> 
                    <Text style={[styles.tableCell, styles.cellThin, { width: '10%' }]}></Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '40%', fontWeight: 'bold', textDecoration: 'underline' }]}>รายการยาที่ยืม</Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}></Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}></Text>
                    <Text style={[styles.tableCell, { width: '20%' }]}></Text>
                </View>

                {/* Borrowed item row (No. 1) */}
                <View style={[styles.tableRow, styles.rowThin]}> 
                    <Text style={[styles.tableCell, styles.cellThin, { width: '10%' }]}>{toThaiNumerals(1)}</Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '40%' }]}> 
                        {requestedMedicineName} {quantity}
                        {manufacturer ? `\nผู้ผลิต: ${manufacturer}` : ''}
                        {/* {(() => {
                            const lot = (baseMedicine as any)?.batchNumber ?? '';
                            return lot ? `\nล็อต: ${toThaiDigits(lot)}` : '';
                        })()}
                        {(() => {
                            const exp = (baseMedicine as any)?.expiryDate ?? (baseMedicine as any)?.expiredDate ?? '';
                            const formatted = formatThaiDateFromAny(exp);
                            return formatted ? `\nวันหมดอายุ: ${formatted}` : '';
                        })()} */}
                    </Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}>{formatThaiNumber(Number(requestedQuantity))} {unit ? toThaiDigits(unit) : ''}</Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}>{formatThaiNumber(Number(pricePerUnit ?? 0))} บาท  </Text>
                    <Text style={[styles.tableCell, { width: '20%' }]}>{formatThaiNumber(Number(requestedQuantity) * Number(pricePerUnit ?? 0))} บาท </Text>
                </View>

                {/* Section: รายการยาที่คืน */}
                <View style={[styles.tableRow, styles.rowThin]}> 
                    <Text style={[styles.tableCell, styles.cellThin, { width: '10%' }]}></Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '40%', fontWeight: 'bold', textDecoration: 'underline' }]}>รายการยาที่คืน</Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}></Text>
                    <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}></Text>
                    <Text style={[styles.tableCell, { width: '20%' }]}></Text>
                </View>

                {returnList.map((item: any, index: number) => {
                    const name = item?.name ?? requestedMedicineName;
                    const amount = Number(item?.returnAmount ?? 0);
                    const q = item?.quantity ?? quantity;
                    const u = item?.unit ?? unit;
                    const ppu = Number(item?.pricePerUnit ?? pricePerUnit ?? 0);
                    const total = Number(amount * ppu);
                    return (
                        <View style={[styles.tableRow, styles.rowThin]} key={index}> 
                            <Text style={[styles.tableCell, styles.cellThin, { width: '10%' }]}>{toThaiNumerals(index + 2)}</Text>
                            <Text style={[styles.tableCell, styles.cellThin, { width: '40%' }]}> 
                                {name} {q}
                                {(() => {
                                    const manu = (item?.manufacturer ?? manufacturer ?? '') as string;
                                    return manu ? `\nผู้ผลิต ${manu}` : '';
                                })()}
                                {(() => {
                                    const lot = (item?.batchNumber ?? (item as any)?.lotNumber ?? '') as string;
                                    return lot ? `\nล็อต ${toThaiDigits(lot)}` : '';
                                })()}
                                {(() => {
                                    const exp = (item as any)?.expiryDate ?? (item as any)?.expiredDate ?? (item as any)?.expireDate ?? (item as any)?.expiry ?? '';
                                    const formatted = formatThaiDateFromAny(exp);
                                    return formatted ? `\nวันหมดอายุ ${formatted}` : '';
                                })()}
                            </Text>
                            <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}>{formatThaiNumber(amount)} {u ? toThaiDigits(u) : ''}</Text>
                            <Text style={[styles.tableCell, styles.cellThin, { width: '15%' }]}>{formatThaiNumber(ppu)} บาท  </Text>
                            <Text style={[styles.tableCell, { width: '20%' }]}>{formatThaiNumber(total)} บาท  </Text>
                        </View>
                    );
                })}
            </View>

            <Text style={{ marginTop: 30, textIndent: 80, flexWrap: 'wrap', maxWidth: '100%' }}>จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป   </Text>

            <Text style={{ marginTop: 30, textAlign: 'center', marginLeft: 50 }}>ขอแสดงความนับถือ</Text>
            <Text style={{ marginTop: 100, textAlign: 'center', marginLeft: 50 }}>ผู้อำนวยการ{pdfData?.userData?.director ?? ''} </Text>
            <Text style={{ textAlign: 'center', marginLeft: 50 }}>ผู้อำนวยการ{borrowingHospitalNameTH}   </Text>
            <View style={styles.footer} fixed>
                <Text>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text>ติดต่อ {toThaiDigits(pdfData?.userData?.contact ?? '')}</Text>
            </View>
        </>
    );
}

function MyDocument({ pdfData, returnList, variant = 'original' }: any) {
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} returnList={returnList} variant={variant} />
            </Page>
        </PDFDocGen>
    );
}

function DualDocument({ pdfData, returnList }: any) {
    return (
        <PDFDocGen>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} returnList={returnList} variant="original" />
            </Page>
            <Page size="A4" style={styles.body}>
                <ContentPage pdfData={pdfData} returnList={returnList} variant="copy" />
            </Page>
        </PDFDocGen>
    );
}

const ReturnPdfMultiPreview = forwardRef(({ data: pdfData, returnList: rawReturnList, userData }: any, ref) => {
    const [blob, setBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const list = normalizeReturnList(rawReturnList);

    useEffect(() => {
        let cancelled = false;
        const generatePdf = async () => {
            const generatedBlob = await pdf(<MyDocument pdfData={{ ...pdfData, userData }} returnList={list} />).toBlob();
            if (!cancelled) {
                setBlob(generatedBlob);
                setPdfUrl(URL.createObjectURL(generatedBlob));
            }
        };
        generatePdf();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(pdfData), JSON.stringify(list), JSON.stringify(userData)]);

    useImperativeHandle(ref, () => ({
        savePdf: () => {
            (async () => {
                try {
                    const currentDate = new Date();
                    const formattedDate = format(currentDate, 'ddMMyyyy');
                    const combinedBlob = await pdf(<DualDocument pdfData={{ ...pdfData, userData }} returnList={list} />).toBlob();
                    saveAs(combinedBlob, `return_document_${formattedDate}.pdf`);
                } catch (error) {
                    console.error('Failed to generate return PDFs (multi):', error);
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

ReturnPdfMultiPreview.displayName = 'ReturnPdfMultiPreview';
export default ReturnPdfMultiPreview;


