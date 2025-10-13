export type RequestAsset = {
  id: string;
  postingHospitalId: string;
  postingHospitalNameEN: string;
  postingHospitalNameTH: string;
  postingHospitalAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  urgent: "urgent" | "immediate" | "normal";
  requestMedicine: {
    name: string;
    trademark: string;
    quantity: number;
    requestAmount: number;
    pricePerUnit: number;
    unit: string;
    batchNumber: string;
    manufacturer: string;
    manufactureDate: string;
    imageRef: string;
  };
  requestMedicineImage: string;
  requestTerm: {
    expectedReturnDate: string;
    returnType: "normalReturn" | "supportReturn";
    receiveConditions: {
      condition: "exactType" | "subType";
    };
    returnConditions: {
      condition: "exactType" | "otherType";
      otherTypeSpecification: string;
    };
    supportCondition: "servicePlan" | "budgetPlan" | "freePlan";
  };
};
