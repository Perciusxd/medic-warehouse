"use client";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

// 1 cm = 567 twips
const cm = (v: number) => Math.round(v * 567);

function toThaiDigits(input: string | number): string {
    const s = typeof input === "number" ? String(input) : String(input ?? "");
    return s.replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

function formatThaiNumber(n: number): string {
    try { return new Intl.NumberFormat("th-TH-u-nu-thai").format(n); }
    catch { return toThaiDigits(n.toLocaleString("th-TH")); }
}

const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function tRun(text: string, opts: { bold?: boolean; size?: number } = {}): TextRun {
    return new TextRun({ text, font: "TH SarabunPSK", size: opts.size ?? 32, bold: opts.bold ?? false });
}

function tPara(text: string, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType], spacingBefore?: number): Paragraph {
    return new Paragraph({
        children: [tRun(text)],
        alignment,
        spacing: spacingBefore ? { before: spacingBefore } : undefined,
    });
}

function noBorderCell(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ children: [tRun(text, { bold })] })],
    });
}

function noTableBorders() {
    return {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideH: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideV: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };
}

export async function generateRequestWord(documentData: any[], userdata: any, docType: string) {
    const lendingHospitalNameTH = userdata?.name || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const lendingHospitalAddress = userdata?.address || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const contact = userdata?.contact || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const director = userdata?.director || "ข้อมูลโรงพยาบาลไม่ครบถ้วน";
    const documentType = docType === "normalReturn" ? "เอกสารขอยืม" : "เอกสารขอสนับสนุน";
    const datacount = documentData.length;
    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, "dd/MM")}/${todayDate.getFullYear() + 543}`);
    const borrowingHospitalNameTH = documentData.length > 0 ? documentData[0].SharingHospital : "ไม่ทราบโรงพยาบาล";
    const description = documentData.map((item) => item.Description).join(" และ ");

    const expectedReturnDate = documentData
        .map((item) => {
            if (!item.ExpectedReturnDate) return "ไม่มีวันที่";
            const timestamp = parseInt(item.ExpectedReturnDate, 10);
            if (isNaN(timestamp)) return "ข้อมูลวันที่ผิดพลาด";
            const date = new Date(timestamp);
            return date.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
        })
        .join(", ");

    // Header table: ref | blank | hospital+address
    const headerTable = new Table({
        columnWidths: [cm(4), cm(3), cm(9)],
        borders: noTableBorders(),
        rows: [
            new TableRow({
                children: [
                    noBorderCell(toThaiDigits("ที่ สข. 80231"), cm(4)),
                    noBorderCell("", cm(3)),
                    noOrderBorderCellRight(`โรงพยาบาล${lendingHospitalNameTH}`, cm(9)),
                ],
            }),
            new TableRow({
                children: [
                    noOrderBorderCellRight("", cm(4)),
                    noOrderBorderCellRight("", cm(3)),
                    noOrderBorderCellRight(`ที่อยู่ ${lendingHospitalAddress}`, cm(9)),
                ],
            }),
        ],
    });

    // Medicine table rows
    const medTableRows = [
        new TableRow({
            children: [
                noOrderBorderCellCenter("ลำดับ", cm(2), true),
                noOrderBorderCellCenter("รายการ", cm(9.5), true),
                noOrderBorderCellCenter("จำนวน", cm(4), true),
            ],
        }),
        ...documentData.map((item, index) =>
            new TableRow({
                children: [
                    noOrderBorderCellCenter(formatThaiNumber(index + 1), cm(2)),
                    noBorderCell(`${item.Medname} ${toThaiDigits(item.Quantity || "")}`, cm(9.5)),
                    noOrderBorderCellCenter(
                        `${formatThaiNumber(Number(item.Amount))} ${item.unit ? toThaiDigits(item.unit) : ""}`,
                        cm(4)
                    ),
                ],
            })
        ),
    ];

    const medTable = new Table({
        columnWidths: [cm(2), cm(9.5), cm(4)],
        borders: noTableBorders(),
        rows: medTableRows,
    });

    // Signature block
    const signatureRows = [
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter("ขอแสดงความนับถือ", cm(7))] }),
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter("", cm(7))] }),
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter("", cm(7))] }),
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter(".......................................................................", cm(7))] }),
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter(`( ${director} )`, cm(7))] }),
        new TableRow({ children: [noOrderBorderCellCenter("", cm(9)), noOrderBorderCellCenter(`ตำแหน่งผู้มีอำนาจลงนาม โรงพยาบาล${lendingHospitalNameTH}`, cm(7))] }),
    ];

    const signatureTable = new Table({
        columnWidths: [cm(9), cm(7)],
        borders: noTableBorders(),
        rows: signatureRows,
    });

    const children: any[] = [
        headerTable,
        tPara(today, AlignmentType.CENTER, cm(0.3)),
        tPara(`เรื่อง    ${documentType}`),
        tPara(`เรียน    ผู้อำนวยการ ${borrowingHospitalNameTH}`),
    ];

    if (docType === "normalReturn") {
        children.push(
            tPara(
                `         เนื่องด้วย โรงพยาบาล${lendingHospitalNameTH} มีความประสงค์จะขอยืมเวชภัณฑ์ยา จำนวน ${formatThaiNumber(datacount)} รายการ${description ? ` เนื่องจาก${description}` : ""} ดังรายละเอียดต่อไปนี้`,
                undefined,
                cm(0.3)
            ),
            medTable,
            tPara(
                `         ทั้งนี้ โรงพยาบาล${lendingHospitalNameTH} จะส่งคืนเวชภัณฑ์ยาตามรายการข้างต้น ภายในวันที่ ${toThaiDigits(expectedReturnDate)}`,
                undefined,
                cm(0.5)
            ),
            tPara(
                `         จึงเรียนมาเพื่อโปรดพิจารณา และ${lendingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้`
            )
        );
    } else {
        children.push(
            tPara(
                `         เนื่องด้วย โรงพยาบาล${lendingHospitalNameTH} มีความประสงค์จะขอสนับสนุนเวชภัณฑ์ยา จำนวน ${formatThaiNumber(datacount)} รายการ${description ? ` โดยการ${description}` : ""} โดยมีรายละเอียดดังต่อไปนี้`,
                undefined,
                cm(0.3)
            ),
            medTable,
            tPara(
                `         จึงเรียนมาเพื่อโปรดพิจารณา และโรงพยาบาล${lendingHospitalNameTH} ขอขอบคุณมา ณ โอกาสนี้`,
                undefined,
                cm(0.5)
            )
        );
    }

    children.push(
        signatureTable,
        tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, cm(2)),
        tPara(`ติดต่อ ${contact}`)
    );

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { width: 11906, height: 16838 },
                        margin: { top: cm(1.5), bottom: cm(2), left: cm(3), right: cm(2) },
                    },
                },
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const label = docType === "normalReturn" ? "ขอยืม" : "ขอสนับสนุน";
    saveAs(blob, `เอกสาร${label}_${format(new Date(), "yyyyMMdd_HHmmss")}.docx`);
}

// Helper variants for alignment
function noOrderBorderCellRight(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tRun(text, { bold })] })],
    });
}

function noOrderBorderCellCenter(text: string, widthDxa?: number, bold = false): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [tRun(text, { bold })] })],
    });
}
