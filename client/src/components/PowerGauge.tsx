import { useEffect, useRef } from 'react';

interface PowerGaugeProps {
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  title: string;
  isOnline: boolean;
  subtitle?: string;
  additionalData?: Array<{ label: string; value: string }>;
  onControl?: () => void;
  controlLabel?: string;
}

export function PowerGauge({
  value,
  maxValue,
  unit,
  color,
  title,
  isOnline,
  subtitle,
  additionalData = [],
  onControl,
  controlLabel = "Control"
}: PowerGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current) {
      const percentage = Math.min(value / maxValue, 1);
      const offset = circumference - (percentage * circumference);
      circleRef.current.style.strokeDashoffset = offset.toString();
    }
  }, [value, maxValue, circumference]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-error'}`} />
      </div>

      <div className="relative w-[200px] h-[200px] mx-auto mb-4">
        <svg width="200" height="200" className="absolute inset-0 transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(20, 5.9%, 90%)"
            strokeWidth="12"
          />
          <circle
            ref={circleRef}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-3xl font-bold ${isOnline ? 'text-gray-900' : 'text-gray-400'}`}>
            {isOnline ? value.toFixed(1) : '0.0'}
          </span>
          <span className={`text-sm ${isOnline ? 'text-gray-500' : 'text-gray-400'}`}>
            {unit}
          </span>
        </div>
      </div>

      {subtitle && (
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      )}

      {additionalData.length > 0 && (
        <div className={`grid grid-cols-2 gap-4 text-sm mb-4 ${additionalData.length === 1 ? 'grid-cols-1' : ''}`}>
          {additionalData.map((item, index) => (
            <div key={index}>
              <p className="text-gray-500">{item.label}</p>
              <p className={`font-semibold ${isOnline ? 'text-gray-900' : 'text-gray-400'}`}>
                {isOnline ? item.value : '--'}
              </p>
            </div>
          ))}
        </div>
      )}

      {onControl && (
        <button
          onClick={onControl}
          disabled={!isOnline}
          className={`w-full py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
            isOnline
              ? `${color === 'hsl(388E3C)' ? 'bg-secondary hover:bg-green-700' : 
                  color === 'hsl(1976D2)' ? 'bg-primary hover:bg-blue-700' : 
                  'bg-accent hover:bg-orange-600'} text-white`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-cog mr-2" />
          {controlLabel}
        </button>
      )}
    </div>
  );
}
