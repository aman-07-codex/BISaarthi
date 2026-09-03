import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon-only' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkHref?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  linkHref,
}) => {
  const sizeMap = {
    sm: { img: 28, title: 'text-sm', sub: 'text-[9px]' },
    md: { img: 36, title: 'text-base', sub: 'text-[10px]' },
    lg: { img: 48, title: 'text-xl', sub: 'text-xs' },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-full shadow-2xs">
        <Image
          src="/bisaarthi-logo.png"
          alt="BISaarthi Emblem"
          width={sizeMap.img}
          height={sizeMap.img}
          className="object-contain"
          priority
        />
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-wider uppercase ${
              variant === 'light' ? 'text-white' : 'text-[#18211D] dark:text-white'
            } ${sizeMap.title}`}
          >
            BISAARTHI
          </span>
          <span
            className={`font-medium tracking-tight mt-0.5 ${
              variant === 'light'
                ? 'text-[#A7B8AE]'
                : 'text-[#606E66] dark:text-[#8FA89B]'
            } ${sizeMap.sub}`}
          >
            Your guide to Indian Standards
          </span>
        </div>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="inline-flex items-center group transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
};
