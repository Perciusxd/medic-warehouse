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

function toThaiNumerals(num: number): string {
    return String(num).replace(/\d/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[parseInt(d, 10)]);
}

function formatThaiNumber(n: number): string {
    try { return new Intl.NumberFormat("th-TH-u-nu-thai").format(n); }
    catch { return toThaiDigits(n.toLocaleString("th-TH")); }
}

function formatThaiDateFromAny(input: any): string {
    if (!input && input !== 0) return "";
    const n = Number(input);
    const d = new Date(isNaN(n) ? input : n);
    if (isNaN(d.getTime())) return "";
    return toThaiDigits(`${format(d, "dd/MM")}/${d.getFullYear() + 543}`);
}

function normalizeReturnList(raw: any): any[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map((item: any) => (item && item.returnMedicine ? item.returnMedicine : item));
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

const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: "000000" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function tRun(text: string, bold = false): TextRun {
    return new TextRun({ text, font: "THSarabunNew", size: 20, bold });
}

function tPara(text: string, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType], spacingBefore?: number): Paragraph {
    return new Paragraph({ children: [tRun(text)], alignment, spacing: spacingBefore ? { before: spacingBefore } : undefined });
}

function ncell(text: string, widthDxa?: number, opts: { bold?: boolean; border?: boolean } = {}): TableCell {
    return new TableCell({
        borders: opts.border ? thinBorders : noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ children: [tRun(text, opts.bold)] })],
    });
}

function rcell(text: string, widthDxa?: number): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tRun(text)] })],
    });
}

