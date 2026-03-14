"use client";

import React from 'react'
import { Button } from './button'
import { ArrowLeft } from 'lucide-react'

import { useRouter } from "next/navigation";

function BackButton() {
    const router = useRouter();
    return <Button variant="outline"
        onClick={() => router.back()}
        size="icon"
    >
        <ArrowLeft className="h-4 w-4" />
    </Button>
}

export default BackButton
