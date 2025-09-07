import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  textClassName?: string
}

export function Logo({
  size = 'md',
  showText = true,
  className,
  textClassName
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const textClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        <Image
          src="/logo.svg"
          alt="Formify Logo"
          width={32}
          height={32}
          className="w-full h-full"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-semibold",
          textClasses[size],
          textClassName
        )}>
          Formify
        </span>
      )}
    </div>
  )
}

export default Logo
