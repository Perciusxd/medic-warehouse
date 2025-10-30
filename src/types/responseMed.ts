import { RequestAsset } from "./requestMed";

export type ResponseAsset = {
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
    offerAmount: number;
    name: string;
    trademark: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    batchNumber: string;
    manufacturer: string;
    expiryDate: string;
    packingSize : string;
    /** exactType = same item, subType = substitute allowed */
    recieveCondition: "exactType" | "subType";
    /** optional image reference if present */
    imageRef?: string;
    returnConditions: {
      condition: "exactType" | "otherType";
      otherTypeSpecification?: string;
    };
    supportCondition: "servicePlan" | "budgetPlan" | "freePlan";
    returnType: "normalReturn" | "supportReturn";
  };
  requestDetails: RequestAsset;
  /** populated when a return transaction is recorded */
  returnMedicine?: any;
};
