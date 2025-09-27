// components/requete_pdf.tsx
"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font, Image } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

Font.register({
    family: 'TH SarabunPSK',
    src: '/fonts/thsarabun.ttf',
})
// style พื้นฐาน
const styles = StyleSheet.create({

    body: {},
    image: { width: 80, height: 80, alignSelf: 'center' },
    page: {
        fontFamily: 'TH SarabunPSK',
        fontSize: 16,
        size: 'A4',
        paddingTop: 42,
        paddingLeft: 85,
        paddingRight: 57,
        paddingBottom: 42,

    },
    title: {
        // fontSize: 18,
        marginBottom: 20,
        textAlign: "center",
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    table: {
        display: 'flex',
        width: 'auto',
        justifyContent:'center'
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
        padding: 4,
        fontWeight: 'bold',
        // fontSize: 14,
    },
    tableCell: {
        width: '25%',
        // borderStyle: 'solid',
        // borderBottomWidth: 1,
        // borderRightWidth: 1,
        padding: 4,
        flexWrap: 'wrap',
        maxWidth: '100%',
        // fontSize: 14,
    },
    text: {
        marginBottom: 5
    },
});





// PDF Layout
export function Pdfcontent({ documentData, userdata, variant = 'original' }: { documentData: any[], userdata: any, variant?: 'original' | 'copy' }) {

    const lendingHospitalNameTH = userdata?.name || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const lendingHospitalAddress = userdata?.address || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const contact = userdata?.contact || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const director = userdata?.director || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const documentType = "เอกสารขอยืม"
    const actionText = documentData.length
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const mockNote = "วันที่ได้แจ้งไว้";
    console.log("Document Data in PDF:", userdata);
    const borrowingHospitalNameTH =
        documentData.length > 0
            ? documentData[0].SharingHospital
            : "ไม่ทราบโรงพยาบาล";
    const description = documentData.length > 0
        ? documentData
            .map(item => item.Description)
            .join(', ')
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
                    <Text style={[styles.tableCell, { flex: 1 }]}>โรงพยาบาล{lendingHospitalNameTH} </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 1, flexWrap: 'wrap', maxWidth: '100%' }]}>ที่อยู่ {lendingHospitalAddress} <span style={{ display: 'none' }}>hidden</span></Text>
                </View>
            </View>

            <Text style={{ textAlign: 'center' }} >{today}</Text>
            <Text style={styles.text}>เรื่อง    {documentType}</Text>
            <Text style={styles.text}>เรียน    ผู้อำนวยการ {borrowingHospitalNameTH}</Text>
            <Text style={{ marginTop: 6, textIndent: 80 }}>
                เนื่องด้วย โรงพยาบาล{lendingHospitalNameTH} มีความประสงค์จะขอยืมเวชภัณฑ์ยา จำนวน{actionText}รายการ เนื่องจาก {description} ดังรายละเอียดต่อไปนี้
            </Text>

            <View style={[styles.table, { marginTop: 14 }]} >
                <View style={[styles.tableRow,{justifyContent:'space-between'}]}>
                    <Text style={[styles.tableHeader,{width:20}]}>ลำดับ</Text>
                    <Text style={styles.tableHeader}>รายการ</Text>
                    <Text style={styles.tableHeader}>จำนวน </Text>
                    {/* <Text style={styles.tableHeader}>วันกำหนดคืน </Text> */}
                    {/* <Text style={styles.tableHeader}>หมายเหตุ</Text> */}
                </View>
                {documentData.map((item, index) => (
                    <View style={[styles.tableRow,{justifyContent:'space-between'}]} key={index} >
                        <Text style={[styles.tableCell,{width:20}]}>{index + 1}</Text>
                        <Text style={styles.tableCell}>{item.Medname} {item.Quantity} </Text>
                        <Text style={styles.tableCell}>{item.Amount} {item.Unit}</Text>
                        {/* <Text style={styles.tableCell}>{item.ExpectedReturnDate}</Text>
                        <Text style={styles.tableCell}>{item.Description || "—"}</Text> */}
                    </View>
                ))}
            </View>

            <Text style={{ marginTop: 30, textIndent: 80 }}>
                ทั้งนี้ โรงพยาบาล{lendingHospitalNameTH} จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในเวลาที่{expectedReturnDate}
            </Text>
            <Text style={{ marginTop: 6, textIndent: 80 }}>
                จึงเรียนมาเพื่อโปรดพิจารณา และ{borrowingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้
            </Text>


            <View style={{
                alignSelf: 'flex-end',
                width: '50%',
                maxWidth: 200,
                flexDirection: 'column',
                textAlign: 'center',
                marginTop: 30, 
            }}>
                <Text>ขอแสดงความนับถือ</Text>
                <Text style={{ marginTop: 60 }}>.......................................................................</Text>
                <Text>( {director} ) </Text>
                <Text>ตำแหน่งผู้มีอำนาจลงนาม โรงพยาบาล{lendingHospitalNameTH}</Text>
            </View>


            <Text style={{ marginTop: 30 }}>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
            <Text>ติดต่อ {contact}</Text>
        </>
    );
};


function DualDocument({ documentData, userdata }: any) {
    return (
        <Document>
            {/* หน้าแรก = ต้นฉบับ */}
            <Page size="A4" style={styles.page}>
                <Pdfcontent documentData={documentData} userdata={userdata} variant="original" />
            </Page>

            {/* หน้าที่สอง = สำเนา */}
            <Page size="A4" style={styles.page}>
                <Pdfcontent documentData={documentData} userdata={userdata} variant="copy" />
            </Page>
        </Document>
    );
}


// ฟังก์ชันสร้าง PDF และโหลด

export async function generatePdf(documentData: any[], userdata: any) {
    const blob = await pdf(<DualDocument documentData={documentData} userdata={userdata} />).toBlob();
    console.log("PDF Blob:", documentData);
    saveAs(blob, "request_document.pdf");
}

