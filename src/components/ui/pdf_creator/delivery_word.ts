"use client";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const cm = (v: number) => Math.round(v * 567);

const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function toThaiDigits(input: string | number): string {
    return String(input).replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[Number(d)]);
}

function numberToThaiText(num: number | string): string {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(n) || n < 0) return "";
    if (n === 0) return "ศูนย์";
    const ones = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const parts = n.toString().split(".");
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts[1];
    let result = "";
    if (integerPart === 0) {
        result = "ศูนย์";
    } else {
        const digits = integerPart.toString().split("").reverse();
        for (let i = 0; i < digits.length; i++) {
            const digit = parseInt(digits[i]);
            if (digit === 0) continue;
            if (i === 1) {
                if (digit === 1) result = "สิบ" + result;
                else if (digit === 2) result = "ยี่สิบ" + result;
                else result = ones[digit] + "สิบ" + result;
            } else if (i === 0) {
                result = (digit === 1 && digits.length > 1 ? "เอ็ด" : ones[digit]) + result;
            } else {
                const places = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
                result = ones[digit] + places[i] + result;
            }
        }
    }
    if (decimalPart && parseFloat("0." + decimalPart) > 0) {
        result += "จุด";
        for (const digit of decimalPart) {
            result += ones[parseInt(digit)] || "ศูนย์";
        }
    }
    return result;
}

const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const noTableBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideH: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideV: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function tRun(text: string, bold = false): TextRun {
    return new TextRun({ text, font: "TH SarabunPSK", size: 32, bold });
}
function tPara(text: string, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType], spacingBefore?: number): Paragraph {
    return new Paragraph({ children: [tRun(text)], alignment, spacing: spacingBefore ? { before: spacingBefore } : undefined });
}
function cell(text: string, widthDxa?: number, align?: (typeof AlignmentType)[keyof typeof AlignmentType], bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: align, children: [tRun(text, bold)] })],
    });
}

const singleBordersStyle = {
    style: BorderStyle.SINGLE, size: 4, color: "000000",
};
function borderedCell(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: {
            top: singleBordersStyle,
            bottom: singleBordersStyle,
            left: singleBordersStyle,
            right: singleBordersStyle,
        },
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [tRun(text, bold)] })],
    });
}

