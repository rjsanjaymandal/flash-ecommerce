
/**
 * Enterprise Color Mapping System
 * Maps user-defined color names to professional hex codes
 */
export const COLOR_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Off White": "#FAF9F6",
  "Navy": "#000080",
  "Beige": "#F5F5DC",
  "Red": "#E31837",
  "Green": "#008751",
  "Blue": "#0056B3",
  "Pink": "#FFC0CB",
  "Grey": "#808080",
  "Silver": "#C0C0C0",
  "Gold": "#D4AF37",
  "Yellow": "#FFD700",
  "Purple": "#6F2DA8",
  "Maroon": "#800000",
  "Olive": "#808000",
};

export function getColorHex(colorName: string, customMap?: Record<string, string>): string {
  if (!colorName) return "transparent";
  
  const activeMap = customMap || COLOR_MAP;
  
  // Try direct match
  const direct = activeMap[colorName];
  if (direct) return direct;
  
  // Try case-insensitive match
  const lower = colorName.toLowerCase();
  const match = Object.entries(activeMap).find(
    ([name]) => name.toLowerCase() === lower
  );
  
  if (match) return match[1];
  
  // If no match in custom map, fall back to default map if we weren't already using it
  if (customMap) {
      return getColorHex(colorName);
  }

  // Default to the name itself (maybe it's already a hex or valid CSS color)
  return colorName;
}
