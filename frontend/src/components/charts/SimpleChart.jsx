import React from "react";

const SimpleChart = ({ 
  type = "line", 
  data = [], 
  labels = [], 
  height = 200, 
  color = "#F26A8D",
  title = "Chart"
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  const renderLineChart = () => {
    if (data.length < 2) return null;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width="100%" height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100;
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill={color}
              className="hover:r-6 transition-all duration-200"
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = 100 / data.length;
    
    return (
      <svg width="100%" height={height} className="overflow-visible">
        {data.map((value, index) => {
          const barHeight = ((value - minValue) / (maxValue - minValue)) * 100;
          const x = (index * barWidth) + (barWidth * 0.1);
          const width = barWidth * 0.8;
          const y = 100 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={`${x}%`}
                y={`${y}%`}
                width={`${width}%`}
                height={`${barHeight}%`}
                fill={color}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity duration-200"
              />
              <text
                x={`${x + width/2}%`}
                y={`${y - 5}%`}
                textAnchor="middle"
                className="text-xs font-medium fill-current text-gray-600"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;
    const centerX = 50;
    const centerY = height / 2;
    
    return (
      <svg width="100%" height={height} className="overflow-visible">
        <g transform={`translate(${centerX}, ${centerY})`}>
          {data.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const radius = 40;
            
            const x1 = radius * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = radius * Math.sin((currentAngle * Math.PI) / 180);
            const x2 = radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 = radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 0 0`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(" ");
            
            const colors = ["#F26A8D", "#CDB4DB", "#F6E7D7", "#EDFDF6", "#FFB6C1", "#DDA0DD"];
            const fillColor = colors[index % colors.length];
            
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={fillColor}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity duration-200"
              />
            );
          })}
        </g>
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return renderLineChart();
      case "bar":
        return renderBarChart();
      case "pie":
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
        {labels.length > 0 && (
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>
      <div className="relative" style={{ height }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default SimpleChart; 