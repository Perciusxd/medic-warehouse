import React from 'react';
import clsx from 'clsx';

const STATUS_COLORS: any = {
    'urgent': 'bg-red-600',
    'immediate': 'bg-orange-500',
    'normal': 'bg-green-500',
    'pending': 'bg-yellow-200',
    'offered': 'bg-blue-200',
    're-confirm': 'bg-purple-200',
    'to-transfer': 'bg-indigo-200',
    'in-transfer': 'bg-purple-200',
    'to-return': 'bg-teal-200',
    'in-return': 'bg-cyan-200', 
    'rejected': 'bg-red-500',
    'return-overdue': 'bg-orange-600',
    'confirm-return': 'bg-amber-200',
    'returned': 'bg-green-200',
    'cancelled': 'bg-red-200',
    'to-confirm': 'bg-sky-200',
};

export default function StatusIndicator({ status }: any) {
    const color = STATUS_COLORS[status] || 'bg-gray-400';

    return (
        <div className="flex items-center space-x-2">
            <div className={clsx('w-3 h-3 rounded-full bg-', color)}></div>
            {/* <span className="text-sm text-gray-700 capitalize">{status.replace(/-/g, ' ')}</span> */}
        </div>
    );
}
export function getStatusColor(status: string) {
  return STATUS_COLORS[status] || "bg-gray-400";
}

const TEXT_STATUS_COLORS: any = {
    'urgent': 'text-red-700',
    'immediate': 'text-orange-700',
    'normal': 'text-green-700',
    'pending': 'text-yellow-700',
    'offered': 'text-blue-700',
    're-confirm': 'text-purple-700',
    'to-transfer': 'text-indigo-700',
    'in-transfer': 'text-purple-700',
    'to-return': 'text-teal-700',
    'in-return': 'text-cyan-700',
    'rejected': 'text-red-700',
    'return-overdue': 'text-orange-700',
    'confirm-return': 'text-amber-700',
    'returned': 'text-green-700',
    'cancelled': 'text-red-700',
    'to-confirm': 'text-sky-700',
};

export function getTextStatusColor(status: string) {
  return TEXT_STATUS_COLORS[status] || "text-gray-700";
}