export async function generateReturnWordMulti(pdfData: any, rawReturnList: any, userData: any) {
    const data = { ...pdfData, userData };
    const returnList = normalizeReturnList(rawReturnList);

    const baseMedicine = data?.offeredMedicine ?? data?.sharingDetails?.sharingMedicine ?? data?.sharingMedicine ?? {};

    const lendingHospitalNameTH = data?.postingHospitalNameTH ?? data?.sharingDetails?.postingHospitalNameTH ?? data?.postingHospitalNameEN ?? "";
    const borrowingHospitalNameTH = data?.respondingHospitalNameTH ?? data?.respondingHospitalNameEN ?? data?.sharingDetails?.respondingHospitalNameTH ?? "";

    const requestedMedicineName = data?.requestDetails?.name ?? data?.requestMedicine?.name ?? data?.sharingDetails?.sharingMedicine?.name ?? data?.sharingMedicine?.name ?? baseMedicine?.name ?? "";
    const requestedQuantity = data?.offeredMedicine?.offerAmount ?? data?.acceptedOffer?.responseAmount ?? 0;
    const unit = baseMedicine?.unit ?? "";
    const quantity = baseMedicine?.quantity ?? "";
    const pricePerUnit = baseMedicine?.pricePerUnit ?? 0;
    const manufacturer = baseMedicine?.manufacturer ?? "";
    const createdAt = data?.createdAt ?? "";

    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, "dd/MM")}/${todayDate.getFullYear() + 543}`);

    // Column widths for the main 5-col table
    const col1 = cm(1.5); // ลำดับ
    const col2 = cm(5);   // รายการ
    const col3 = cm(2);   // จำนวน
    const col4 = cm(2);   // ราคาต่อหน่วย
    const col5 = cm(2.5); // ราคารวม

    const mainTableHeaderRow = new TableRow({
        children: [
            ncell("ลำดับ", col1, { bold: true, border: true }),
            ncell("รายการ", col2, { bold: true, border: true }),
            ncell("จำนวน", col3, { bold: true, border: true }),
            ncell("ราคาต่อหน่วย", col4, { bold: true, border: true }),
            ncell("ราคารวม", col5, { bold: true, border: true }),
        ],
    });

    const sectionLabelRow = (label: string) =>
        new TableRow({
            children: [
                ncell("", col1, { border: true }),
                ncell(label, col2, { bold: true, border: true }),
                ncell("", col3, { border: true }),
                ncell("", col4, { border: true }),
                ncell("", col5, { border: true }),
            ],
        });

    const borrowedRow = new TableRow({
        children: [
            ncell(toThaiNumerals(1), col1, { border: true }),
            ncell(`${requestedMedicineName} ${quantity}${manufacturer ? `\nผู้ผลิต: ${manufacturer}` : ""}`, col2, { border: true }),
            ncell(`${formatThaiNumber(Number(requestedQuantity))} ${unit ? toThaiDigits(unit) : ""}`, col3, { border: true }),
            ncell(`${formatThaiNumber(Number(pricePerUnit))} บาท`, col4, { border: true }),
            ncell(`${formatThaiNumber(Number(requestedQuantity) * Number(pricePerUnit))} บาท`, col5, { border: true }),
        ],
    });

    const returnRows = returnList.map((item: any, index: number) => {
        const name = item?.name ?? requestedMedicineName;
        const amount = Number(item?.returnAmount ?? 0);
        const q = item?.quantity ?? quantity;
        const u = item?.unit ?? unit;
        const ppu = Number(item?.pricePerUnit ?? pricePerUnit ?? 0);
        const total = Number(amount * ppu);
        const manu = (item?.manufacturer ?? manufacturer ?? "") as string;
        const lot = (item?.batchNumber ?? item?.lotNumber ?? "") as string;
        const expFormatted = formatThaiDateFromAny(item?.expiryDate ?? item?.expiredDate ?? item?.expireDate ?? item?.expiry);
        const details = [
            `${name} ${q}`,
            manu ? `ผู้ผลิต ${manu}` : "",
            lot ? `ล็อต ${toThaiDigits(lot)}` : "",
            expFormatted ? `วันหมดอายุ ${expFormatted}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        return new TableRow({
            children: [
                ncell(toThaiNumerals(index + 2), col1, { border: true }),
                ncell(details, col2, { border: true }),
                ncell(`${formatThaiNumber(amount)} ${u ? toThaiDigits(u) : ""}`, col3, { border: true }),
                ncell(`${formatThaiNumber(ppu)} บาท`, col4, { border: true }),
                ncell(`${formatThaiNumber(total)} บาท`, col5, { border: true }),
            ],
        });
    });

    const mainTable = new Table({
        columnWidths: [col1, col2, col3, col4, col5],
        borders: noTableBorders,
        rows: [mainTableHeaderRow, sectionLabelRow("รายการยาที่ยืม"), borrowedRow, sectionLabelRow("รายการยาที่คืน"), ...returnRows],
    });

    const children: any[] = [
        new Table({
            columnWidths: [cm(4), cm(3), cm(9)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell(toThaiDigits("ที่ สข. 80231"), cm(4)), ncell("", cm(3)), rcell(borrowingHospitalNameTH, cm(9))] }),
                new TableRow({ children: [ncell("", cm(4)), ncell("", cm(3)), rcell(`ที่อยู่ ${toThaiDigits(data?.userData?.address ?? "")}`, cm(9))] }),
            ],
        }),
        tPara(today, AlignmentType.CENTER, cm(0.3)),
        tPara("เรื่อง    ขอคืนเวชภัณฑ์ยา"),
        tPara(`เรียน    ผู้อำนวยการ ${lendingHospitalNameTH}`),
        tPara(
            `         เนื่องด้วย ${borrowingHospitalNameTH} มีความประสงค์ที่จะขอคืนยาเวชภัณฑ์ยา จำนวน ${formatThaiNumber(Number(requestedQuantity))} รายการ โดยรายละเอียดดังต่อไปนี้`,
            undefined, cm(0.3)
        ),
        mainTable,
        tPara("         จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป", undefined, cm(0.5)),
        new Table({
            columnWidths: [cm(9), cm(7)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("", cm(9)), ncell("ขอแสดงความนับถือ", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(`ผู้อำนวยการ${data?.userData?.director ?? ""}`, cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(`ผู้อำนวยการ${borrowingHospitalNameTH}`, cm(7))] }),
            ],
        }),
        tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, cm(2)),
        tPara(`ติดต่อ ${toThaiDigits(data?.userData?.contact ?? "")}`),
    ];

    const doc = new Document({
        sections: [{
            properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: cm(1.5), bottom: cm(2), left: cm(3), right: cm(2) } } },
            children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `เอกสารคืนยา_${format(new Date(), "ddMMyyyy")}.docx`);
}
