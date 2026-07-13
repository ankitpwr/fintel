export const TreemapNode = (props: any) => {
  const { x, y, width, height, symbol, change, name, depth } = props;

  if (depth === 0 || width < 0 || height < 0) {
    return null;
  }

  const changeValue = change ?? 0;
  const isPositive = changeValue >= 0;

  const getHeatmapColor = (val: number) => {
    if (val >= 3) return "#00b151";
    if (val >= 2) return "#00873c";
    if (val >= 1) return "#0b5d2f";
    if (val > 0) return "#003e18";
    if (val === 0) return "#2b2a29";
    if (val > -1) return "#42000a";
    if (val > -2) return "#750014";
    if (val > -3) return "#9c001a";
    return "#cc0021";
  };

  const bgColor = getHeatmapColor(changeValue);

  const rawSymbol = symbol || name || "UNKNOWN";
  const symbolText = rawSymbol.split(".")[0];

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const symbolFontSize = Math.max(
    8,
    Math.min(14, width / (symbolText.length * 0.8)),
  );
  const percentFontSize = Math.max(7, Math.min(11, width / 5));

  const showSymbol = width > 35 && height > 25;
  const showChange = width > 50 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        stroke="#171615"
        strokeWidth={1.5}
        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
      />

      {showSymbol && (
        <text
          x={centerX}
          y={
            showChange
              ? centerY - symbolFontSize / 2
              : centerY + symbolFontSize / 3
          }
          textAnchor="middle"
          fill="#ffffff"
          fontWeight={600}
          fontSize={symbolFontSize}
          style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
        >
          {symbolText}
        </text>
      )}

      {showChange && (
        <text
          x={centerX}
          y={centerY + percentFontSize + 2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={percentFontSize}
          fontWeight={500}
          style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
        >
          {isPositive ? "+" : ""}
          {changeValue.toFixed(2)}%
        </text>
      )}
    </g>
  );
};
