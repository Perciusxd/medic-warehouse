import { RequestAsset } from "./requestMed";

export type ResponseAsset = {
  returnMedicine?: any;
  id: string;
  requestId: string;
  respondingHospitalId: string;
  respondingHospitalNameEN: string;
  respondingHospitalNameTH: string;
  respondingHospitalAddress: string;
  status: "accepted" | "rejected" | "pending";
  createdAt: string;
  updatedAt: string;
  offeredMedicine: {
    offerAmount?: any;
    name: string;
    trademark: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    batchNumber: string;
    manufacturer: string;
    manufactureDate: string;
    expiryDate: string;
    imageRef: string;
    returnTerm: {
      sameUnit: boolean;
      subsidiary: boolean;
      sameValue: boolean;
      other: boolean;
      notes: string;
    };
  };
  requestDetails: RequestAsset;
};
