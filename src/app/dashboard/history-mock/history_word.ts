"use client";
import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, HeadingLevel,
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

const solidBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };

function tRun(text: string, bold = false): TextRun {
    return new TextRun({ text, font: "TH SarabunPSK", size: 32, bold });
}

function tPara(
    text: string,
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
    opts?: { spacingBefore?: number; indent?: number }
): Paragraph {
    return new Paragraph({
        children: [tRun(text)],
        alignment,
        spacing: opts?.spacingBefore ? { before: opts.spacingBefore } : undefined,
        indent: opts?.indent ? { firstLine: opts.indent } : undefined,
    });
}

function headerCell(text: string, widthDxa: number): TableCell {
    return new TableCell({
        width: { size: widthDxa, type: WidthType.DXA },
        borders: {
            top: solidBorder,
            bottom: solidBorder,
            left: solidBorder,
            right: solidBorder,
        },
        children: [new Paragraph({ children: [tRun(text, true)], alignment: AlignmentType.CENTER })],
    });
}

function dataCell(text: string, widthDxa: number): TableCell {
    return new TableCell({
        width: { size: widthDxa, type: WidthType.DXA },
        borders: {
            top: solidBorder,
            bottom: solidBorder,
            left: solidBorder,
            right: solidBorder,
        },
        children: [new Paragraph({ children: [tRun(text)], alignment: AlignmentType.CENTER })],
    });
}

function noBoCell(text: string, widthDxa: number, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]): TableCell {
    return new TableCell({
        width: { size: widthDxa, type: WidthType.DXA },
        borders: noBorders,
        children: [new Paragraph({ children: [tRun(text)], alignment })],
    });
}

export async function generateHistoryWord(data: any[]): Promise<void> {
    if (!data || data.length === 0) return;

    // Thai date
    const todayFormat = new Date();
    const day = todayFormat.getDate();
    const month = thaiMonths[todayFormat.getMonth()];
    const buddhistYear = todayFormat.getFullYear() + 543;
    const todayStr = `${toThaiDigits(day)} ${month} ${toThaiDigits(buddhistYear)}`;

    const first = data[0];
    const hostHospital: string = first.hostHospital ?? "";
    const address: string = first.address ?? "";
    const hospitalName: string = first.hospitalName ?? "";
    const director: string = first.director ?? "";
    const contact: string = first.contact ?? "";
    const directorPosition: string = first.directorPosition ?? "";

    // Column widths (twips). A4 content width ≈ 9639 dxa (17 cm with 2 cm margins each side)
    const colW = [771, 2892, 1157, 1590, 1590, 1639]; // ลำดับ, รายการ, จำนวน, ราคาต่อหน่วย, ราคารวม, จำนวนวันที่ยืม
    const totalW = colW.reduce((a, b) => a + b, 0); // 9639

    // Header info table (no borders, 3 equal cols)
    const colW3 = Math.round(totalW / 3);
    const headerTable = new Table({
        width: { size: totalW, type: WidthType.DXA },
        borders: noTableBorders,
        rows: [
            new TableRow({
                children: [
                    noBoCell("ที่ สข. ๘๐๒๓๑", colW3),
                    noBoCell("", colW3),
                    noBoCell(hostHospital, colW3),
                ],
            }),
            new TableRow({
                children: [
                    noBoCell("", colW3),
                    noBoCell("", colW3),
                    noBoCell("ที่อยู่ " + toThaiDigits(address), colW3),
                ],
            }),
        ],
    });

    // Medicine data table rows
    const tableDataRows = data.map((item: any, index: number) => {
        const isRequest = item.ticketType === "request";
        const med = isRequest ? item.responseDetails?.requestMedicine : item.sharingMedicine;

        const name = isRequest
            ? `${med?.name ?? "-"} (${toThaiDigits(Number(med?.requestAmount ?? 0).toLocaleString())}/${med?.unit ?? ""})`
            : `${med?.name ?? "-"} (${toThaiDigits(Number(med?.sharingAmount ?? 0).toLocaleString())}/${med?.unit ?? ""})`;

        const qty = isRequest
            ? Number(med?.quantity ?? 0).toLocaleString()
            : Number(med?.quantity ?? 0).toLocaleString();

        const price = isRequest
            ? Number(med?.pricePerUnit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : Number(med?.pricePerUnit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const total = isRequest
            ? (Number(med?.requestAmount ?? 0) * Number(med?.pricePerUnit ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : (Number(med?.sharingAmount ?? 0) * Number(med?.pricePerUnit ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const days = isRequest
            ? (item.dayAmount === 0 ? 1 : item.dayAmount)
            : (item.dayAmount === 0 ? item.dayAmount : 1);

        return new TableRow({
            children: [
                dataCell(toThaiDigits(index + 1), colW[0]),
                dataCell(name, colW[1]),
                dataCell(toThaiDigits(qty), colW[2]),
                dataCell(toThaiDigits(price), colW[3]),
                dataCell(toThaiDigits(total), colW[4]),
                dataCell(`${toThaiDigits(days)} วัน`, colW[5]),
            ],
        });
    });

    const medicineTable = new Table({
        width: { size: totalW, type: WidthType.DXA },
        rows: [
            new TableRow({
                children: [
                    headerCell("ลำดับ", colW[0]),
                    headerCell("รายการ", colW[1]),
                    headerCell("จำนวน", colW[2]),
                    headerCell("ราคาต่อหน่วย", colW[3]),
                    headerCell("ราคารวม", colW[4]),
                    headerCell("จำนวนวันที่ยืม", colW[5]),
                ],
            }),
            ...tableDataRows,
        ],
    });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: cm(1.5),
                            bottom: cm(1.5),
                            left: cm(2),
                            right: cm(2),
                        },
                    },
                },
                children: [
                    headerTable,
                    tPara(todayStr, AlignmentType.CENTER, { spacingBefore: 120 }),
                    tPara(`เรื่อง    ขอเรียกคืนเวชภัณฑ์ยาที่ครบกำหนด`, undefined, { spacingBefore: 120 }),
                    tPara(`เรียน    ผู้อำนวยการ${hospitalName}`),
                    tPara(
                        `    เนื่องด้วย ${hospitalName} มีความประสงค์จะขอเรียกคืนยาที่ครบกำหนดระยะเวลาการยืม โดยมีรายละเอียดดังต่อไปนี้`,
                        undefined,
                        { spacingBefore: 80 }
                    ),
                    new Paragraph({ children: [], spacing: { before: 160 } }),
                    medicineTable,
                    tPara("    จึงเรียนมาเพื่อโปรดดำเนินการ", undefined, { spacingBefore: 280 }),
                    tPara("ขอแสดงความนับถือ", AlignmentType.RIGHT, { spacingBefore: 160 }),
                    tPara("", undefined, { spacingBefore: 1000 }),
                    tPara(director, AlignmentType.RIGHT),
                    tPara(`${directorPosition}${hostHospital}`, AlignmentType.RIGHT),
                    tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, { spacingBefore: 200 }),
                    tPara(`ติดต่อ ${toThaiDigits(contact)}`),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const dateStr = format(new Date(), "ddMMyyyy");
    saveAs(blob, `medicine_recall_${dateStr}.docx`);
}
