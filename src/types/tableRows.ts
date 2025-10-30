import type { ResponseAsset } from "./responseMed";

// Common status type used in request response details
export type RequestResponseStatus =
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

export type RequestResponseDetail = {
  id: string;
  updatedAt: string;
  respondingHospitalNameTH: string;
  status: RequestResponseStatus;
  offeredMedicine?: {
    offerAmount: number;
    name: string;
    pricePerUnit: number;
    unit: string;
    trademark?: string;
    manufacturer?: string;
    packingSize : string;
  };
  returnMedicine?: any;
};

// Row shape for the transaction-request table (request tickets list)
export type RequestTicketRow = {
  id: string;
  updatedAt: string;
  postingHospitalNameTH: string;
  requestMedicineImage?: string | { imageRef?: string };
  requestMedicine: {
    name: string;
    trademark: string;
    quantity?: string | number;
    requestAmount: number;
    pricePerUnit: number;
    unit: string;
    manufacturer: string;
    packingSize : string;
  };
  requestTerm: {
    expectedReturnDate?: string;
    returnType: "normalReturn" | "supportReturn";
    receiveConditions: { condition: "exactType" | "subType" };
    returnConditions?: { condition: "exactType" | "otherType"; otherTypeSpecification?: string } | null;
    supportCondition: "servicePlan" | "budgetPlan" | "freePlan";
  };
  responseDetails: RequestResponseDetail[];
  remainingAmount: number;
};

// Row shape for the sharing table (sharing tickets list)
export type SharingReceiveConditions = {
  returnType: "normalReturn" | "supportReturn" | "all";
  returnConditions?: {
    exactTypeCondition: boolean;
    otherTypeCondition: boolean;
    otherTypeSpecification: string;
    // condition: "exactType" | "otherType"; 
    // otherTypeSpecification?: string } | null;
    supportCondition?: {
      servicePlanCondition: boolean;
      budgetPlanCondition: boolean;
      freePlanCondition: boolean;
    }

    // "servicePlan" | "budgetPlan" | "freePlan";
  };
  };

export type SharingDetailsSummary = {
    createdAt: string;
    postingHospitalNameTH: string;
    postingHospitalNameEN: string;
    sharingMedicine: {
      name: string;
      trademark: string;
      quantity: number | string;
      unit: string;
      manufacturer: string;
      batchNumber: string;
      expiryDate: string;
      pricePerUnit: number;
      sharingAmount: number;
      packingSize : string;
    };
    sharingReturnTerm: { receiveConditions: SharingReceiveConditions };
  };

export type SharingTicketRow = {
  id: string;
  sharingDetails: SharingDetailsSummary;
};

// Row shape for confirm-return table entries: responses augmented with ticket type
export type ConfirmReturnRow = ResponseAsset & { ticketType: "request" | "sharing" };

// Handler payloads for request ticket actions
export type ApproveOfferPayload = RequestTicketRow & {
  responseId: string;
  offeredMedicine: ResponseAsset["offeredMedicine"];
  requestDetails: RequestTicketRow["requestMedicine"];
  responseDetail: RequestResponseDetail;
};

export type ConfirmReceiveDeliveryPayload = RequestTicketRow & {
  displayHospitalName: string;
  displayMedicineName: string;
  displayMedicineAmount: number;
  responseId: string;
  offeredMedicine: ResponseAsset["offeredMedicine"];
  requestDetails: RequestTicketRow["requestMedicine"];
};

export type ReturnClickPayload = RequestTicketRow & {
  responseId: string;
  offeredMedicine: ResponseAsset["offeredMedicine"];
  requestDetails: RequestTicketRow["requestMedicine"];
  responseDetail: RequestResponseDetail;
};


