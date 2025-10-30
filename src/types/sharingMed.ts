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
      returnMedicine?: any;
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
        returnType: "normalReturn" | "supportReturn";
        returnConditions: {
          condition: "exactType" | "otherType";
          otherTypeSpecification: string;
        };
        supportCondition: "servicePlan" | "budgetPlan" | "freePlan";
        // exactType: boolean;
        // otherType: boolean;
        // subType: boolean;
        // supportType: boolean;
        // noReturn: boolean;
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
    packingSize: string;
    sharingAmount: number;
  };
  // sharingReturnTerm: {
  //   returnType: "normalReturn" | "supportReturn" | "all";
  //   returnConditions: {
  //     condition: "exactType" | "otherType";
  //     otherTypeSpecification: string;
  //   };
  //   supportCondition: "servicePlan" | "budgetPlan" | "freePlan";
  // };
  sharingReturnTerm: {
    returnType: "normalReturn" | "supportReturn" | "all";
    returnConditions: {
      exactTypeCondition: boolean;
      otherTypeCondition: boolean;
      otherTypeSpecification: string;
    };
    supportConditions: {
      servicePlanCondition: boolean;
      budgetPlanCondition: boolean;
      freePlanCondition: boolean;
    };

  };
  ticketType: "sharing" | "request";
  remainingAmount: number;
};