'use client'
import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers'
import { DownloadIcon } from 'lucide-react'

const ReturnPdfMultiPreview = dynamic(() => import('./return_pdf_multi'), { ssr: false })

interface Props {
    data: any
    returnList: any
    className?: string
    buttonText?: string
}

export default function ReturnPdfMultiButton({ data, returnList, className, buttonText = 'ออกเอกสาร PDF' }: Props) {
    const { user } = useAuth()
    const previewRef = useRef<any>(null)

    const handleGenerate = () => {
        if (previewRef.current && typeof previewRef.current.savePdf === 'function') {
            previewRef.current.savePdf()
        }
    }

    return (
        <div className={className}>
            <Button variant="ghost" size="sm" onClick={handleGenerate} className='cursor-pointer'>
                {/* {buttonText} */}
                <DownloadIcon />
            </Button>
            {/* Hidden preview for generation */}
            <div style={{ display: 'none' }}>
                <ReturnPdfMultiPreview ref={previewRef} data={data} returnList={returnList} userData={user ?? {}} />
            </div>
        </div>
    )
}


