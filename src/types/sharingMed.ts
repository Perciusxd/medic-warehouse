export type SharingAsset = {
  id: string;
  requestId: string;
  postingHospitalId: string;
  postingHospitalNameEN: string;
  postingHospitalNameTH: string;
  postingHospitalAddress: string;
  status: "offered" | "to-transfer" | "to-return" | "returned" | "cancelled";
  createdAt: string;
  responseIds: string[];
  responseDetails: [
    {
      acceptedOffer: any;
      acceptedAt: object;
      createdAt: string;
      id: string;
      respondingHospitalId: string;
      respondingHospitalNameEN: string;
      respondingHospitalNameTH: string;
      respondingHospitalAddress: string;
      status:
        | "pending"
        | "offered"
        | "re-confirm"
        | "to-transfer"
        | "to-confirm"
        | "in-return"
        | "to-return"
        | "confirm-return"
        | "returned"
        | "cancelled";
      updatedAt: string;
      returnTerm: {
        exactType: boolean;
        otherType: boolean;
        subType: boolean;
        supportType: boolean;
        noReturn: boolean;
      };
    },
  ];
  sharingMedicine: {
    batchNumber: string;
    expiryDate: string;
    imageRef: string;
    manufacturer: string;
    name: string;
    pricePerUnit: number;
    quantity: number;
    trademark: string;
    unit: string;
    sharingAmount: number;
  };
  sharingReturnTerm: {
    receiveConditions: {
      exactType: boolean;
      otherType: boolean;
      subType: boolean;
      supportType: boolean;
      noReturn: boolean;
    };
  };
  ticketType: "sharing" | "request";
  remainingAmount: number;
};