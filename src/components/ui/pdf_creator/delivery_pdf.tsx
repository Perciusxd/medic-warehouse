// components/delivery_pdf.tsx
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
    body: { 
        fontFamily: 'TH SarabunPSK', 
        fontSize: 16, 
        paddingLeft: cm(2), 
        paddingRight: cm(2), 
        paddingTop: cm(3), 
        paddingBottom: cm(2) 
    },
    image: { width: 80, height: 80, marginHorizontal: 200 },
    text: { marginBottom: 8, fontFamily: 'TH SarabunPSK', fontSize: 16 },
    table: {
        display: 'flex',
        width: 'auto',
    },
    tableWithBorder: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        width: '25%',
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tableHeaderWithBorder: {
        width: '25%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tableCell: {
        width: '25%',
        padding: 4,
    },
    tableCellWithBorder: {
        width: '25%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        padding: 4,
    },
});

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const toThaiDigits = (input: string | number) =>
  input.toString().replace(/\d/g, d => "๐๑๒๓๔๕๖๗๘๙"[Number(d)]);

const todayFormat = new Date();
const day = todayFormat.getDate();
const month = thaiMonths[todayFormat.getMonth()];
const buddhistYear = todayFormat.getFullYear() + 543;

const today = `${toThaiDigits(day)} ${month} ${toThaiDigits(buddhistYear)}`;

function toThaiDigits_(input: string | number): string {
    const s = typeof input === 'number' ? String(input) : String(input ?? '');
    return s.replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

// ฟังก์ชันแปลงตัวเลขเป็นคำภาษาไทย
function numberToThaiText(num: number | string): string {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    
    if (isNaN(n) || n < 0) return '';
    if (n === 0) return 'ศูนย์';

    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    // แยกส่วนจำนวนเต็มและทศนิยม
    const parts = n.toString().split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts[1];

    let result = '';

    if (integerPart === 0) {
        result = 'ศูนย์';
    } else {
        const digits = integerPart.toString().split('').reverse();
        
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i]);
            
            if (digit === 0) continue;

            // กรณีหลักสิบ
            if (i === 1) {
                if (digit === 1) {
                    result = 'สิบ' + result;
                } else if (digit === 2) {
                    result = 'ยี่สิบ' + result;
                } else {
                    result = ones[digit] + 'สิบ' + result;
                }
            }
            // กรณีหลักหน่วย
            else if (i === 0) {
                if (digit === 1 && digits.length > 1) {
                    result = 'เอ็ด' + result;
                } else {
                    result = ones[digit] + result;
                }
            }
            // กรณีหลักอื่นๆ
            else {
                result = ones[digit] + places[i] + result;
            }
        }
    }

    // จัดการทศนิยม (ถ้ามี)
    if (decimalPart && parseFloat('0.' + decimalPart) > 0) {
        result += 'จุด';
        for (const digit of decimalPart) {
            const d = parseInt(digit);
            result += ones[d] || 'ศูนย์';
        }
    }

    return result;
}

export interface DeliveryPdfcontent {
    documentData: any[];
    userdata: any;
    selectedHospital?: string;
}

const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
};

