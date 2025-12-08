import { customIcons } from './customIcons';

// Helper to get piece image URL
export const getPieceImageUrl = (pieceType: string, isWhite: boolean = true): string => {
  // 1. Check for standard Wikimedia chess pieces
  const pieceMap: Record<string, string> = {
    "Pawn": "Pawn", "Rook": "Rook", "Knight": "Knight",
    "Bishop": "Bishop", "Queen": "Queen", "King": "King",
  };

  const standardPiece = pieceMap[pieceType];
  if (standardPiece) {
    const urls: Record<string, string> = {
        'Chess_Pawn_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
        'Chess_Pawn_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
        'Chess_Rook_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
        'Chess_Rook_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
        'Chess_Knight_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        'Chess_Knight_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        'Chess_Bishop_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
        'Chess_Bishop_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
        'Chess_Queen_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
        'Chess_Queen_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
        'Chess_King_lt.svg': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
        'Chess_King_dt.svg': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    };
    const key = `Chess_${pieceType}_${isWhite ? 'lt' : 'dt'}.svg`;


    // A default for any pieces not in the map
    return urls[key] || "";
  }


  // 2. Check for custom icons
  const customIcon = customIcons.find(icon => icon.id === pieceType);
  if (customIcon) {
    // For custom icons, we'll embed the SVG directly as a data URI
    // We can also change the color based on the `isWhite` flag
    const color = isWhite ? "white" : "black";
    const coloredSvg = customIcon.svg.replace(
      'fill_placeholder',
      `fill="${color}" stroke="${isWhite ? 'black' : 'white'}" stroke-width="1"`
    );

    // Base64 encode the SVG
    const svgBase64 = btoa(coloredSvg);
    return `data:image/svg+xml;base64,${svgBase64}`;
  }

  // 3. Fallback for pieces that are neither standard nor custom
  return "";
};
