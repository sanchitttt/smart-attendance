import AnimatedLoading from '@/app/components/ui/animated-loading';
import React from 'react'

function Loading() {
    return <AnimatedLoading
        title="Setting up attendance"
        subtitle='This will only take a few seconds'
        tone="clean"
    />
}

export default Loading;