const MyDocument: React.FC<DeliveryPdfcontent & { isCopy?: boolean }> = ({ documentData, userdata, selectedHospital, isCopy }) => {
    // กำหนดว่า 1 หน้าอยากให้มีไม่เกินกี่แถว
    const rowsPerPage = 2;
    const pages = chunkArray(documentData, rowsPerPage);
    console.log(userdata);
    
    // ดึงข้อมูลโรงพยาบาลผู้รับจากรายการแรก
    const firstHospital = documentData[0]?.raw.respondingHospitalNameTH || documentData[0]?.raw.postingHospitalNameTH || 'ไม่ระบุ';
    const senderHospital = selectedHospital || userdata?.hospital || 'ไม่ระบุ';

    return (
        <Document>
            {pages.map((pageData, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.body}>
                    {/* รูปตราครุฑ */}
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 13 }}>แบบฟอร์มส่งมอบเวชภัณฑ์ยา</Text>

                    {/* หัวจดหมาย */}
                    <View style={[styles.table, { marginBottom: 5 }]} fixed>
                        <View style={styles.tableRow}>
                            <Text style={[{ flex: 1 }]}>ที่ สข. ๘๐๒๓๑</Text>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ marginRight: cm(2.62)}]}>{firstHospital}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ flex: 1, flexWrap: 'wrap' }]}>ที่อยู่ {toThaiDigits_(userdata?.address || '')}</Text>
                        </View>
                    </View>

                    <Text style={{ textAlign: 'center' }}>{today}</Text>
                    <Text style={styles.text}>เรื่อง    ส่งมอบเวชภัณฑ์ยา</Text>
                    <Text style={styles.text}>เรียน    ผู้อำนวยการ{senderHospital}</Text>
                    <Text style={styles.text}>อ้างถึง    หนังสือลงวันที่.............................................</Text>
                    <Text style={{ marginTop: 3, textIndent: 80 }}>
                        สิ่งที่ส่งมาด้วย รายงานสรุปการเบิกเวชภัณฑ์ยาตามที่ {senderHospital} มีความประสงค์จะขอยืม หรือ ขอสนับสนุนเวชภัณฑ์ยา จำนวน {toThaiDigits(pageData.length)} รายการ จาก{firstHospital}นั้น ทาง{firstHospital} ได้ส่งมอบเวชภัณฑ์ยาดังกล่าวมาให้ท่าน โดยมีรายละเอียดดังต่อไปนี้
                    </Text>

                    {/* ตารางข้อมูล */}
                    <View style={[styles.tableWithBorder, { marginTop: 5 }]} wrap={false}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableHeaderWithBorder, { width: '10%' }]}>ลำดับ</Text>
                            <Text style={[styles.tableHeaderWithBorder, { width: '35%' }]}>รายการ</Text>
                            <Text style={styles.tableHeaderWithBorder}>จำนวน</Text>
                            <Text style={styles.tableHeaderWithBorder}>ราคาต่อหน่วย</Text>
                            <Text style={styles.tableHeaderWithBorder}>ราคารวม</Text>
                        </View>

                        {pageData.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center', width: '10%' }]}>
                                    {toThaiDigits(index + 1)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center', width: '35%' }]}>
                                    {item.Medname || 'ไม่ระบุ'} ({toThaiDigits(item.Quantity)}/{toThaiDigits(item.Unit)})
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(item.Amount || 0)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(item.PricePerUnit || 0)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(((item.PricePerUnit || 0) * (item.Amount || 0)).toFixed(2))} บาท
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* ยอดรวมชิดขวา */}
                    <View style={{ marginTop: 3, alignItems: 'flex-end' }}>
                        <Text>
                            รวมเป็นมูลค่า {toThaiDigits(pageData.reduce((sum, item) => sum + ((item.PricePerUnit || 0) * (item.Amount || 0)), 0).toFixed(2))} บาท
                        </Text>
                        <Text>
                            ตัวอักษร {numberToThaiText(pageData.reduce((sum, item) => sum + ((item.PricePerUnit || 0) * (item.Amount || 0)), 0).toFixed(2))}บาทถ้วน
                        </Text>
                    </View>

                    {/* Footer ชิดขอบล่าง */}
                    <View style={{ position: 'absolute', bottom: cm(1.5), left: 50, right: 50 }} fixed>
                        <Text style={{ marginTop: 5,textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ</Text>
                        <Text style={{ marginTop: 40, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
                        <Text style={{ textIndent: 295 }}>(................................................)</Text>
                        <Text style={{ textIndent: 340 }}>ตำแหน่ง</Text>
                        <Text style={{ textIndent: 300 }}>..............................................</Text>
                        <Text style={{ marginTop: 5, textIndent: 320 }}>ได้รับยาถูกต้องแล้ว</Text>
                        <Text style={{ textIndent: 295 }}>(................................................)</Text>
                        <Text style={{ textIndent: 295 }}>วันที่..........................................</Text>

                        <Text>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                        <Text>ติดต่อ {toThaiDigits_(userdata?.contact || '')}</Text>
                    </View>
                </Page>
            ))}

            {/* สร้างหน้าสำเนา */}
            {isCopy && pages.map((pageData, pageIndex) => (
                <Page key={`copy-${pageIndex}`} size="A4" style={{
                    fontFamily: 'TH SarabunPSK', 
                    fontSize: 16, 
                    paddingLeft: cm(2), 
                    paddingRight: cm(2), 
                    paddingTop: cm(2.5), 
                    paddingBottom: cm(2)
                }}>
                    {/* ข้อความสำเนา */}
                    <Text style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
                        สำเนา
                    </Text>

                    {/* หัวจดหมาย */}
                    <View style={[styles.table, { marginBottom: 10 }]} fixed>
                        <View style={styles.tableRow}>
                            <Text style={[{ flex: 1 }]}>ที่ สข. ๘๐๒๓๑</Text>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ marginRight: cm(2.62)}]}>{firstHospital}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ flex: 1 }]}></Text>
                            <Text style={[{ flex: 1, flexWrap: 'wrap' }]}>ที่อยู่ {toThaiDigits_(userdata?.address || '')}</Text>
                        </View>
                    </View>

                    <Text style={{ textAlign: 'center' }}>{today}</Text>
                    <Text style={styles.text}>เรื่อง    ส่งมอบเวชภัณฑ์ยา</Text>
                    <Text style={styles.text}>เรียน    ผู้อำนวยการ{senderHospital}</Text>
                    <Text style={styles.text}>อ้างถึง    หนังสือลงวันที่.............................................</Text>
                    <Text style={{ marginTop: 3, textIndent: 80 }}>
                        สิ่งที่ส่งมาด้วย รายงานสรุปการเบิกเวชภัณฑ์ยาตามที่ {senderHospital} มีความประสงค์จะขอยืม หรือ ขอสนับสนุนเวชภัณฑ์ยา จำนวน {toThaiDigits(pageData.length)} รายการ จาก{firstHospital}นั้น ทาง{firstHospital} ได้ส่งมอบเวชภัณฑ์ยาดังกล่าวมาให้ท่าน โดยมีรายละเอียดดังต่อไปนี้
                    </Text>

                    {/* ตารางข้อมูล */}
                    <View style={[styles.tableWithBorder, { marginTop: 5 }]} wrap={false}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableHeaderWithBorder}>ลำดับ</Text>
                            <Text style={styles.tableHeaderWithBorder}>รายการ</Text>
                            <Text style={styles.tableHeaderWithBorder}>จำนวน</Text>
                            <Text style={styles.tableHeaderWithBorder}>ราคาต่อหน่วย</Text>
                            <Text style={styles.tableHeaderWithBorder}>ราคารวม</Text>
                        </View>

                        {pageData.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(index + 1)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {item.Medname || 'ไม่ระบุ'} ({toThaiDigits(item.Quantity)}/{toThaiDigits(item.Unit)})
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(item.Amount || 0)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(item.PricePerUnit || 0)}
                                </Text>
                                <Text style={[styles.tableCellWithBorder, { textAlign: 'center' }]}>
                                    {toThaiDigits(((item.PricePerUnit || 0) * (item.Amount || 0)).toFixed(2))} บาท
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* ยอดรวมชิดขวา */}
                    <View style={{ marginTop: 3, alignItems: 'flex-end' }}>
                        <Text>
                            รวมเป็นมูลค่า {toThaiDigits(pageData.reduce((sum, item) => sum + ((item.PricePerUnit || 0) * (item.Amount || 0)), 0).toFixed(2))} บาท
                        </Text>
                        <Text>
                            ตัวอักษร {numberToThaiText(pageData.reduce((sum, item) => sum + ((item.PricePerUnit || 0) * (item.Amount || 0)), 0).toFixed(2))}บาทถ้วน
                        </Text>
                    </View>

                    {/* Footer ชิดขอบล่าง */}
                    <View style={{ position: 'absolute', bottom: cm(1.5), left: 50, right: 50 }} fixed>
                        <Text style={{ marginTop: 5, textIndent: 80 }}>จึงเรียนมาเพื่อโปรดดำเนินการ</Text>
                        <Text style={{ marginTop: 40, textIndent: 320 }}>ขอแสดงความนับถือ</Text>
                        <Text style={{ textIndent: 295 }}>(................................................)</Text>
                        <Text style={{ textIndent: 340 }}>ตำแหน่ง</Text>
                        <Text style={{ textIndent: 300 }}>..............................................</Text>
                        <Text style={{ marginTop: 5, textIndent: 320 }}>ได้รับยาถูกต้องแล้ว</Text>
                        <Text style={{ textIndent: 295 }}>(................................................)</Text>
                        <Text style={{ textIndent: 295 }}>วันที่..........................................</Text>

                        <Text>กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค</Text>
                        <Text>ติดต่อ {toThaiDigits_(userdata?.contact || '')}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export const generateDeliveryPdf = async (documentData: any[], userdata: any, selectedHospital?: string) => {
    const blob = await pdf(<MyDocument documentData={documentData} userdata={userdata} selectedHospital={selectedHospital} isCopy={true} />).toBlob();
    saveAs(blob, `เอกสารส่งมอบยา_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
};

export const previewDeliveryPdf = async (documentData: any[], userdata: any, selectedHospital?: string) => {
    const blob = await pdf(<MyDocument documentData={documentData} userdata={userdata} selectedHospital={selectedHospital} isCopy={true} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

export const DeliveryPdfcontent: React.FC<DeliveryPdfcontent> = ({ documentData, userdata, selectedHospital }) => {
    return <MyDocument documentData={documentData} userdata={userdata} selectedHospital={selectedHospital} />;
};
