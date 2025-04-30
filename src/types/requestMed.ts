export type RequestAsset = {
  id: string;
  postingHospitalId: string;
  postingHospitalNameEN: string;
  postingHospitalNameTH: string;
  postingHospitalAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  urgent: boolean;
  requestMedicine: {
    name: string;
    trademark: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    batchNumber: string;
    manufacturer: string;
    manufactureDate: string;
    imageRef: string;
  };
  requestTerm: {
    expectedReturnDate: string;
    receiveConditions: {
      exactType: boolean;
      subsidiary: boolean;
      other: boolean;
      notes: string;
    };
  };
};
