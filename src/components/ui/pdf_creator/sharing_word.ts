"use client";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const cm = (v: number) => Math.round(v * 567);

function toThaiDigits(input: string | number): string {
    const s = typeof input === "number" ? String(input) : String(input ?? "");
    return s.replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

function formatThaiDate(input: any): string {
    if (!input && input !== 0) return "";
    let date: Date;
    if (input instanceof Date) {
        date = input;
    } else if (typeof input === "string") {
        date = isNaN(Number(input)) ? new Date(input) : new Date(Number(input));
    } else {
        date = new Date(input);
    }
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date);
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
    return new TextRun({ text, font: "THSarabunNew", size: 20, bold });
}
function tPara(text: string, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType], spacingBefore?: number): Paragraph {
    return new Paragraph({ children: [tRun(text)], alignment, spacing: spacingBefore ? { before: spacingBefore } : undefined });
}
function ncell(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ children: [tRun(text, bold)] })],
    });
}
function rcell(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tRun(text, bold)] })],
    });
}

export async function generateSharingWord(pdfData: any, userData: any) {
    const data = { ...pdfData, userData };
    const responseDetail = data?.responseDetail ?? {};
    const sharingMedicineDetail = data?.sharingMedicineDetail ?? {};

    const postingHospitalNameTH = sharingMedicineDetail?.postingHospitalNameTH ?? "";
    const sharingMedicine = sharingMedicineDetail?.sharingMedicine ?? {};
    const respondingHospitalNameTH = responseDetail?.respondingHospitalNameTH ?? "";
    const acceptedOffer = responseDetail?.acceptedOffer ?? {};

    const address = userData?.address ?? "";
    const director = userData?.director ?? "";
    const contact = userData?.contact ?? "";

    const today = formatThaiDate(new Date());
    const expectedReturnDate = formatThaiDate(acceptedOffer.expectedReturnDate);
    const mockNote = "รอการส่งมอบจากตัวแทนจำหน่าย";

    const children: any[] = [
        // สำเนาข้อความสำหรับ original — ไม่แสดง เพราะไม่มีรูปตราครุฑในไฟล์ Word
        new Table({
            columnWidths: [cm(4), cm(3), cm(9)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("ที่ สข. 80231", cm(4)), ncell("", cm(3)), rcell(respondingHospitalNameTH, cm(9))] }),
                new TableRow({ children: [ncell("", cm(4)), ncell("", cm(3)), rcell(`ที่อยู่ ${address}`, cm(9))] }),
            ],
        }),
        tPara(today, AlignmentType.CENTER, cm(0.3)),
        tPara("เรื่อง    ขอยืมเวชภัณฑ์ยา"),
        tPara(`เรียน    ผู้อำนวยการ ${postingHospitalNameTH}`),
        tPara(
            `         เนืื่องด้วย ${respondingHospitalNameTH} มีความประสงค์ที่จะขอยืมยา ดังรายการต่อไปนี้`,
            undefined,
            cm(0.3)
        ),
        new Table({
            columnWidths: [cm(4), cm(3), cm(4), cm(5)],
            borders: noTableBorders,
            rows: [
                new TableRow({
                    children: [
                        ncell("รายการ", cm(4), true),
                        ncell("จำนวน", cm(3), true),
                        ncell("วันกำหนดคืน", cm(4), true),
                        ncell("หมายเหตุ", cm(5), true),
                    ],
                }),
                new TableRow({
                    children: [
                        ncell(`${sharingMedicine.name ?? ""} (${sharingMedicine.quantity ?? ""})`, cm(4)),
                        ncell(`${acceptedOffer.responseAmount ?? ""} (${sharingMedicine.unit ?? ""})`, cm(3)),
                        ncell(expectedReturnDate, cm(4)),
                        ncell(mockNote, cm(5)),
                    ],
                }),
            ],
        }),
        tPara(
            `         ทั้งนี้${respondingHospitalNameTH}จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในวันที่กำหนด วันที่ ${expectedReturnDate}`,
            undefined,
            cm(1)
        ),
        tPara(
            `         จึงเรียนมาเพื่อโปรดพิจารณา และ${respondingHospitalNameTH} ขอขอบคุณ ณ โอกาสนี้`,
            undefined,
            cm(1)
        ),
        new Table({
            columnWidths: [cm(9), cm(7)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("", cm(9)), ncell("ขอแสดงความนับถือ", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(director, cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(`ผู้อำนวยการ ${respondingHospitalNameTH}`, cm(7))] }),
            ],
        }),
        tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, cm(2)),
        tPara(`ติดต่อ ${contact}`),
    ];

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { width: 11906, height: 16838 },
                        margin: { top: cm(1.5), bottom: cm(2), left: cm(2), right: cm(2) },
                    },
                },
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `เอกสารขอยืม_แบ่งปัน_${format(new Date(), "yyyyMMdd_HHmmss")}.docx`);
}
