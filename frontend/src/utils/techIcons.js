export const techIconMap = {
  react: '⚛️',
  javascript: '🟨',
  typescript: '🔷',
  python: '🐍',
  fastapi: '⚡',
  node: '🟩',
  nextjs: '▲',
  vue: '💚',
  angular: '🔺',
  django: '🦄',
  postgresql: '🐘',
  mysql: '🟦',
  mongo: '🟢',
  tailwind: '🧩',
  css: '🎨',
  html: '🧱',
  docker: '🐳',
  figma: '🎨',
  aws: '☁️',
  firebase: '🔥',
  git: '🌿',
};

export function getTechBadge(label) {
  const normalized = String(label || '').trim().toLowerCase();
  return techIconMap[normalized.replace(/[^a-z]/g, '')] || '▣';
}
