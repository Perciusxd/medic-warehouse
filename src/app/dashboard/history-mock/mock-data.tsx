// mock-medicine-data.ts

// UUID mock generator
function mockUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Type definition
export type MedicineTableRowData = {
  ticketType: "request" | "sharing";
  updatedAt?: string | number;
  createdAt?: string | number;
  requestMedicine?: {
    name: string;
    trademark: string;
    quantity: number;
    unit: string;
    requestAmount: number;
    pricePerUnit: number;
    manufacturer?: string;
  };
  sharingMedicine?: {
    name: string;
    trademark: string;
    quantity: number;
    unit: string;
    sharingAmount: number;
    pricePerUnit: number;
    manufacturer?: string;
  };
  requestTerm?: {
    receiveConditions: {
      condition: "exactType" | string;
      supportType: boolean;
    };
  };
  sharingReturnTerm?: {
    receiveConditions: {
      exactType?: boolean;
      subType?: boolean;
      supportType?: boolean;
      otherType?: boolean;
      noReturn?: boolean;
    };
  };
  responseDetails: {
    id: string;
    respondingHospitalNameTH: string;
    status:
      | "offered"
      | "pending"
      | "to-transfer"
      | "to-return"
      | "completed";
    actualReturnDate?: string | number;
    offeredMedicine?: {
      offerAmount: number;
    };
    acceptedOffer?: {
      responseAmount?: number;
    };
    acceptedMedicine?: {
      note?: string;
    };
  }[];
};

const allowedStatuses = ["offered", "pending", "to-transfer", "to-return", "completed"] as const;

export const mockMedicineTableData: MedicineTableRowData[] = Array.from({ length: 17 }, (_, i) => {
  const isRequest = i % 2 === 0;
  const timestamp = Date.now() - i * 3600_000;
  const status = allowedStatuses[i % allowedStatuses.length];

  return {
    ticketType: isRequest ? "request" : "sharing",
    updatedAt: timestamp,
    createdAt: timestamp - 3600_000,
    ...(isRequest
      ? {
          requestMedicine: {
            name: `ยา ${i + 1}`,
            trademark: `ตราสินค้า ${i + 1}`,
            quantity: 100 + i,
            unit: "mg",
            requestAmount: 10 + i,
            pricePerUnit: 20 + i,
            deliveryDate: new Date(Date.now() + (i + 2) * 24 * 3600_000).toISOString(),
            manufacturer: `ผู้ผลิต ${i + 1}`,
          },
          requestTerm: {
            receiveConditions: {
              condition: i % 2 === 0 ? "exactType" : "substitute",
              supportType: i % 3 === 0,
              expectedReturnDate: new Date(Date.now() + (i + 20 + i) * 24 * 3600_000).toISOString(),
            },
          },
        }
      : {
          sharingMedicine: {
            name: `ยาที่แบ่งปัน ${i + 1}`,
            trademark: `แบรนด์ ${i + 1}`,
            quantity: 200 + i,
            unit: "ml",
            sharingAmount: 5 + i,
            pricePerUnit: 15 + i,
            deliveryDate: new Date(Date.now() + (i + 2) * 24 * 3600_000).toISOString(),
            manufacturer: `ผู้ผลิต ${i + 2}`,
          },
          sharingReturnTerm: {
            receiveConditions: {
              exactType: i % 2 === 0,
              subType: i % 3 === 0,
              supportType: i % 4 === 0,
              otherType: i % 5 === 0,
              noReturn: i % 6 === 0,
              expectedReturnDate: new Date(Date.now() + (i + 20 + i) * 24 * 3600_000).toISOString(),
            },
          },
        }),
    responseDetails: [
      {
        id: mockUuid(),
        respondingHospitalNameTH: `โรงพยาบาลตัวอย่าง ${i + 1}`,
        status,
        ...(isRequest
          ? {
              offeredMedicine: {
                offerAmount: 5 + i,
              },
            }
          : {
              acceptedOffer: {
                responseAmount: 3 + i,
              },
              acceptedMedicine: {
                note: `หมายเหตุ ${i + 1}`,
              },
            }),
        actualReturnDate: status === "completed" ? new Date(Date.now() + (i + 10) * 24 * 3600_000).toISOString() : undefined,
      },
    ],
  };
});
