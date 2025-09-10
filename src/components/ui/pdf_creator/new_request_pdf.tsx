// components/requete_pdf.tsx
"use client";
import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf ,Font, Image } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

Font.register({
    family: 'THSarabunNew',
    src: '/fonts/Sarabun-Light.ttf',
})
// style พื้นฐาน
const styles = StyleSheet.create({
    body: { 
        fontFamily: 'THSarabunNew', 

    },
    page: {
        fontFamily: 'THSarabunNew',
        padding: 30,
        fontSize: 14,
    },
    title: {
        fontFamily: 'THSarabunNew',
        fontSize: 18,
        marginBottom: 20,
        textAlign: "center",
    },
    section: {
        fontFamily: 'THSarabunNew',
        marginBottom: 10,
    },
    row: {
        fontFamily: 'THSarabunNew',
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
});

// PDF Layout
const MyDoc = ({ documentData }: { documentData: any[] }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>เอกสารสรุปคำขอ/คืนยา</Text>
            {documentData.map((item, idx) => (
                <View key={idx} style={styles.section}>
                    <Text>โรงพยาบาล: {item.SharingHospital}</Text>
                    <Text>ชื่อยา: {item.Medname}</Text>
                    <Text>จำนวน: {item.Amount} {item.Unit} ({item.Quantity})</Text>
                    <Text>วันที่คืน: {item.ExpectedReturnDate}</Text>
                    <Text>เหตุผล: {item.Description}</Text>
                    <Text>ประเภท: ss{item.type}</Text>
                </View>
            ))}
        </Page>
    </Document>
);

// ฟังก์ชันสร้าง PDF และโหลด
export async function generatePdf(documentData: any[]) {
    const blob = await pdf(<MyDoc documentData={documentData} />).toBlob();
    console.log("PDF Blob:", documentData);
    saveAs(blob, "request_document.pdf");
}
