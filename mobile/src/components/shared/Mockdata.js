// mockData.js — wersja rozszerzona do testów

// ─── Użytkownicy ──────────────────────────────────────────────────────────────

export const MOCK_USERS = [
  { id: 1,  name: 'Admin Główny', email: 'admin@nfc.local', password: '1', isAdmin: true },
  { id: 2,  name: 'Jan Kowalski', email: 'jan@nfc.local',   password: 'user123', isAdmin: false },
  { id: 3,  name: 'Anna Nowak',   email: 'anna@nfc.local',  password: 'user123', isAdmin: false },
  { id: 4,  name: 'Piotr Wiśniak',email: 'piotr@nfc.local', password: 'user123', isAdmin: false },
  { id: 5,  name: 'Kamil Zając',  email: 'kamil@nfc.local', password: 'user123', isAdmin: false },
  { id: 6,  name: 'Ewa Lis',      email: 'ewa@nfc.local',   password: 'user123', isAdmin: false },
  { id: 7,  name: 'Tomasz Kruk',  email: 'tomasz@nfc.local',password: 'user123', isAdmin: false },
  { id: 8,  name: 'Marek Bąk',    email: 'marek@nfc.local', password: 'user123', isAdmin: false },
  { id: 9,  name: 'Julia Wrona',  email: 'julia@nfc.local', password: 'user123', isAdmin: false },
  { id: 10, name: 'Karol Żuraw',  email: 'karol@nfc.local', password: 'user123', isAdmin: false },
  { id: 11, name: 'Ola Sikora',   email: 'ola@nfc.local',   password: 'user123', isAdmin: false },
  { id: 12, name: 'Michał Ryś',   email: 'michal@nfc.local',password: 'user123', isAdmin: false },
  { id: 13, name: 'Paweł Orzeł',  email: 'pawel@nfc.local', password: 'user123', isAdmin: false },
  { id: 14, name: 'Sara Łabędź',  email: 'sara@nfc.local',  password: 'user123', isAdmin: false },
  { id: 15, name: 'Adam Wilk',    email: 'adam@nfc.local',  password: 'user123', isAdmin: false },
];

// ─── Grupy ────────────────────────────────────────────────────────────────────

export const MOCK_GROUPS = [
  { id: 1, name: 'IT',           color: '#0052FF' },
  { id: 2, name: 'HR',           color: '#FF6B35' },
  { id: 3, name: 'Zarząd',       color: '#9B59B6' },
  { id: 4, name: 'Magazyn',      color: '#27AE60' },
  { id: 5, name: 'Ochrona',      color: '#E67E22' },
  { id: 6, name: 'Sprzątanie',   color: '#16A085' },
];

// Przynależność użytkowników do grup
export const MOCK_GROUP_MEMBERS = {
  1: [2, 4, 5, 7],     // IT
  2: [3, 6, 11],       // HR
  3: [1, 2, 10],       // Zarząd
  4: [8, 9, 12],       // Magazyn
  5: [13, 14],         // Ochrona
  6: [15],             // Sprzątanie
};

// ─── Płytki / urządzenia ──────────────────────────────────────────────────────

export const MOCK_DEVICES = [
  { id: 101, macaddress: 'AA:BB:CC:DD:EE:01', name: 'Wejście główne' },
  { id: 102, macaddress: 'AA:BB:CC:DD:EE:02', name: 'Sala konferencyjna A' },
  { id: 103, macaddress: 'AA:BB:CC:DD:EE:03', name: 'Serwerownia' },
  { id: 104, macaddress: 'AA:BB:CC:DD:EE:04', name: 'Parking podziemny' },
  { id: 105, macaddress: 'AA:BB:CC:DD:EE:05', name: 'Magazyn główny' },
  { id: 106, macaddress: 'AA:BB:CC:DD:EE:06', name: 'Wejście boczne' },
  { id: 107, macaddress: 'AA:BB:CC:DD:EE:07', name: 'Kuchnia' },
  { id: 108, macaddress: 'AA:BB:CC:DD:EE:08', name: 'Biuro zarządu' },
];

// ─── Reguły dostępu ───────────────────────────────────────────────────────────

export const INITIAL_ACCESS_RULES = {
  101: { userIds: [2, 3, 4], groupIds: [1] },
  102: { userIds: [3, 6],    groupIds: [2, 3] },
  103: { userIds: [],        groupIds: [1, 3] },
  104: { userIds: [2, 5],    groupIds: [5] },
  105: { userIds: [8, 9],    groupIds: [4] },
  106: { userIds: [],        groupIds: [] },
  107: { userIds: [11, 12],  groupIds: [6] },
  108: { userIds: [1],       groupIds: [3] },
};

// ─── Logi dostępu (dużo, realistyczne) ────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateWithin(daysBack) {
  const now = Date.now();
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offset).toISOString();
}

export const MOCK_LOGS = [];

// Generujemy 300 logów
for (let i = 0; i < 300; i++) {
  MOCK_LOGS.push({
    id: i + 1,
    deviceId: randomItem(MOCK_DEVICES).id,
    userId: randomItem(MOCK_USERS).id,
    timestamp: randomDateWithin(800), // do ~2 lat wstecz
    granted: Math.random() > 0.2, // 80% sukcesów, 20% odmów
  });
}

// Sortujemy od najnowszych
MOCK_LOGS.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// ─── Funkcje API mock ─────────────────────────────────────────────────────────

export function mockLogin(email, password) {
  const user = MOCK_USERS.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function fetchDevices() {
  await delay(500);
  return MOCK_DEVICES;
}

export async function fetchAccessRules() {
  await delay(300);
  return JSON.parse(JSON.stringify(INITIAL_ACCESS_RULES));
}

export async function fetchLogs() {
  await delay(400);
  return [...MOCK_LOGS];
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
