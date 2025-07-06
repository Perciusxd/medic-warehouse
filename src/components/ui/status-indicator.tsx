import React from 'react';
import clsx from 'clsx';

const STATUS_COLORS: any = {
    'urgent': 'bg-red-600',
    'immediate': 'bg-orange-500',
    'normal': 'bg-green-500',
    'pending': 'bg-yellow-400',
    'offered': 'bg-blue-400',
    're-confirm': 'bg-purple-400',
    'to-transfer': 'bg-indigo-500',
    'in-transfer': 'bg-purple-500',
    'to-return': 'bg-teal-500',
    'in-return': 'bg-cyan-500',
    'rejected': 'bg-red-500',
    'return-overdue': 'bg-orange-600',
    'returned': 'bg-green-500',
};

export default function StatusIndicator({ status }: any) {
    const color = STATUS_COLORS[status] || 'bg-gray-400';

    return (
        <div className="flex items-center space-x-2">
            <div className={clsx('w-3 h-3 rounded-full', color)}></div>
            {/* <span className="text-sm text-gray-700 capitalize">{status.replace(/-/g, ' ')}</span> */}
        </div>
    );
}