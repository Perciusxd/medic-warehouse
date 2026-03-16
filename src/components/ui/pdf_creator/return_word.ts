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

function formatThaiDateFromAny(input: any): string {
    if (!input && input !== 0) return "";
    const n = Number(input);
    const d = new Date(isNaN(n) ? input : n);
    if (isNaN(d.getTime())) return "";
    return toThaiDigits(`${format(d, "dd/MM")}/${d.getFullYear() + 543}`);
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

function tRun(text: string, opts: { bold?: boolean; underline?: boolean } = {}): TextRun {
    return new TextRun({ text, font: "THSarabunNew", size: 20, bold: opts.bold ?? false, underline: opts.underline ? {} : undefined });
}
function tPara(text: string, alignment?: (typeof AlignmentType)[keyof typeof AlignmentType], spacingBefore?: number): Paragraph {
    return new Paragraph({ children: [tRun(text)], alignment, spacing: spacingBefore ? { before: spacingBefore } : undefined });
}
function ncell(text: string, widthDxa?: number, opts: { bold?: boolean; border?: boolean; underline?: boolean } = {}): TableCell {
    return new TableCell({
        borders: opts.border ? thinBorders : noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ children: [tRun(text, { bold: opts.bold, underline: opts.underline })] })],
    });
}
function rcell(text: string, widthDxa?: number): TableCell {
    return new TableCell({
        borders: noBorders,
        width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : { size: 1, type: WidthType.AUTO },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [tRun(text)] })],
    });
}

