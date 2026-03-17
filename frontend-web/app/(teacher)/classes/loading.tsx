import AnimatedLoading from '@/app/components/ui/animated-loading';
import React from 'react'

function Loading() {
    return <AnimatedLoading
        title="Getting things ready"
        subtitle='Loading your classes for this period'
        tone="clean"
    />
}

export default Loading;
