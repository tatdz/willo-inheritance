interface WilloLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WilloLogo({ className = "", size = 'md' }: WilloLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="30%" stopColor="#FF6B35" />
            <stop offset="60%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#FFD60A" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main flame body */}
        <path
          d="M50 85 C30 85, 25 65, 35 45 C40 30, 45 25, 50 15 C55 25, 60 30, 65 45 C75 65, 70 85, 50 85 Z"
          fill="url(#fireGradient)"
          filter="url(#glow)"
        />
        
        {/* Inner flame details */}
        <path
          d="M50 75 C38 75, 35 60, 42 45 C45 35, 48 32, 50 25 C52 32, 55 35, 58 45 C65 60, 62 75, 50 75 Z"
          fill="#FFAA00"
          opacity="0.8"
        />
        
        {/* Core flame */}
        <path
          d="M50 65 C43 65, 42 55, 46 45 C47 40, 48 38, 50 35 C52 38, 53 40, 54 45 C58 55, 57 65, 50 65 Z"
          fill="#FFDD44"
          opacity="0.9"
        />
        
        {/* Flame tip sparkles */}
        <circle cx="48" cy="20" r="1.5" fill="#FFE66D" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="52" cy="18" r="1" fill="#FFE66D" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="15" r="0.8" fill="#FFFFFF" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}