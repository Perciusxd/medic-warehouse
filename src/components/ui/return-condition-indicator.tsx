import React from 'react';
import { SquareCheck, SquareX } from 'lucide-react';

interface ReturnConditionStatus {
  exactType?: boolean;
  subType?: boolean;
  supportType?: boolean;
  otherType?: boolean;
  noReturn?: boolean;
}

interface ReturnConditionIndicatorProps {
  status: ReturnConditionStatus;
}

const ReturnConditionIndicator: React.FC<ReturnConditionIndicatorProps> = ({ status }) => {
  const { exactType, subType, supportType, otherType, noReturn } = status;

  let exactTypeDiv = null;
  if (exactType === true) {
    exactTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />รับคืนเฉพาะรายการนี้</div>;
  } else if (exactType === false) {
    exactTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />รับคืนเฉพาะรายการนี้</div>;
  }

  let subTypeDiv = null;
  if (subType === true) {
    subTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />รับคืนรายการอื่นได้</div>;
  } else if (subType === false) {
    subTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />รับคืนรายการอื่นได้</div>;
  }

  let supportTypeDiv = null;
  if (supportType === true) {
    supportTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />ขอสนับสนุน</div>;
  } else if (supportType === false) {
    supportTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />ขอสนับสนุน</div>;
  }

  let otherTypeDiv = null;
  if (otherType === true) {
    otherTypeDiv = <div className="flex text-green-600 items-center"> <SquareCheck />รับคืนรายการทดแทน</div>;
  } else if (otherType === false) {
    otherTypeDiv = <div className="flex text-red-600 items-center"> <SquareX />รับคืนรายการทดแทน</div>;
  }

  let noReturnDiv = null;
  if (noReturn === true) {
    noReturnDiv = <div className="flex text-green-600 items-center"> <SquareCheck />ไม่ต้องคืน</div>;
  } else if (noReturn === false) {
    noReturnDiv = <div className="flex text-red-600 items-center"> <SquareX />false</div>;
  }

  if (noReturn === true) {
    return (
      <div className="flex flex-row justify-center">
        {noReturnDiv}
      </div>
    );
  } else {
    return (
      <div className="flex flex-row">
        <div className="flex flex-col items-left gap-2 basis-1/2">
          <div className="basis-1/2 text-left gap-1">{exactTypeDiv}</div>
          <div className="basis-1/2 text-left gap-1">{subTypeDiv}</div>
        </div>
        <div className="flex flex-col items-left gap-2 basis-1/2">
          <div className="basis-1/2 text-left gap-1">{supportTypeDiv}</div>
          <div className="basis-1/2 text-left gap-1">{otherTypeDiv}</div>
        </div>
      </div>
    );
  }
};

export default ReturnConditionIndicator; 