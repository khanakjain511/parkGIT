export type Theme = "light" | "dark";
export const themeStorageKey = "perishables-theme";
export const themeEvent = "perishables-theme-change";
export const systemThemeQuery = "(prefers-color-scheme: dark)";
export const themeScript = `(function(){var t;try{t=localStorage.getItem('${themeStorageKey}')}catch{}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('${systemThemeQuery}').matches?'dark':'light'})()`;
