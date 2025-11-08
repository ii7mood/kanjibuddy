export function saveSession() {
  localStorage.setItem('reviewSession', JSON.stringify(window.state.review));
  localStorage.setItem('appConfig', JSON.stringify(window.config));
}

export function clearReviews() {
  localStorage.removeItem('reviewSession');
}

export function loadReviews() {
  const s = localStorage.getItem('reviewSession');
  return s ? JSON.parse(s) : null;
}

export async function loadConfig() {
  let c = localStorage.getItem('appConfig');
  c = c ? JSON.parse(c) : {no_cards: 10};

  const res = await fetch('/api/config');
  const serverConfig = await res.json();

  // merging objects, server values override local ones
  const merged = { ...c, ...serverConfig };

  localStorage.setItem('appConfig', JSON.stringify(merged));
  return merged;
}