export async function generateDeliveryWord(documentData: any[], userdata: any, selectedHospital?: string) {
    if (!documentData || documentData.length === 0) return;

    const todayDate = new Date();
    const day = todayDate.getDate();
    const month = thaiMonths[todayDate.getMonth()];
    const buddhistYear = todayDate.getFullYear() + 543;
    const today = `${toThaiDigits(day)} ${month} ${toThaiDigits(buddhistYear)}`;

    const firstItem = documentData[0]?.raw;
    const receiverHospital = firstItem?.respondingHospitalNameTH || firstItem?.postingHospitalNameTH || "ไม่ระบุ";
    const senderHospital = selectedHospital || userdata?.hospital || "ไม่ระบุ";
    const address = toThaiDigits(userdata?.address || "");
    const contact = toThaiDigits(userdata?.contact || "");

    const totalValue = documentData.reduce((sum, item) => sum + ((item.PricePerUnit || 0) * (item.Amount || 0)), 0);

    const children: any[] = [
        tPara("แบบฟอร์มส่งมอบเวชภัณฑ์ยา", AlignmentType.CENTER),
        new Table({
            columnWidths: [cm(4), cm(3), cm(9)],
            borders: noTableBorders,
            rows: [
                new TableRow({
                    children: [
                        cell("ที่ สข. ๘๐๒๓๑", cm(4)),
                        cell("", cm(3)),
                        cell(receiverHospital, cm(9), AlignmentType.RIGHT),
                    ],
                }),
                new TableRow({
                    children: [
                        cell("", cm(4)),
                        cell("", cm(3)),
                        cell(`ที่อยู่ ${address}`, cm(9), AlignmentType.RIGHT),
                    ],
                }),
            ],
        }),
        tPara(today, AlignmentType.CENTER, cm(0.3)),
        tPara("เรื่อง    ส่งมอบเวชภัณฑ์ยา"),
        tPara(`เรียน    ผู้อำนวยการ${senderHospital}`),
        tPara("อ้างถึง    หนังสือลงวันที่............................................."),
        tPara(
            `         สิ่งที่ส่งมาด้วย รายงานสรุปการเบิกเวชภัณฑ์ยาตามที่ ${senderHospital} มีความประสงค์จะขอยืม หรือ ขอสนับสนุนเวชภัณฑ์ยา จำนวน ${toThaiDigits(documentData.length)} รายการ จาก${receiverHospital}นั้น ทาง${receiverHospital} ได้ส่งมอบเวชภัณฑ์ยาดังกล่าวมาให้ท่าน โดยมีรายละเอียดดังต่อไปนี้`,
            undefined,
            cm(0.3)
        ),
        // Medicine table with borders
        new Table({
            columnWidths: [cm(1.5), cm(5.5), cm(2.5), cm(2.5), cm(4)],
            borders: noTableBorders,
            rows: [
                new TableRow({
                    children: [
                        borderedCell("ลำดับ", cm(1.5), true),
                        borderedCell("รายการ", cm(5.5), true),
                        borderedCell("จำนวน", cm(2.5), true),
                        borderedCell("ราคาต่อหน่วย", cm(2.5), true),
                        borderedCell("ราคารวม", cm(4), true),
                    ],
                }),
                ...documentData.map((item, index) =>
                    new TableRow({
                        children: [
                            borderedCell(toThaiDigits(index + 1), cm(1.5)),
                            borderedCell(`${item.Medname || "ไม่ระบุ"} (${toThaiDigits(item.Quantity)}/${toThaiDigits(item.Unit)})`, cm(5.5)),
                            borderedCell(toThaiDigits(item.Amount || 0), cm(2.5)),
                            borderedCell(toThaiDigits(item.PricePerUnit || 0), cm(2.5)),
                            borderedCell(`${toThaiDigits(((item.PricePerUnit || 0) * (item.Amount || 0)).toFixed(2))} บาท`, cm(4)),
                        ],
                    })
                ),
            ],
        }),
        tPara(`รวมเป็นมูลค่า ${toThaiDigits(totalValue.toFixed(2))} บาท`, AlignmentType.RIGHT, cm(0.3)),
        tPara(`ตัวอักษร ${numberToThaiText(totalValue.toFixed(2))}บาทถ้วน`, AlignmentType.RIGHT),
        tPara("         จึงเรียนมาเพื่อโปรดดำเนินการ", undefined, cm(0.3)),
        new Table({
            columnWidths: [cm(9), cm(7)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [cell("", cm(9)), cell("ขอแสดงความนับถือ", cm(7), AlignmentType.CENTER)] }),
                new TableRow({ children: [cell("", cm(9)), cell("", cm(7))] }),
                new TableRow({ children: [cell("", cm(9)), cell("(................................................)", cm(7), AlignmentType.CENTER)] }),
                new TableRow({ children: [cell("", cm(9)), cell("ตำแหน่ง", cm(7), AlignmentType.CENTER)] }),
                new TableRow({ children: [cell("", cm(9)), cell("..............................................", cm(7), AlignmentType.CENTER)] }),
            ],
        }),
        tPara("ได้รับยาถูกต้องแล้ว", AlignmentType.RIGHT, cm(0.3)),
        tPara("(................................................)", AlignmentType.RIGHT),
        tPara("วันที่..........................................", AlignmentType.RIGHT),
        tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, cm(0.5)),
        tPara(`ติดต่อ ${contact}`),
    ];

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { width: 11906, height: 16838 },
                        margin: { top: cm(3), bottom: cm(2), left: cm(2), right: cm(2) },
                    },
                },
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `เอกสารส่งมอบยา_${format(new Date(), "yyyyMMdd_HHmmss")}.docx`);
}
