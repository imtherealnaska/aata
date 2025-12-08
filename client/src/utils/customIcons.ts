// Collection of 20 custom SVG icons for custom game pieces
export interface CustomIcon {
  id: string;
  name: string;
  svg: string;
}

export const customIcons: CustomIcon[] = [
  {
    id: "star",
    name: "Star",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  },
  {
    id: "shield",
    name: "Shield",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>`
  },
  {
    id: "sword",
    name: "Sword",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M6.92 5L5 6.92l7.07 7.08-1.41 1.41L9.24 14 8 15.24l3.54 3.54 1.41-1.41-1.41-1.41 1.41-1.41L20 21.5 21.5 20l-7.08-7.08L22 5.34 18.66 2 6.92 5zm1.41 1.41L16 3.66 20.34 8 13 15.34 8.33 6.41z"/></svg>`
  },
  {
    id: "flame",
    name: "Flame",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M13.5 .67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`
  },
  {
    id: "bolt",
    name: "Lightning",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`
  },
  {
    id: "heart",
    name: "Heart",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  },
  {
    id: "diamond",
    name: "Diamond",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2L2 9l10 13L22 9 12 2zm0 2.8L18.2 9H5.8L12 4.8zM12 19.2L5.8 11h12.4L12 19.2z"/></svg>`
  },
  {
    id: "moon",
    name: "Moon",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
  },
  {
    id: "sun",
    name: "Sun",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`
  },
  {
    id: "eye",
    name: "Eye",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`
  },
  {
    id: "skull",
    name: "Skull",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2C6.48 2 2 6.48 2 12c0 3.7 2.01 6.93 5 8.66V23h2v-2h2v2h2v-2h2v2h2v-2.34c2.99-1.73 5-4.96 5-8.66 0-5.52-4.48-10-10-10zM9 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`
  },
  {
    id: "target",
    name: "Target",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`
  },
  {
    id: "feather",
    name: "Feather",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76zM13 19H7v-5.99L13 7l5.99 5.99L13 19z"/></svg>`
  },
  {
    id: "leaf",
    name: "Leaf",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.67C7.94 17.17 9.5 12 17 8zm-4 1c-1.66 2.67-2.7 6.34-2.9 9.49.39-.06.79-.09 1.19-.13C13.19 15.5 14.7 12.5 17 10c-1.33-.33-2.67-.67-4-1z"/></svg>`
  },
  {
    id: "paw",
    name: "Paw",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><circle cx="8.5" cy="8.5" r="2.5"/><circle cx="15.5" cy="8.5" r="2.5"/><circle cx="4.5" cy="14.5" r="2.5"/><circle cx="19.5" cy="14.5" r="2.5"/><path d="M12 11c-2.21 0-4 1.79-4 4v3c0 2.21 1.79 4 4 4s4-1.79 4-4v-3c0-2.21-1.79-4-4-4z"/></svg>`
  },
  {
    id: "anchor",
    name: "Anchor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M17 15h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-5-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-2 3v12l-4-4v-3H4c0 5.52 4.48 10 10 10s10-4.48 10-10h-2v3l-4 4V10H8z"/></svg>`
  },
  {
    id: "cube",
    name: "Cube",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M21 8.62V6.82L12 2 3 6.82v1.8l9 4.36 9-4.36zM12 10.5L5.94 7.82 12 5.14l6.06 2.68L12 10.5zm-9 3.32l9 4.36 9-4.36v1.8l-9 4.36-9-4.36v-1.8z"/></svg>`
  },
  {
    id: "gem",
    name: "Gem",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M5 9l-1 7h16l-1-7H5zm7 6l-3-3h6l-3 3zm5-8H7l-2 4h14l-2-4z"/></svg>`
  },
  {
    id: "hourglass",
    name: "Hourglass",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/></svg>`
  },
  {
    id: "compass",
    name: "Compass",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill_placeholder><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5.5-8c0 3.03 2.47 5.5 5.5 5.5s5.5-2.47 5.5-5.5-2.47-5.5-5.5-5.5S6.5 8.97 6.5 12zm5.5-2l2.4 6.4-2.4-.9-2.4.9L11.5 10z"/></svg>`
  }
];

// Helper to get icon by ID
export function getCustomIconById(id: string): CustomIcon | undefined {
  return customIcons.find(icon => icon.id === id);
}

// Helper to render SVG from string
export function renderSvg(svgString: string, className: string = ""): string {
  // Add class to SVG string
  return svgString.replace('<svg', `<svg class="${className}"`);
}