export async function generateReturnWord(pdfData: any, returnData: any, userData: any) {
    const data = { ...pdfData, returnData, userData };

    const baseMedicine = data?.offeredMedicine ?? data?.sharingDetails?.sharingMedicine ?? data?.sharingMedicine ?? {};
    const returnMedicine = returnData?.returnMedicine ?? {};

    const receiveConditions = data?.offeredMedicine?.returnConditions ?? data?.returnTerm ?? data?.sharingDetails?.sharingReturnTerm?.receiveConditions ?? {};
    const selectedReturnType = returnData?.returnType ?? (receiveConditions?.exactType ? "exactType" : receiveConditions?.otherType ? "otherType" : receiveConditions?.supportType ? "supportType" : "subType");

    const returnTerm = selectedReturnType === "exactType" ? "ส่งคืนตามประเภท"
        : selectedReturnType === "otherType" ? "คืนรายการอื่น"
        : selectedReturnType === "supportType" ? "แบบสนับสนุน"
        : "คืนรายการทดแทน";

    const lendingHospitalNameTH = data?.postingHospitalNameTH ?? data?.sharingDetails?.postingHospitalNameTH ?? data?.postingHospitalNameEN ?? "";
    const borrowingHospitalNameTH = data?.respondingHospitalNameTH ?? data?.respondingHospitalNameEN ?? data?.sharingDetails?.respondingHospitalNameTH ?? "";

    const requestedMedicineName = data?.requestDetails?.name ?? data?.requestMedicine?.name ?? data?.sharingDetails?.sharingMedicine?.name ?? data?.sharingMedicine?.name ?? baseMedicine?.name ?? "";
    const requestedQuantity = data?.offeredMedicine?.offerAmount ?? data?.acceptedOffer?.responseAmount ?? 0;
    const unit = baseMedicine?.unit ?? "";
    const pricePerUnit = baseMedicine?.pricePerUnit ?? 0;
    const manufacturer = baseMedicine?.manufacturer ?? "";
    const createdAt = data?.createdAt ?? data?.requestTerm?.expectedReturnDate ?? "";

    const resolveSupport = (v: any): boolean => { if (typeof v === "string") return v === "support"; if (typeof v === "boolean") return v; return false; };
    const isSupport = resolveSupport(data?.returnData?.supportRequest ?? data?.supportRequest);
    const documentType = isSupport ? "ขอสนับสนุนเวชภัณฑ์ยา" : "ขอคืนเวชภัณฑ์ยา";

    const todayDate = new Date();
    const today = toThaiDigits(`${format(todayDate, "dd/MM")}/${todayDate.getFullYear() + 543}`);

    const children: any[] = [
        new Table({
            columnWidths: [cm(4), cm(3), cm(9)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("ที่ สข. 80231", cm(4)), ncell("", cm(3)), rcell(lendingHospitalNameTH, cm(9))] }),
                new TableRow({ children: [ncell("", cm(4)), ncell("", cm(3)), rcell(`ที่อยู่ ${userData.address ?? ""}`, cm(9))] }),
            ],
        }),
        tPara(today, AlignmentType.CENTER, cm(0.3)),
        tPara(`เรื่อง    ${documentType}`),
        tPara(`เรียน    ผู้อำนวยการ ${borrowingHospitalNameTH}`),
        tPara(
            isSupport
                ? `         เนื่องด้วย ${lendingHospitalNameTH} มีความประสงค์จะขอสนับสนุนแทนการส่งคืนยาเนื่องจาก${returnMedicine?.reason ?? ""} ดังรายการต่อไปนี้`
                : `         เนื่องด้วย ${lendingHospitalNameTH} มีความประสงค์ที่จะขอคืนยา ซึ่งเป็นการคืนยา${returnTerm} ดังรายการต่อไปนี้`,
            undefined, cm(0.3)
        ),
        // Borrowed medicine table
        tPara("รายการยาที่ยืม", undefined, cm(0.5)),
        new Table({
            columnWidths: [cm(3), cm(2), cm(1.5), cm(2), cm(2), cm(3)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("รายการ", cm(3), { bold: true }), ncell("จำนวน", cm(2), { bold: true }), ncell("ราคา", cm(1.5), { bold: true }), ncell("มูลค่า", cm(2), { bold: true }), ncell("ผู้ผลิต", cm(2), { bold: true }), ncell("วันที่ขอยืม", cm(3), { bold: true })] }),
                new TableRow({
                    children: [
                        ncell(requestedMedicineName, cm(3)),
                        ncell(`${requestedQuantity.toLocaleString("th-TH")} (${unit})`, cm(2)),
                        ncell(Number(pricePerUnit).toFixed(2), cm(1.5)),
                        ncell(Number(requestedQuantity * pricePerUnit).toLocaleString("th-TH"), cm(2)),
                        ncell(manufacturer, cm(2)),
                        ncell(createdAt ? `${format(new Date(Number(createdAt)), "dd/MM")}/${new Date(Number(createdAt)).getFullYear() + 543}` : "", cm(3)),
                    ],
                }),
            ],
        }),
    ];

    if (!isSupport) {
        children.push(
            tPara("รายการยาที่คืน", undefined, cm(0.5)),
            new Table({
                columnWidths: [cm(3), cm(2), cm(1.5), cm(2), cm(2), cm(3)],
                borders: noTableBorders,
                rows: [
                    new TableRow({ children: [ncell("รายการ", cm(3), { bold: true }), ncell("จำนวน", cm(2), { bold: true }), ncell("ราคา", cm(1.5), { bold: true }), ncell("มูลค่า", cm(2), { bold: true }), ncell("ผู้ผลิต", cm(2), { bold: true }), ncell("วันหมดอายุ", cm(3), { bold: true })] }),
                    new TableRow({
                        children: [
                            ncell(returnMedicine?.name ?? "", cm(3)),
                            ncell(`${(returnMedicine?.returnAmount ?? 0).toLocaleString("th-TH")} (${returnMedicine?.quantity ?? ""})`, cm(2)),
                            ncell(Number(returnMedicine?.pricePerUnit ?? 0).toLocaleString("th-TH"), cm(1.5)),
                            ncell(Number((returnMedicine?.returnAmount ?? 0) * (returnMedicine?.pricePerUnit ?? 0)).toLocaleString("th-TH"), cm(2)),
                            ncell(returnMedicine?.manufacturer ?? "", cm(2)),
                            ncell(
                                returnMedicine?.expiryDate
                                    ? (() => { const d = new Date(Number(returnMedicine.expiryDate)); return isNaN(d.getTime()) ? "" : `${format(d, "dd/MM")}/${d.getFullYear() + 543} (${returnMedicine?.batchNumber ?? ""})` })()
                                    : "",
                                cm(3)
                            ),
                        ],
                    }),
                ],
            })
        );
    }

    children.push(
        tPara(
            isSupport
                ? `         จึงเรียนมาเพื่อพิจารณาดำเนินการหักจากงบประมาณ${lendingHospitalNameTH} และ${borrowingHospitalNameTH}ขอขอบคุณมา ณ โอกาสนี้`
                : "         จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป",
            undefined, cm(0.5)
        ),
        new Table({
            columnWidths: [cm(9), cm(7)],
            borders: noTableBorders,
            rows: [
                new TableRow({ children: [ncell("", cm(9)), ncell("ขอแสดงความนับถือ", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell("", cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(`ผู้อำนวยการ${userData.director ?? ""}`, cm(7))] }),
                new TableRow({ children: [ncell("", cm(9)), ncell(`ผู้อำนวยการ${lendingHospitalNameTH}`, cm(7))] }),
            ],
        }),
        tPara("กลุ่มงานเภสัชกรรมและคุ้มครองผู้บริโภค", undefined, cm(2)),
        tPara(`ติดต่อ ${userData.contact ?? ""}`)
    );

    const doc = new Document({
        sections: [{
            properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: cm(1.5), bottom: cm(2), left: cm(2), right: cm(2) } } },
            children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `เอกสารคืนยา_${format(new Date(), "ddMMyyyy")}.docx`);
}
