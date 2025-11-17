/* eslint-disable jsx-a11y/alt-text */
// components/requete_pdf.tsx
"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { format } from 'date-fns';
Font.register({
    family: 'TH SarabunPSK',
    src: '/fonts/thsarabun.ttf',
})
// style พื้นฐาน
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
        // fontSize: 18,
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
        // fontSize: 14,
        // borderStyle: 'solid',
        // borderWidth: 1,
        // borderRightWidth: 0,
        // borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
       
        // fontSize: 14,
    },
    tableHeader: {
        width: '25%',
        // borderStyle: 'solid',
        // borderBottomWidth: 1,
        // borderRightWidth: 1,
        padding: 2,
        fontWeight: 'bold',
        // fontSize: 14,
    },
    tableCell: {
        width: '25%',
        // borderStyle: 'solid',
        // borderBottomWidth: 1,
        // borderRightWidth: 1,
        padding: 2,
        flexWrap: 'wrap',
        maxWidth: '100%',
        // fontSize: 14,
    },
    text: {
        marginBottom: 2
    },
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



// PDF Layout
export function Pdfcontent({ documentData, userdata, docType, variant = 'original' }: { documentData: any[], docType: string, userdata: any, variant?: 'original' | 'copy' }) {

    const lendingHospitalNameTH = userdata?.name || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const lendingHospitalAddress = userdata?.address || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const contact = userdata?.contact || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const director = userdata?.director || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const documentType = docType === "normalReturn" ? "เอกสารขอยืม" : " เอกสารขอสนับสนุน";
    const datacount = documentData.length
    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, 'dd/MM')}/${todayDate.getFullYear() + 543}`);
    const mockNote = "วันที่ได้แจ้งไว้";
    console.log("Document Data in PDF:", userdata);
    const borrowingHospitalNameTH =
        documentData.length > 0
            ? documentData[0].SharingHospital
            : "ไม่ทราบโรงพยาบาล";
    const description = documentData.length > 0
        ? documentData
            .map(item => item.Description)
            .join(' และ ')
        : "ไม่ทราบเหตุผล";



    const expectedReturnDate = documentData.length > 0
        ? documentData
            .map(item => {
                // 1. ตรวจสอบว่ามีข้อมูลหรือไม่
                if (!item.ExpectedReturnDate) {
                    return "ไม่มีวันที่";
                }

                // 2. แปลงข้อความ timestamp ให้เป็นตัวเลข (สำคัญที่สุด)
                const timestamp = parseInt(item.ExpectedReturnDate, 10);

                // 3. ตรวจสอบว่าแปลงเป็นตัวเลขได้หรือไม่
                if (isNaN(timestamp)) {
                    return "ข้อมูลวันที่ผิดพลาด";
                }

                // 4. สร้าง Date object จาก timestamp ที่เป็นตัวเลข
                const date = new Date(timestamp);

                // 5. จัดรูปแบบวันที่
                return date.toLocaleDateString('th-TH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            })
            .join(', ')
        : "ไม่ทราบเหตุผล";
    //console.log('docType', docType)
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

                        เนื่องด้วย โรงพยาบาล{lendingHospitalNameTH} มีความประสงค์จะขอยืมเวชภัณฑ์ยา จำนวน {formatThaiNumber(Number(datacount))} รายการ {description ? `เนื่องจาก${description}` : ''} ดังรายละเอียดต่อไปนี้
                    </Text>
                    {/* description ไม่ได้บังคับให้กรอกใช่เช็คไว้นะว่าไม่กรอกให้ซ่อน */}
                    <View style={[styles.table, { marginTop: 14 }]} >
                        <View style={[styles.tableRow, { justifyContent: 'space-between' }]}>
                            <Text style={[styles.tableHeader, { width: 20 }]}>ลำดับ</Text>
                            <Text style={[styles.tableHeader, { width: '50%', }]}>รายการ</Text>
                            <Text style={styles.tableHeader}>จำนวน </Text>
                            {/* <Text style={styles.tableHeader}>วันกำหนดคืน </Text> */}
                            {/* <Text style={styles.tableHeader}>หมายเหตุ</Text> */}
                        </View>
                        {documentData.map((item, index) => (
                            <View style={[styles.tableRow, { justifyContent: 'space-between' }]} key={index} >
                                <Text style={[styles.tableCell, { width: 20 }]}>{formatThaiNumber(index + 1)}</Text>
                                <Text style={[styles.tableCell, { width: '50%', }]}>{item.Medname} {toThaiDigits(item.Quantity)} </Text>
                                <Text style={styles.tableCell}>{formatThaiNumber(Number(item.Amount))} {item.unit ? toThaiDigits(item.unit) : ''}</Text>
                                {/* <Text style={styles.tableCell}>{item.ExpectedReturnDate}</Text>
                        <Text style={styles.tableCell}>{item.Description || "—"}</Text> */}
                            </View>
                        ))}
                    </View>
                    <Text style={{ marginTop: 20, textIndent: 80 }}>
                        ทั้งนี้ โรงพยาบาล{lendingHospitalNameTH} จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในวันที่ {toThaiDigits(expectedReturnDate)}
                    </Text>
                    <Text style={{ marginTop: 5, textIndent: 80 }}>
                        จึงเรียนมาเพื่อโปรดพิจารณา และ{lendingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้
                    </Text>
                </div>
            )}
            {docType === "supportReturn" && (
                <div>
                    <Text style={{ marginTop: 5, textIndent: 80 }}>

                        เนื่องด้วย โรงพยาบาล{lendingHospitalNameTH} มีความประสงค์จะขอสนับสนุนเวชภัณฑ์ยา จำนวน {formatThaiNumber(Number(datacount))}รายการ  {description ? `โดยการ${description}` : ''} โดยมีรายละเอียดดังต่อไปนี้
                    </Text> 
                    {/* description ไม่ได้บังคับให้กรอกใช่เช็คไว้นะว่าไม่กรอกให้ซ่อน */}
                    <View style={[styles.table, { marginTop: 14 }]} >
                        <View style={[styles.tableRow, { justifyContent: 'space-between' }]}>
                            <Text style={[styles.tableHeader, { width: 20 }]}>ลำดับ</Text>
                            <Text style={[styles.tableHeader, { width: '50%', }]}>รายการ</Text>
                            <Text style={styles.tableHeader}>จำนวน </Text>
                            {/* <Text style={styles.tableHeader}>วันกำหนดคืน </Text> */}
                            {/* <Text style={styles.tableHeader}>หมายเหตุ</Text> */}
                        </View>
                        {documentData.map((item, index) => (
                            <View style={[styles.tableRow, { justifyContent: 'space-between' }]} key={index} >
                                <Text style={[styles.tableCell, { width: 20 }]}>{formatThaiNumber(index + 1)}</Text>
                                <Text style={[styles.tableCell, { width: '50%', }]}>{item.Medname} {toThaiDigits(item.Quantity)} </Text>
                                <Text style={styles.tableCell}>{formatThaiNumber(Number(item.Amount))} {item.unit ? toThaiDigits(item.unit) : ''}</Text>
                                {/* <Text style={styles.tableCell}>{item.ExpectedReturnDate}</Text>
                        <Text style={styles.tableCell}>{item.Description || "—"}</Text> */}
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

            <View style={{
                position: 'absolute',
                bottom: cm(2),
                left: cm(3),
                width: '100%',
                textAlign: 'left',
            }}>
                <Text >กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                <Text>ติดต่อ {contact}</Text>
            </View>

        </>
    );
};


function DualDocument({ documentData, userdata, docType }: any) {
    // ✅ 1. แบ่งข้อมูลเป็นกลุ่มละ 3
    const chunkSize = 3;
    const chunkedData = [];
    for (let i = 0; i < documentData.length; i += chunkSize) {
        chunkedData.push(documentData.slice(i, i + chunkSize));
    }

    return (
        <Document>
            {/* ✅ 2. วนสร้างหน้าตามจำนวนกลุ่ม */}
            {chunkedData.map((group, pageIndex) => (
                <React.Fragment key={`original-${pageIndex}`}>
                    {/* ต้นฉบับ */}
                    <Page size="A4" style={styles.page}>
                        <Pdfcontent
                            documentData={group}
                            docType={docType}
                            userdata={userdata}
                            variant="original"
                        />
                    </Page>

                    {/* สำเนา */}
                    <Page size="A4" style={styles.coppy_page}>
                        <Pdfcontent
                            documentData={group}
                            docType={docType}
                            userdata={userdata}
                            variant="copy"
                        />
                    </Page>
                </React.Fragment>
            ))}
        </Document>
    );
}


// ฟังก์ชันสร้าง PDF และโหลด

export async function generatePdf(documentData: any[], userdata: any, docType: string) {
    const blob = await pdf(<DualDocument documentData={documentData} docType={docType} userdata={userdata} />).toBlob();
    console.log("PDF Blob:", documentData);
    saveAs(blob, "request_document.pdf");
}

