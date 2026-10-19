#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { DatabaseSync } = require('node:sqlite');

const PORT = parseInt(process.argv[2], 10) || process.env.PORT || 8080;
const FILE = process.argv[3] || 'upgrader.html';
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const DB_FILE = path.join(__dirname, 'golda.db');
const ADMIN_PW = 'ehe72:$82';
const CHAT_HISTORY = 100;
const TOP_LIMIT = 10;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
};
const ALLOW = new Set(['.html', '.htm', '.css', '.js', '.json', '.png', '.jpg',
  '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf']);

const RAWCAT = `P250 | Sand Dune (FT)|12.40
Glock-18 | Groundwater (FT)|18.75
MP9 | Storm (FT)|24.30
SG 553 | Army Sheen (MW)|31.60
Nova | Predator (FT)|45.80
UMP-45 | Scorched (FT)|52.15
FAMAS | Colony (MW)|67.40
MAC-10 | Silver (FT)|88.90
Tec-9 | Groundwater (FT)|96.25
AUG | Contractor (FT)|124.70
MP7 | Forest DDPAT (MW)|148.30
Galil AR | Cerberus (FT)|176.85
AK-47 | Safari Mesh (FT)|198.40
M4A4 | Urban DDPAT (MW)|224.15
AWP | Safari Mesh (BS)|256.90
Desert Eagle | Urban DDPAT (FT)|278.55
USP-S | Forest Leaves (MW)|294.20
Glock-18 | Water Elemental (MW)|345.90
AK-47 | Elite Build (MW)|412.75
M4A1-S | Basilisk (MW)|468.30
AWP | Worm God (FT)|512.60
Desert Eagle | Conspiracy (MW)|548.15
USP-S | Torque (FT)|589.40
P90 | Asiimov (FT)|624.85
AK-47 | Redline (FT)|678.20
M4A4 | Evil Daimyo (MW)|724.55
AWP | Pit Viper (FT)|789.30
Desert Eagle | Code Red (MW)|834.90
Glock-18 | Fade (MW)|878.45
M4A1-S | Hyper Beast (MW)|924.70
AK-47 | Asiimov (FT)|968.35
AWP | Neo-Noir (MW)|995.60
AWP | Wildfire (FT)|2143.55
AK-47 | Fire Serpent (FT)|2487.20
M4A1-S | Golden Coil (FN)|2845.70
AWP | Hyper Beast (MW)|3240.85
AK-47 | Vulcan (MW)|3876.40
M4A4 | Asiimov (FT)|4512.95
AWP | Lightning Strike (FN)|5248.30
AK-47 | Jaguar (FN)|6174.65
★ Gut Knife | Doppler (FN)|7890.40
★ Flip Knife | Ultraviolet (FN)|9456.25
AWP | Dragon Lore (FT) · фрагмент|12340.80
★ Shadow Daggers | Slaughter (FN)|14785.55
★ Bayonet | Blue Steel (MW)|16920.30
★ Flip Knife | Marble Fade (MW)|18674.90
★ Gut Knife | Crimson Web (MW)|19845.60
M4A4 | Howl (FT) · фрагмент|3128.45
AK-47 | Case Hardened (MW)|4867.30
AWP | Boom (FN)|2674.90
Desert Eagle | Golden Koi (FN)|5432.15
M4A1-S | Master Piece (MW)|6890.75
AK-47 | Jet Set (MW)|3450.60
AWP | Graphite (FN)|7218.40
USP-S | Kill Confirmed (FN)|8674.25
M4A4 | Daybreak (FN)|9340.80
AK-47 | Wasteland Rebel (MW)|10587.35
AWP | Medusa (FT)|11745.90
M4A1-S | Blue Phosphor (MW)|13290.45
AK-47 | The Empress (MW)|15670.20
AWP | Gungnir (FT)|17890.65
★ Karambit | Blue Steel (MW)|19456.10
★ Gut Knife | Tiger Tooth (FN)|20340.55
AWP | Gungnir (MW)|21875.40
★ Flip Knife | Doppler (FN)|23456.80
AK-47 | Gold Arabesque (FT)|24890.25
M4A4 | The Emperor (FN)|26345.70
★ Bayonet | Tiger Tooth (FN)|28120.45
AWP | Medusa (MW)|29674.90
★ Huntsman Knife | Slaughter (FN)|31245.60
AK-47 | Wild Lotus (FT)|32890.35
M4A1-S | Blue Phosphor (FN)|34560.80
★ Bowie Knife | Marble Fade (FN)|36120.45
AWP | The Prince (FT)|37845.90
★ Falchion Knife | Doppler (FN)|39670.25
AK-47 | The Empress (FN)|41230.75
M4A4 | Howl (FT)|43890.40
★ Flip Knife | Marble Fade (FN)|45670.85
AWP | Dragon Lore (WW)|47345.20
★ Gut Knife | Crimson Web (FN)|49120.65
AK-47 | Fire Serpent (FN)|51890.30
M4A1-S | Welcome to the Jungle (FT)|53670.75
★ Bayonet | Doppler (FN)|55430.20
AWP | Gungnir (FN)|57890.55
★ Huntsman Knife | Crimson Web (FN)|59674.90
AK-47 | Case Hardened (FN, Blue Gem)|61345.25
M4A4 | Asiimov (FN)|63120.70
★ Bowie Knife | Doppler (FN)|65890.15
AWP | Medusa (FN)|67670.40
★ Falchion Knife | Marble Fade (FN)|69345.85
AK-47 | Wild Lotus (MW)|71120.30
M4A1-S | Blue Phosphor (FN, ST)|73890.65
★ Shadow Daggers | Doppler (FN)|75670.20
AWP | Dragon Lore (FT)|77345.55
★ Bayonet | Marble Fade (FN)|79120.90
AK-47 | Gold Arabesque (MW)|81890.35
M4A4 | Howl (MW)|83670.70
★ Flip Knife | Tiger Tooth (FN)|85430.15
AWP | The Prince (MW)|87890.50
★ Huntsman Knife | Tiger Tooth (FN)|89674.85
AK-47 | Fire Serpent (MW)|91345.20
M4A1-S | Welcome to the Jungle (MW)|93120.65
★ Bowie Knife | Tiger Tooth (FN)|94890.10
AWP | Gungnir (MW, ST)|95670.45
★ Falchion Knife | Tiger Tooth (FN)|96345.80
AK-47 | Wild Lotus (FN)|97120.25
M4A4 | The Emperor (FN, ST)|97890.60
★ Gut Knife | Doppler (FN, Ruby)|98670.95
AWP | Medusa (FN, ST)|99120.30
★ Bayonet | Tiger Tooth (FN, ST)|99430.75
AK-47 | Case Hardened (FN, Blue Gem ST)|99670.20
★ Karambit | Blue Steel (FN)|99890.55
★ Karambit | Golda Drop (FN)|100000.00
★ Flip Knife | Golden Sand (FN)|106000.00
AWP | Golden Rainfall (MW)|112000.00
★ Gut Knife | Gold Bar (FN)|118000.00
★ Bayonet | Gold Leaf (FN)|124000.00
★ Huntsman Knife | Golden Web (MW)|130000.00
M4A4 | Golda Vault (FN)|136000.00
★ Falchion Knife | Golden Drop (FN)|142000.00
AK-47 | Golden Dragon (FN)|148000.00
★ Bowie Knife | Golden Crown (FN)|155000.00
AWP | Golden Drop (FN)|162000.00
★ Shadow Daggers | Golden Rain (FN)|170000.00
★ Karambit | Golden Rain (FN)|182000.00
★ Karambit | Golda Drop (FN, ST)|198000.00`;

const CAT = RAWCAT.split('\n').map(l => {
  const a = l.split('|');
  return { n: a[0].trim() + ' | ' + a[1].trim(), p: +a[2] };
}).sort((a, b) => a.p - b.p);

const CASES = [
  // Доли — реальные вероятности каждого диапазона; диапазоны не пересекаются.
  { n: 'Новичок', p: 499, e: '📦', t: [[.55, 0, 100], [.30, 100, 400], [.13, 400, 1000], [.02, 1000, 3500]] },
  { n: 'Профи', p: 5000, e: '🎁', t: [[.35, 100, 1000], [.35, 1000, 3500], [.22, 3500, 8000], [.08, 8000, 20000]] },
  { n: 'Эксперт', p: 10000, e: '💎', t: [[.25, 400, 3500], [.35, 3500, 8000], [.25, 8000, 15000], [.12, 15000, 30000], [.03, 30000, 60000]] },
  { n: 'Мифический', p: 30000, e: '🌈', t: [[.25, 3500, 15000], [.35, 15000, 30000], [.25, 30000, 60000], [.12, 60000, 100000], [.03, 100000, 999999]] }
];

const LUCK_PRICES = [1000, 5000, 25000, 100000, 500000];

const ASSETS = [
  { c: '📱', n: 'Redmi 13C', p: 12990 }, { c: '📱', n: 'Samsung Galaxy A55', p: 34990 },
  { c: '📱', n: 'iPhone 15', p: 79990 }, { c: '📱', n: 'iPhone 16 Pro Max', p: 149990 },
  { c: '📱', n: 'Vertu Signature', p: 899990 },
  { c: '🚗', n: 'Lada Granta', p: 790000 }, { c: '🚗', n: 'Kia Rio', p: 1650000 },
  { c: '🚗', n: 'Toyota Camry', p: 3490000 }, { c: '🚗', n: 'BMW M5', p: 11900000 },
  { c: '🚗', n: 'Mercedes G63 AMG', p: 29900000 },
  { c: '🏠', n: 'Дачный домик', p: 1800000 }, { c: '🏠', n: 'Квартира-студия', p: 6500000 },
  { c: '🏠', n: 'Таунхаус', p: 14900000 }, { c: '🏠', n: 'Коттедж', p: 39900000 },
  { c: '🏠', n: 'Вилла у моря', p: 129000000 }
];

const rc = p => p < 50 ? 0 : p < 150 ? 1 : p < 400 ? 2 : p < 1000 ? 3
  : p < 8000 ? 4 : p < 30000 ? 5 : p < 60000 ? 6 : p < 100000 ? 7 : 8;   // 8 = «космос»

const hard = p => Math.max(.5, 1 - Math.log10(Math.max(p, 10) / 10) * .02);
const luckMul = l => 1 + .12 * Math.max(0, Math.min(5, l | 0));
const chancePct = (ownPrice, tgtPrice, boost, luck) => {
  if (!(ownPrice > 0) || !(tgtPrice > 0)) return 0;
  const cap = Math.min(100, Math.max(1, +SETTINGS.chance_cap || 95));
  return Math.min(cap, (ownPrice + (boost || 0)) / tgtPrice * 100 * hard(tgtPrice) * luckMul(luck));
};

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL COLLATE NOCASE,
  pw_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  token TEXT,
  icon TEXT DEFAULT '😎',
  theme TEXT DEFAULT 'dark',
  bal REAL DEFAULT 0,
  card REAL DEFAULT 100,
  debt REAL DEFAULT 0,
  luck INTEGER DEFAULT 0,
  rating REAL DEFAULT 1000,
  dev INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
   last_seen INTEGER NOT NULL,
  name_changed INTEGER DEFAULT 0,
  vip TEXT DEFAULT '',
  vip_until INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  slot INTEGER DEFAULT 0,
  source TEXT,
  acquired INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id, slot);
CREATE TABLE IF NOT EXISTS player_progress (user_id INTEGER PRIMARY KEY, xp INTEGER NOT NULL DEFAULT 0, level INTEGER NOT NULL DEFAULT 1, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS stickers (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, sticker_key TEXT NOT NULL, acquired INTEGER NOT NULL, source TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS item_stickers (item_id INTEGER NOT NULL, sticker_key TEXT NOT NULL, applied INTEGER NOT NULL, PRIMARY KEY(item_id, sticker_key, applied), FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS market_listings (id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER UNIQUE NOT NULL, seller_id INTEGER NOT NULL, price REAL NOT NULL, created INTEGER NOT NULL, FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE, FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS sticker_market (id INTEGER PRIMARY KEY AUTOINCREMENT, sticker_id INTEGER UNIQUE NOT NULL, seller_id INTEGER NOT NULL, price REAL NOT NULL, created INTEGER NOT NULL, FOREIGN KEY(sticker_id) REFERENCES stickers(id) ON DELETE CASCADE, FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  bought INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS top_drops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_top_price ON top_drops(price DESC);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_msg_created ON messages(created DESC);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  amount REAL DEFAULT 0,
  meta TEXT,
  created INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id, created DESC);
CREATE TABLE IF NOT EXISTS user_ach (
  user_id INTEGER NOT NULL,
  ach_id TEXT NOT NULL,
  got INTEGER NOT NULL,
  PRIMARY KEY(user_id, ach_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_quests (
  user_id INTEGER PRIMARY KEY,
  day INTEGER NOT NULL,
  ids TEXT NOT NULL,
  done TEXT NOT NULL,
  base TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS stats (
  user_id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS uniq (
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY(user_id, name),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  user_id INTEGER,
  message TEXT NOT NULL,
  created INTEGER NOT NULL
);
`);

// Миграция старой базы: добавляем VIP-колонки, если их ещё нет.
try { db.exec("ALTER TABLE users ADD COLUMN vip TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN vip_until INTEGER DEFAULT 0"); } catch (e) {}

console.log('[db] SQLite: ' + DB_FILE);

function log(level, message, userId) {
  const t = Date.now();
  try { db.prepare('INSERT INTO logs (level,user_id,message,created) VALUES (?,?,?,?)').run(level, userId || null, String(message).slice(0, 500), t) } catch (e) { }
  process.stdout.write(`[${new Date(t).toISOString().slice(0, 19).replace('T', ' ')}] [${level}] ${message}\n`);
}

const hashPw = (pw, salt) => crypto.createHash('sha256').update(salt + ':' + pw).digest('hex');
const rnd = n => crypto.randomBytes(n).toString('hex');

const Q = {
  getUserByName: db.prepare('SELECT * FROM users WHERE name = ? COLLATE NOCASE'),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  createUser: db.prepare('INSERT INTO users (name,pw_hash,salt,token,created_at,last_seen) VALUES (?,?,?,?,?,?)'),
  setToken: db.prepare('UPDATE users SET token = ?, last_seen = ? WHERE id = ?'),
  setLastSeen: db.prepare('UPDATE users SET last_seen = ? WHERE id = ?'),
  setName: db.prepare('UPDATE users SET name = ?, name_changed = name_changed + 1 WHERE id = ?'),
  setIcon: db.prepare('UPDATE users SET icon = ? WHERE id = ?'),
  setTheme: db.prepare('UPDATE users SET theme = ? WHERE id = ?'),
  setBal: db.prepare('UPDATE users SET bal = ? WHERE id = ?'),
  setCard: db.prepare('UPDATE users SET card = ? WHERE id = ?'),
  setDebt: db.prepare('UPDATE users SET debt = ? WHERE id = ?'),
  setLuck: db.prepare('UPDATE users SET luck = ? WHERE id = ?'),
  setRating: db.prepare('UPDATE users SET rating = ? WHERE id = ?'),
  setDev: db.prepare('UPDATE users SET dev = ? WHERE id = ?'),
  setVip: db.prepare('UPDATE users SET vip = ?, vip_until = ? WHERE id = ?'),
  itemsByUser: db.prepare('SELECT * FROM items WHERE user_id = ? ORDER BY slot, id'),
  addItem: db.prepare('INSERT INTO items (user_id,name,price,slot,source,acquired) VALUES (?,?,?,?,?,?)'),
  getItem: db.prepare('SELECT * FROM items WHERE id = ? AND user_id = ?'),
  delItem: db.prepare('DELETE FROM items WHERE id = ? AND user_id = ?'),
  setItemSlot: db.prepare('UPDATE items SET slot = ? WHERE id = ? AND user_id = ?'),
  cntItems: db.prepare('SELECT COUNT(*) c FROM items WHERE user_id = ? AND slot = 0'),
  assetsByUser: db.prepare('SELECT * FROM assets WHERE user_id = ?'),
  addAsset: db.prepare('INSERT INTO assets (user_id,name,price,bought) VALUES (?,?,?,?)'),
  loansByUser: db.prepare('SELECT * FROM loans WHERE user_id = ?'),
  addLoan: db.prepare('INSERT INTO loans (user_id,amount,created) VALUES (?,?,?)'),
  delLoan: db.prepare('DELETE FROM loans WHERE id = ?'),
  topAdd: db.prepare('INSERT INTO top_drops (user_id,name,price,created) VALUES (?,?,?,?)'),
  topList: db.prepare('SELECT t.price, t.name, t.created, u.name AS uname, u.icon FROM top_drops t JOIN users u ON u.id = t.user_id ORDER BY t.price DESC LIMIT ?'),
  topByUser: db.prepare('SELECT name, price, created FROM top_drops WHERE user_id = ? ORDER BY price DESC LIMIT 20'),
  msgAdd: db.prepare('INSERT INTO messages (user_id,name,icon,text,created) VALUES (?,?,?,?,?)'),
  msgLast: db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ?'),
  txAdd: db.prepare('INSERT INTO transactions (user_id,kind,amount,meta,created) VALUES (?,?,?,?,?)'),
  txList: db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT ?'),
  achByUser: db.prepare('SELECT ach_id FROM user_ach WHERE user_id = ?'),
  achAdd: db.prepare('INSERT OR IGNORE INTO user_ach (user_id,ach_id,got) VALUES (?,?,?)'),
  questGet: db.prepare('SELECT * FROM user_quests WHERE user_id = ?'),
  questSet: db.prepare('INSERT INTO user_quests (user_id,day,ids,done,base) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET day=excluded.day, ids=excluded.ids, done=excluded.done, base=excluded.base'),
  statsGet: db.prepare('SELECT data FROM stats WHERE user_id = ?'),
  statsSet: db.prepare('INSERT INTO stats (user_id,data) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data'),
  uniqByUser: db.prepare('SELECT name FROM uniq WHERE user_id = ?'),
  uniqAdd: db.prepare('INSERT OR IGNORE INTO uniq (user_id,name) VALUES (?,?)'),
  allUsers: db.prepare('SELECT id, name, icon FROM users')
};

const DEF_STATS = () => ({
  spins: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, boostSpent: 0,
  winX5: 0, winX50: 0, winX500: 0, lowWin: 0, lowWin25: 0, bigWins: 0, bestWinP: 0, bestWinN: '',
  cases: 0, caseSpent: 0, caseValue: 0, caseBestP: 0, caseBestN: '',
  bought: 0, boughtSum: 0, sold: 0, sellSum: 0, withdrawSum: 0, topup: 0,
  battles: 0, battleWins: 0, loans: 0, repaidLoans: 0, repaidSum: 0,
  luckSpent: 0, luckLevels: 0, assetsBought: 0, assetsSpent: 0, gifts: 0,
  knives: 0, gold: 0, rainbow: 0, glowing: 0, cosmic: 0, cosmicUpg: 0, maxBal: 0, achRewards: 0, questRewards: 0,
  bbWins: 0, bbLosses: 0, rlWins: 0, dmSent: 0
});

function getStats(uid) {
  const r = Q.statsGet.get(uid);
  if (!r) return DEF_STATS();
  try { return Object.assign(DEF_STATS(), JSON.parse(r.data)) } catch (e) { return DEF_STATS() }
}
function setStats(uid, s) { Q.statsSet.run(uid, JSON.stringify(s)) }

function kindIcon(k) {
  return { topup: '💳', withdraw: '🏧', buy: '🛒', loan: '🏦', repay: '✅', luck: '🍀',
    asset: '🏠', gift: '🎁', quest: '📋', ach: '🏆', spin: '⬆', case: '📦', battle: '⚔', bb: '🎲' }[k] || '•';
}

function getState(u) {
  db.prepare('INSERT OR IGNORE INTO player_progress(user_id,xp,level) VALUES (?,0,1)').run(u.id);
  const progress = db.prepare('SELECT xp,level FROM player_progress WHERE user_id=?').get(u.id);
  const stickers = db.prepare('SELECT id,sticker_key,source,acquired FROM stickers WHERE user_id=? ORDER BY id DESC').all(u.id);
  const itemStickerRows = db.prepare('SELECT s.item_id,s.sticker_key FROM item_stickers s JOIN items i ON i.id=s.item_id WHERE i.user_id=?').all(u.id);
  const stickersByItem = {}; itemStickerRows.forEach(x => { (stickersByItem[x.item_id] ||= []).push(x.sticker_key); });
  const items = Q.itemsByUser.all(u.id);
  const inv = items.filter(x => x.slot === 0).map(x => ({ id: x.id, n: x.name, p: x.price, stickers: stickersByItem[x.id] || [] }));
  const vit = items.filter(x => x.slot === 1).map(x => ({ id: x.id, n: x.name, p: x.price }));
  const assets = Q.assetsByUser.all(u.id).map(x => x.name);
  const loans = Q.loansByUser.all(u.id).map(x => x.amount);
  const ach = Q.achByUser.all(u.id).map(x => x.ach_id);
  const uniqArr = Q.uniqByUser.all(u.id).map(x => x.name);
  const uniqMap = {}; uniqArr.forEach(n => uniqMap[n] = 1);
  const qr = Q.questGet.get(u.id);
  const quests = qr ? { day: qr.day, ids: JSON.parse(qr.ids), done: JSON.parse(qr.done), base: JSON.parse(qr.base) } : { day: 0, ids: [], done: [], base: {} };
  const tx = Q.txList.all(u.id, 10).map(x => ({ i: kindIcon(x.kind), d: x.meta || '', t: new Date(x.created).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }));
  const vipActive = u.vip && (u.vip_until === 0 || u.vip_until > Date.now());
  const prof = profileOf(u);
  return {
    id: u.id, name: u.name, icon: u.icon, theme: u.theme,
    bal: u.bal, card: u.card, debt: 0, luck: u.luck, rating: u.rating, dev: !!u.dev,
    nameChanged: u.name_changed,
    vip: vipActive ? u.vip : '',
    vipUntil: u.vip_until || 0,
    inv, vit, assets, loans: [], ach, uniq: uniqMap, quests, stickers, progress,
    cos: { frame: prof.frame || '', bg: prof.bg || '', title: prof.title || '', owned: cosmeticsOwned(u.id) },
    friends: friendRows(u.id), friendReq: friendReqRows(u.id), dmWith: 0, dm: [],
    settings: settingsPublic(),
    stats: getStats(u.id), hist: tx
  };
}
function addTx(uid, kind, amount, meta) {
  Q.txAdd.run(uid, kind, +amount || 0, meta || '', Date.now());
}
function pushTop(uid, name, price) {
  if (!(price >= 1000)) return;
  Q.topAdd.run(uid, name, +price, Date.now());
  db.prepare('DELETE FROM top_drops WHERE id NOT IN (SELECT id FROM top_drops ORDER BY price DESC LIMIT 500)').run();
}
function noteUniq(uid, name, price) {
  Q.uniqAdd.run(uid, name);
  const s = getStats(uid);
  if (name[0] === '★') s.knives++;
  if (rc(price) === 5) s.gold++;
  if (rc(price) === 6) s.rainbow++;
  if (rc(price) === 7) s.glowing++;
  if (rc(price) === 8) s.cosmic++;
  setStats(uid, s);
}
function countInv(uid) { return Q.cntItems.get(uid).c }

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  const rel = decodeURIComponent(url === '/' ? '/' + FILE : url);
  const full = path.join(__dirname, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  const base = path.basename(full);
  if (!full.startsWith(__dirname) || base.startsWith('.') || base === path.basename(__filename) || !ALLOW.has(path.extname(full).toLowerCase())) {
    res.writeHead(404); return res.end('404');
  }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404') }
    res.writeHead(200, { 'content-type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
});

const clients = new Map();
const sockets = new Map();
const uiEventLast = new Map();

function encode(str) {
  const p = Buffer.from(str, 'utf8'), len = p.length;
  let h;
  if (len < 126) h = Buffer.from([0x81, len]);
  else if (len < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(len, 2) }
  else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(len), 2) }
  return Buffer.concat([h, p]);
}
const sw = (sock, o) => { try { sock.write(encode(JSON.stringify(o))); return true } catch (e) { return false } };
const send = (uid, o) => { const c = clients.get(uid); if (c) sw(c.sock, o) };
const bcast = o => clients.forEach(c => sw(c.sock, o));
const peerList = () => [...clients.values()].map(c => ({
  id: c.user.id,
  name: c.user.name,
  icon: c.user.icon,
  vip: c.user.vip && (c.user.vip_until === 0 || c.user.vip_until > Date.now()) ? c.user.vip : ''
}));
const bcastPeers = () => bcast({ t: 'peers', list: peerList() });

server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'];
  if (!key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') return sock.destroy();
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  sock.setNoDelay(true);

  let buf = Buffer.alloc(0), alive = true, uid = null;
  const ping = setInterval(() => {
    if (!alive) { try { sock.destroy() } catch (e) { } clearInterval(ping); return }
    alive = false;
    try { sock.write(Buffer.from([0x89, 0x00])) } catch (e) { }
  }, 25000);

  const drop = () => {
    clearInterval(ping);
    if (uid && clients.get(uid) && clients.get(uid).sock === sock) {
      const c = clients.get(uid);
      clients.delete(uid);
      sockets.delete(sock);
      log('info', `[−] ${c.user.name} отключился (онлайн: ${clients.size})`, uid);
      bcastPeers();
      cleanupUserBattles(uid);
    }
  };
  sock.on('close', drop);
  sock.on('error', drop);

  sock.on('data', chunk => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      if (buf.length < 2) return;
      const op = buf[0] & 0x0f, masked = (buf[1] & 0x80) === 0x80, l0 = buf[1] & 0x7f;
      let off = 2, len = l0;
      if (l0 === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4 }
      else if (l0 === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10 }
      if (len > 1 << 20) { try { sock.destroy() } catch (e) { } return }
      const need = off + (masked ? 4 : 0) + len;
      if (buf.length < need) return;
      let mask = null;
      if (masked) { mask = buf.slice(off, off + 4); off += 4 }
      const payload = buf.slice(off, off + len);
      buf = buf.slice(need);
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];

      if (op === 0x8) { try { sock.end() } catch (e) { } drop(); return }
      if (op === 0x9) { try { sock.write(Buffer.from([0x8a, 0x00])) } catch (e) { } continue }
      if (op === 0xa) { alive = true; continue }
      if (op !== 0x1) continue;

      let m; try { m = JSON.parse(payload.toString('utf8')) } catch (e) { continue }

      if (m.t === 'register') { const r = doRegister(m.name, m.pw, sock); if (r.ok) { uid = r.uid; sockets.set(sock, uid) } continue }
      if (m.t === 'login') { const r = doLogin(m.name, m.pw, sock); if (r.ok) { uid = r.uid; sockets.set(sock, uid) } continue }
      if (m.t === 'auto') { const r = doAuto(m.token, sock); if (r.ok) { uid = r.uid; sockets.set(sock, uid) } continue }

      if (!uid || !clients.has(uid)) { sw(sock, { t: 'err', m: 'Не авторизован' }); continue }
      const me = clients.get(uid);

      if (m.t === 'top_get') { sw(sock, { t: 'top', list: Q.topList.all(TOP_LIMIT) }); continue }
      if (m.t === 'set_icon') {
        const icon = String(m.icon || '😎').slice(0, 4);
        Q.setIcon.run(icon, uid); me.user.icon = icon;
        sync(uid); bcastPeers(); continue;
      }
      if (m.t === 'set_name') {
        const name = String(m.name || '').trim().slice(0, 14);
        if (name.length < 3 || !/^[\wа-яА-ЯёЁ ]+$/u.test(name)) { sw(sock, { t: 'err', m: 'Имя: 3–14 символов' }); continue }
        const ex = Q.getUserByName.get(name);
        if (ex && ex.id !== uid) { sw(sock, { t: 'err', m: 'Имя занято' }); continue }
        Q.setName.run(name, uid); me.user.name = name;
        sync(uid); bcastPeers(); continue;
      }
      if (m.t === 'set_theme') {
        const th = ['dark', 'neon', 'gold', 'ice', 'blood'].includes(m.theme) ? m.theme : 'dark';
        Q.setTheme.run(th, uid); me.user.theme = th; sync(uid); continue;
      }
      if (m.t === 'ui_event') {
        // Клиентские события интерфейса: только диагностическая телеметрия,
        // никаких значений полей/паролей не принимаем и не записываем.
        const kind = ['click','open','close','change','navigate'].includes(String(m.kind)) ? String(m.kind) : 'interaction';
        const target = String(m.target || '').replace(/[^\p{L}\p{N}_:#.\- ]/gu, '').slice(0, 80);
        const page = String(m.page || '').replace(/[^\p{L}\p{N}_:#.\- ]/gu, '').slice(0, 50);
        const now = Date.now();
        const prev = uiEventLast.get(uid) || 0;
        if (now - prev >= 120) {
          uiEventLast.set(uid, now);
          log('event', `[UI] ${me.user.name}: ${kind} ${page ? '· '+page+' ' : ''}${target || '(без цели)'}`, uid);
        }
        continue;
      }
      if (m.t === 'action') { handleAction(uid, m); continue }
      if (m.t === 'battle_create') { handleBattleCreate(uid, m); continue }
      if (m.t === 'battle_join') { handleBattleJoin(uid, m); continue }
      if (m.t === 'battle_leave') { handleBattleLeave(uid, m); continue }
      if (m.t === 'bb_create') { handleBBCreate(uid, m); continue }
      if (m.t === 'bb_join') { handleBBJoin(uid, m); continue }
      if (m.t === 'bb_pick') { handleBBPick(uid, m); continue }
      if (m.t === 'bb_cancel') { handleBBCancel(uid); continue }
      /* клиент запрашивает списки при открытии экрана — отдаём актуальный снимок,
         иначе список пуст, пока кто-нибудь не создаст/не отменит лобби */
      if (m.t === 'battle_list') { send(uid, { t: 'battle_list', list: lobbyList() }); continue }
      if (m.t === 'bb_list') { send(uid, { t: 'bb_list', list: bbList() }); continue }
      /* друзья и личные сообщения */
      if (m.t === 'friend_add') { friendAdd(uid, m.name); continue }
      if (m.t === 'friend_accept') { friendAccept(uid, m.id); continue }
      if (m.t === 'friend_del') { friendDel(uid, m.id); continue }
      if (m.t === 'dm_open') { dmOpen(uid, m.id); continue }
      if (m.t === 'dm_send') { dmSend(uid, m.id, m.text); continue }
      /* кейс-рулетка */
      if (m.t === 'rl_list') { send(uid, { t: 'rl_list', list: rlList() }); continue }
      if (m.t === 'rl_create') { rlCreate(uid, m.stake); continue }
      if (m.t === 'rl_join') { rlJoin(uid, m.bid); continue }
      if (m.t === 'rl_leave') { rlLeave(uid); continue }
      if (m.t === 'rl_start') { rlStart(uid, m.bid); continue }
    }
  });
});

function doRegister(name, pw, sock) {
  name = String(name || '').trim().slice(0, 14);
  pw = String(pw || '');
  if (name.length < 3) { sw(sock, { t: 'err', m: 'Имя минимум 3 символа' }); return { ok: false } }
  if (!/^[\wа-яА-ЯёЁ ]+$/u.test(name)) { sw(sock, { t: 'err', m: 'Имя: буквы/цифры/пробел' }); return { ok: false } }
  if (pw.length < 4) { sw(sock, { t: 'err', m: 'Пароль минимум 4 символа' }); return { ok: false } }
  const ex = Q.getUserByName.get(name);
  if (ex) { sw(sock, { t: 'err', m: 'Имя занято' }); return { ok: false } }
  const salt = rnd(8), hash = hashPw(pw, salt), token = rnd(16), now = Date.now();
  const r = Q.createUser.run(name, hash, salt, token, now, now);
  const uid = r.lastInsertRowid;
  log('info', `[+] РЕГИСТРАЦИЯ: ${name} (id ${uid})`, uid);
  attach(uid, token, sock);
  return { ok: true, uid };
}
function doLogin(name, pw, sock) {
  name = String(name || '').trim();
  pw = String(pw || '');
  const u = Q.getUserByName.get(name);
  if (!u) { sw(sock, { t: 'err', m: 'Нет такого игрока' }); return { ok: false } }
  if (u.pw_hash !== hashPw(pw, u.salt)) {
    log('warn', `[!] НЕУДАЧНЫЙ ВХОД: ${name}`, u.id);
    sw(sock, { t: 'err', m: 'Неверный пароль' });
    return { ok: false };
  }
  const token = rnd(16);
  Q.setToken.run(token, Date.now(), u.id);
  log('info', `[~] ВХОД: ${name}`, u.id);
  attach(u.id, token, sock);
  return { ok: true, uid: u.id };
}
function doAuto(token, sock) {
  if (!token) { sw(sock, { t: 'err', m: 'Нет токена' }); return { ok: false } }
  const u = db.prepare('SELECT * FROM users WHERE token = ?').get(token);
  if (!u) { sw(sock, { t: 'err', m: 'Сессия истекла' }); return { ok: false } }
  Q.setLastSeen.run(Date.now(), u.id);
  log('info', `[~] АВТОВХОД: ${u.name}`, u.id);
  attach(u.id, token, sock);
  return { ok: true, uid: u.id };
}
function attach(uid, token, sock) {
  const old = clients.get(uid);
  if (old) { try { old.sock.close() } catch (e) { } }
  const u = Q.getUserById.get(uid);
  clients.set(uid, { sock, user: u });
  sockets.set(sock, uid);
  sw(sock, { t: 'auth_ok', uid, token, state: getState(u) });
  sw(sock, { t: 'top', list: Q.topList.all(TOP_LIMIT) });
  bcastPeers();
  const fst = friendRows(uid);
  if (fst.some(f => f.unread)) sw(sock, { t: 'err', m: `У вас ${fst.reduce((a, f) => a + f.unread, 0)} новых сообщений` });
  log('info', `${u.name} в сети (онлайн: ${clients.size})`, uid);
}
function sync(uid) {
  const c = clients.get(uid);
  if (!c) return;
  c.user = Q.getUserById.get(uid);
  sw(c.sock, { t: 'sync', state: getState(c.user) });
}

/* ============================ ДОСТИЖЕНИЯ ================================ */
const ACH_DEF = [
  { id:'s1', n:'Первый скин', r:50, f:(u,s,q)=>Object.keys(q).length>=1 },
  { id:'s2', n:'Шопоголик', r:200, f:(u,s)=>s.bought>=5 },
  { id:'s3', n:'Коллекционер', r:2500, f:(u,s,q)=>Object.keys(q).length>=25 },
  { id:'s4', n:'Музей', r:15000, f:(u,s,q)=>Object.keys(q).length>=60 },
  { id:'u1', n:'Первый апгрейд', r:100, f:(u,s)=>s.wins>=1 },
  { id:'u2', n:'В ударе', r:1000, f:(u,s)=>s.wins>=10 },
  { id:'u3', n:'Ракета', r:25000, f:(u,s)=>s.wins>=100 },
  { id:'u4', n:'Пять иксов', r:500, f:(u,s)=>s.winX5>=1 },
  { id:'u5', n:'50 иксов', r:7500, f:(u,s)=>s.winX50>=1 },
  { id:'u6', n:'Легендарный занос', r:60000, f:(u,s)=>s.winX500>=1 },
  { id:'u7', n:'Снайпер', r:8000, f:(u,s)=>s.lowWin>=1 },
  { id:'u8', n:'Чистилище', r:3000, f:(u,s)=>s.losses>=50 },
  { id:'u9', n:'Холодная голова', r:4000, f:(u,s)=>s.bestStreak>=5 },
  { id:'c1', n:'Открывашка', r:100, f:(u,s)=>s.cases>=1 },
  { id:'c2', n:'Кейс-маньяк', r:4000, f:(u,s)=>s.cases>=50 },
  { id:'c3', n:'Куш', r:5000, f:(u,s)=>s.caseBestP>=20000 },
  { id:'c4', n:'Джекпот', r:15000, f:(u,s)=>s.caseBestP>=50000 },
  { id:'m1', n:'Ножевой', r:2000, f:(u,s)=>s.knives>=1 },
  { id:'m2', n:'Золото', r:3000, f:(u,s)=>s.gold>=1 },
  { id:'r6', n:'Радужный', r:10000, f:(u,s)=>s.rainbow>=1 },
  { id:'r7', n:'Сияние', r:30000, f:(u,s)=>s.glowing>=1 },
  { id:'cos1', n:'Космос', r:250000, f:(u,s)=>s.cosmic>=1 },
  { id:'cos2', n:'МЕГА-ЗАНОС: космос', r:500000, f:(u,s)=>s.cosmicUpg>=1 },
  { id:'rl1', n:'Рулетчик', r:2000, f:(u,s)=>s.rlWins>=1 },
  { id:'fr1', n:'Социальный', r:500, f:(u,s,q,as,uu,extra)=>extra.friends>=1 },
  { id:'b1', n:'Рубли', r:1500, f:(u,s)=>s.withdrawSum>=10000 },
  { id:'b2', n:'Финансист', r:300, f:(u,s)=>s.repaidLoans>=1 },
  { id:'b3', n:'Миллионер', r:20000, f:(u,s)=>s.maxBal>=1000000 },
  { id:'p1', n:'Первый гаджет', r:500, f:(u,s,q,a)=>a.some(x=>/Redmi|Galaxy|iPhone|Vertu/.test(x)) },
  { id:'p2', n:'Автовладелец', r:3000, f:(u,s,q,a)=>a.some(x=>/Lada|Kia|Toyota|BMW|Mercedes/.test(x)) },
  { id:'p3', n:'Недвижимость', r:25000, f:(u,s,q,a)=>a.some(x=>/Дачный|Квартира|Таунхаус|Коттедж|Вилла/.test(x)) },
  { id:'w1', n:'Гладиатор', r:1500, f:(u,s)=>s.battleWins>=1 },
  { id:'w2', n:'Непобедимый', r:6000, f:(u,s)=>s.battleWins>=5 },
  { id:'bb1', n:'Угадайка', r:2000, f:(u,s)=>s.bbWins>=1 },
  { id:'bb2', n:'Мастер угадайки', r:10000, f:(u,s)=>s.bbWins>=5 },
  { id:'l1', n:'Максимум удачи', r:30000, f:(u,s,q,a,uu)=>uu.luck>=5 }
];
function checkAch(uid) {
  const u = Q.getUserById.get(uid);
  const s = getStats(uid);
  const uniqArr = Q.uniqByUser.all(uid).map(x=>x.name);
  const uniqMap = {}; uniqArr.forEach(n=>uniqMap[n]=1);
  const assets = Q.assetsByUser.all(uid).map(x=>x.name);
  const have = new Set(Q.achByUser.all(uid).map(x=>x.ach_id));
  const extra = { friends: friendRows(uid).length };
  const newAch = []; let reward = 0;
  for (const a of ACH_DEF) {
    if (have.has(a.id)) continue;
    let ok = false; try { ok = !!a.f(u,s,uniqMap,assets,u,extra) } catch(e){}
    if (!ok) continue;
    Q.achAdd.run(uid, a.id, Date.now());
    have.add(a.id); newAch.push(a.id); reward += a.r;
    s.achRewards += a.r;
    addTx(uid, 'ach', a.r, a.n);
  }
  if (newAch.length) {
    const nb = +(Q.getUserById.get(uid).bal + reward).toFixed(2);
    Q.setBal.run(nb, uid);
    send(uid, { t:'ach_unlocked', list:newAch, reward });
  }
  setStats(uid, s);
  return newAch;
}

/* ============================== КВЕСТЫ ================================== */
const QUEST_POOL = [
  { id:'q_spin10', n:'Крутить 10 раз', k:'spins', g:10, r:400 },
  { id:'q_win3', n:'Выиграть 3 апгрейда', k:'wins', g:3, r:600 },
  { id:'q_win10', n:'Выиграть 10', k:'wins', g:10, r:2500 },
  { id:'q_burn5', n:'Сжечь 5 скинов', k:'losses', g:5, r:300 },
  { id:'q_case3', n:'Открыть 3 кейса', k:'cases', g:3, r:800 },
  { id:'q_buy5', n:'Купить 5 скинов', k:'bought', g:5, r:500 },
  { id:'q_sell3', n:'Вывести 3 скина', k:'sold', g:3, r:700 },
  { id:'q_x5', n:'Апгрейд ×5', k:'winX5', g:1, r:1500 },
  { id:'q_low', n:'Победа ≤25%', k:'lowWin25', g:1, r:2000 },
  { id:'q_big', n:'Скин >5000', k:'bigWins', g:1, r:2500 },
  { id:'q_luck', n:'Прокачать удачу', k:'luckLevels', g:1, r:900 },
  { id:'q_asset', n:'Купить имущество', k:'assetsBought', g:1, r:900 },
  { id:'q_topup', n:'Пополнить на 500', k:'topup', g:500, r:600 },
  { id:'q_battle', n:'Кейс-баттл', k:'battles', g:1, r:700 },
  { id:'q_bb', n:'Скин-баттл', k:'bbWins', g:1, r:800 },
  { id:'q_rainbow', n:'Радужный скин', k:'rainbow', g:1, r:5000 }
];
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset()*60000) / 86400000);
function mulberry32(a) { return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296 } }

function syncQuests(uid) {
  const day = dayNum();
  const r = Q.questGet.get(uid);
  if (r && r.day === day) return false;
  const rng = mulberry32(day*7919 + uid);
  const pool = QUEST_POOL.slice(), ids = [];
  while (ids.length < 3 && pool.length) ids.push(pool.splice(Math.floor(rng()*pool.length),1)[0].id);
  const s = getStats(uid), base = {};
  ids.forEach(id => { const q = QUEST_POOL.find(x=>x.id===id); base[q.k] = +s[q.k] || 0 });
  Q.questSet.run(uid, day, JSON.stringify(ids), JSON.stringify([]), JSON.stringify(base));
  return true;
}
function questProgress(uid, id) {
  const q = QUEST_POOL.find(x=>x.id===id);
  if (!q) return { q:null, cur:0, done:true };
  const r = Q.questGet.get(uid);
  if (!r) return { q, cur:0, done:false };
  const done = JSON.parse(r.done), base = JSON.parse(r.base);
  const s = getStats(uid);
  const cur = Math.max(0, Math.min(q.g, (+s[q.k]||0) - (+base[q.k]||0)));
  return { q, cur, done: done.includes(id) || cur >= q.g };
}
function claimQuest(uid, qid) {
  const r = Q.questGet.get(uid);
  if (!r) return { ok:false };
  const done = JSON.parse(r.done);
  if (done.includes(qid)) return { ok:false, m:'Уже получен' };
  const p = questProgress(uid, qid);
  if (!p.done) return { ok:false, m:'Не выполнен' };
  done.push(qid);
  Q.questSet.run(uid, r.day, r.ids, JSON.stringify(done), r.base);
  const u = Q.getUserById.get(uid);
  Q.setBal.run(+(u.bal + p.q.r).toFixed(2), uid);
  addTx(uid, 'quest', p.q.r, p.q.n);
  awardXp(uid, 20, 'задание');
  if (Math.random() < 0.35) grantSticker(uid, null, 'quest');
  const s = getStats(uid); s.questRewards += p.q.r; setStats(uid, s);
  return { ok:true, r:p.q.r };
}

function finishAction(uid) {
  syncQuests(uid);
  checkAch(uid);
  sync(uid);
}

/* ============================== ДЕЙСТВИЯ ================================ */
const topupChallenges = new Map();

/* ============ ГЛОБАЛЬНЫЕ НАСТРОЙКИ, ДРУЗЬЯ, РУЛЕТКА, КОСМЕТИКА ============ */
db.exec(`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS friends (a INTEGER NOT NULL, b INTEGER NOT NULL, status INTEGER DEFAULT 0, since INTEGER, PRIMARY KEY(a,b));
CREATE TABLE IF NOT EXISTS dm (id INTEGER PRIMARY KEY AUTOINCREMENT, from_id INTEGER NOT NULL, to_id INTEGER NOT NULL, text TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS dm_read (user_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, last INTEGER DEFAULT 0, PRIMARY KEY(user_id,peer_id));
CREATE TABLE IF NOT EXISTS cosmetics (user_id INTEGER NOT NULL, kind TEXT NOT NULL, key TEXT NOT NULL, since INTEGER, PRIMARY KEY(user_id,kind,key));
CREATE INDEX IF NOT EXISTS idx_dm_pair ON dm(to_id, from_id, id);
`);
try { db.exec("ALTER TABLE users ADD COLUMN profile TEXT DEFAULT ''"); } catch (e) { }

const SETTINGS_DEF = {
  rate: 1, commission: 10, price_mult: 1, case_mult: 1, chance_cap: 95,
  luck_prices: [1000, 5000, 25000, 100000, 500000],
  vip_price: 50000, vip_days: 30
};
const SETTINGS = Object.assign({}, SETTINGS_DEF);
(function loadSettings() {
  try {
    for (const r of db.prepare('SELECT key,value FROM settings').all()) {
      if (!(r.key in SETTINGS_DEF)) continue;
      try {
        const v = JSON.parse(r.value);
        if (Array.isArray(SETTINGS_DEF[r.key])) SETTINGS[r.key] = Array.isArray(v) && v.length === SETTINGS_DEF[r.key].length ? v.map(Number) : SETTINGS_DEF[r.key];
        else if (typeof SETTINGS_DEF[r.key] === 'number') SETTINGS[r.key] = isFinite(+v) ? +v : SETTINGS_DEF[r.key];
      } catch (e) { }
    }
  } catch (e) { }
})();
function saveSetting(k, v) {
  if (!(k in SETTINGS_DEF)) return;
  if (Array.isArray(SETTINGS_DEF[k])) v = (Array.isArray(v) ? v : SETTINGS_DEF[k]).map(x => Math.max(0, Math.round(+x || 0)));
  else if (typeof SETTINGS_DEF[k] === 'number') { v = +v; if (!isFinite(v)) return; v = Math.max(0, v) }
  else return;
  if (k === 'price_mult' || k === 'case_mult' || k === 'rate') v = Math.min(100, v);
  if (k === 'commission') v = Math.min(90, v);
  if (k === 'chance_cap') v = Math.min(100, Math.max(1, v));
  if (k === 'vip_days') v = Math.min(3650, Math.max(1, Math.round(v)));
  SETTINGS[k] = v;
  try { db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(k, JSON.stringify(v)); } catch (e) { }
}
const settingsPublic = () => ({
  rate: SETTINGS.rate, commission: SETTINGS.commission, price_mult: SETTINGS.price_mult,
  case_mult: SETTINGS.case_mult, chance_cap: SETTINGS.chance_cap, luck_prices: SETTINGS.luck_prices,
  vip_price: SETTINGS.vip_price, vip_days: SETTINGS.vip_days
});
const bcastSettings = () => bcast({ t: 'settings', s: settingsPublic() });
const priceOf = p => Math.round(+p * (+SETTINGS.price_mult || 1) * 100) / 100;
const casePriceOf = p => Math.round(+p * (+SETTINGS.case_mult || 1) * (+SETTINGS.price_mult || 1) * 100) / 100;
const cutOf = sum => Math.round(sum * (1 - Math.max(0, Math.min(90, +SETTINGS.commission || 0)) / 100) * 100) / 100;
const luckPriceOf = L => +SETTINGS.luck_prices[Math.max(0, Math.min(4, L | 0))] || 0;
const vipLabel = u => (u && u.vip && (u.vip_until === 0 || u.vip_until > Date.now())) ? u.vip : '';

/* ------------------------------- ДРУЗЬЯ --------------------------------- */
function friendRows(uid) {
  const rows = db.prepare('SELECT a,b,status FROM friends WHERE (a=? OR b=?) AND status=1').all(uid, uid);
  return rows.map(r => {
    const peer = r.a === uid ? r.b : r.a;
    const p = Q.getUserById.get(peer);
    if (!p) return null;
    const unread = db.prepare('SELECT COUNT(*) c FROM dm WHERE from_id=? AND to_id=? AND created > COALESCE((SELECT last FROM dm_read WHERE user_id=? AND peer_id=?),0)').get(p.id, uid, uid, p.id).c;
    return {
      id: p.id, name: p.name, icon: p.icon, vip: vipLabel(p), online: clients.has(p.id), unread,
      seen: p.last_seen ? new Date(p.last_seen).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'
    };
  }).filter(Boolean);
}
function friendReqRows(uid) {
  return db.prepare('SELECT a FROM friends WHERE b=? AND status=0').all(uid).map(r => {
    const p = Q.getUserById.get(r.a);
    return p ? { id: p.id, name: p.name, icon: p.icon } : null;
  }).filter(Boolean);
}
function dmHistory(uid, peer, limit) {
  const rows = db.prepare('SELECT * FROM dm WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?) ORDER BY id DESC LIMIT ?').all(uid, peer, peer, uid, limit || 60);
  return rows.reverse().map(m => {
    const p = Q.getUserById.get(m.from_id) || {};
    return {
      mine: m.from_id === uid, text: m.text, name: p.name || '?', icon: p.icon || '😎',
      t: new Date(m.created).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    };
  });
}
function friendAdd(uid, name) {
  const p = Q.getUserByName.get(String(name || '').trim());
  if (!p) return send(uid, { t: 'friend_ok', m: 'Игрок не найден' });
  if (p.id === uid) return send(uid, { t: 'friend_ok', m: 'Это вы' });
  const ex = db.prepare('SELECT * FROM friends WHERE (a=? AND b=?) OR (a=? AND b=?)').get(uid, p.id, p.id, uid);
  if (ex) return send(uid, { t: 'friend_ok', m: ex.status ? 'Уже в друзьях' : 'Заявка уже есть' });
  db.prepare('INSERT INTO friends(a,b,status,since) VALUES(?,?,0,?)').run(uid, p.id, Date.now());
  sync(uid); sync(p.id);
  send(uid, { t: 'friend_ok', m: 'Заявка отправлена' });
}
function friendAccept(uid, id) {
  id = +id || 0;
  const r = db.prepare('SELECT * FROM friends WHERE a=? AND b=? AND status=0').get(id, uid);
  if (!r) return send(uid, { t: 'friend_ok', m: 'Заявки нет' });
  db.prepare('UPDATE friends SET status=1, since=? WHERE a=? AND b=?').run(Date.now(), id, uid);
  sync(uid); sync(id);
  send(uid, { t: 'friend_ok', m: 'Друг добавлен' });
}
function friendDel(uid, id) {
  id = +id || 0;
  db.prepare('DELETE FROM friends WHERE (a=? AND b=?) OR (a=? AND b=?)').run(uid, id, id, uid);
  sync(uid); sync(id);
}
function dmOpen(uid, id) {
  id = +id || 0;
  db.prepare('INSERT INTO dm_read(user_id,peer_id,last) VALUES(?,?,?) ON CONFLICT(user_id,peer_id) DO UPDATE SET last=excluded.last').run(uid, id, Date.now());
  const st = getState(Q.getUserById.get(uid));
  st.dmWith = id; st.dm = dmHistory(uid, id, 60);
  send(uid, { t: 'sync', state: st });
}
function dmSend(uid, id, text) {
  id = +id || 0; text = String(text || '').trim().slice(0, 300);
  if (!text) return;
  const fr = db.prepare('SELECT 1 f FROM friends WHERE status=1 AND ((a=? AND b=?) OR (a=? AND b=?))').get(uid, id, id, uid);
  if (!fr) return send(uid, { t: 'dm_bad', m: 'Вы не друзья' });
  const now = Date.now();
  db.prepare('INSERT INTO dm(from_id,to_id,text,created) VALUES(?,?,?,?)').run(uid, id, text, now);
  db.prepare('INSERT INTO dm_read(user_id,peer_id,last) VALUES(?,?,?) ON CONFLICT(user_id,peer_id) DO UPDATE SET last=excluded.last').run(uid, id, now);
  sync(uid);
  if (clients.has(id)) {
    const st = getState(Q.getUserById.get(id));
    st.dmWith = uid; st.dm = dmHistory(id, uid, 60);
    send(id, { t: 'sync', state: st });
  }
}

/* ---------------------------- КЕЙС-РУЛЕТКА ------------------------------ */
const RL = new Map();
const RL_SIZE = 10;
const rlList = () => [...RL.values()].map(l => ({ bid: l.bid, stake: l.stake, size: l.size, n: l.players.length, host: l.hostName }));
const rlBcast = () => bcast({ t: 'rl_list', list: rlList() });
const rlLobbyMsg = l => ({ t: 'rl_lobby', bid: l.bid, stake: l.stake, size: l.size, players: l.players });
function rlLeave(uid, silent) {
  const l = [...RL.values()].find(x => x.players.some(p => p.id === uid));
  if (!l) return;
  const u = Q.getUserById.get(uid);
  l.players = l.players.filter(p => p.id !== uid);
  if (u) { Q.setBal.run(+(u.bal + l.stake).toFixed(2), uid); addTx(uid, 'battle', l.stake, 'Кейс-рулетка: возврат ставки'); sync(uid); }
  if (!l.players.length) RL.delete(l.bid);
  else if (l.host === uid) { l.host = l.players[0].id; l.hostName = l.players[0].name }
  l.players.forEach(p => send(p.id, rlLobbyMsg(l)));
  rlBcast();
  if (!silent) toast_(uid, 'Вы вышли из рулетки');
}
function toast_(uid, m) { send(uid, { t: 'err', m }) }
function rlCreate(uid, stake) {
  stake = Math.round(+stake || 0);
  if (stake < 100) return send(uid, { t: 'err', m: 'Ставка от 100 MCOIN' });
  if ([...RL.values()].some(l => l.players.some(p => p.id === uid))) return send(uid, { t: 'err', m: 'Вы уже в рулетке' });
  const u = Q.getUserById.get(uid);
  if (u.bal < stake) return send(uid, { t: 'err', m: 'Не хватает MCOIN' });
  Q.setBal.run(+(u.bal - stake).toFixed(2), uid);
  addTx(uid, 'battle', -stake, 'Кейс-рулетка: ставка');
  const bid = rnd(4);
  const l = { bid, host: uid, hostName: u.name, stake, size: RL_SIZE, players: [{ id: uid, name: u.name, icon: u.icon }] };
  RL.set(bid, l); sync(uid); send(uid, rlLobbyMsg(l)); rlBcast();
}
function rlJoin(uid, bid) {
  const l = RL.get(String(bid || '')); if (!l) return send(uid, { t: 'err', m: 'Лобби не найдено' });
  if (l.players.length >= l.size) return send(uid, { t: 'err', m: 'Мест нет' });
  if (l.players.some(p => p.id === uid)) return;
  const u = Q.getUserById.get(uid);
  if (u.bal < l.stake) return send(uid, { t: 'err', m: 'Не хватает MCOIN' });
  Q.setBal.run(+(u.bal - l.stake).toFixed(2), uid);
  addTx(uid, 'battle', -l.stake, 'Кейс-рулетка: ставка');
  l.players.push({ id: uid, name: u.name, icon: u.icon });
  sync(uid);
  l.players.forEach(p => send(p.id, rlLobbyMsg(l)));
  rlBcast();
}
function rlStart(uid, bid) {
  const l = RL.get(String(bid || '')); if (!l) return send(uid, { t: 'err', m: 'Лобби не найдено' });
  if (l.host !== uid) return send(uid, { t: 'err', m: 'Запускает создатель лобби' });
  if (l.players.length < 2) return send(uid, { t: 'err', m: 'Нужно хотя бы 2 игрока' });
  RL.delete(l.bid); rlBcast();
  const winner = l.players[crypto.randomInt(l.players.length)];
  const pot = +(l.stake * l.players.length).toFixed(2);
  l.players.forEach(p => send(p.id, { t: 'rl_spin', players: l.players, win: winner.id, pot, stake: l.stake, name: winner.name }));
  setTimeout(() => {
    const wu = Q.getUserById.get(winner.id);
    if (wu) {
      Q.setBal.run(+(wu.bal + pot).toFixed(2), winner.id);
      addTx(winner.id, 'battle', pot, `Кейс-рулетка: банк ${pot}`);
    }
    l.players.forEach(p => { send(p.id, { t: 'rl_result', win: winner.id, name: winner.name, pot, players: l.players }); sync(p.id) });
    log('info', `[рулетка] банк ${pot} забрал ${winner.name}`, winner.id);
  }, 4600);
}

/* ------------------------- КОСМЕТИКА ПРОФИЛЯ ---------------------------- */
const COSM_FRAMES = [
  { key: 'gold', n: 'Золотая рамка', p: 10000, e: '🥇' },
  { key: 'rainbow', n: 'Радужная рамка', p: 50000, e: '🌈' },
  { key: 'plasma', n: 'Плазменная рамка', p: 150000, e: '⚡' }
];
const COSM_BGS = [
  { key: 'nebula', n: 'Туманность', p: 15000, e: '🌌' },
  { key: 'aurora', n: 'Полярное сияние', p: 25000, e: '🌠' },
  { key: 'city', n: 'Ночной город', p: 35000, e: '🌃' },
  { key: 'gold', n: 'Золотой фон', p: 50000, e: '🏆' },
  { key: 'matrix', n: 'Матрица', p: 75000, e: '🟩' }
];
const COSM_TITLES = [
  { key: 'sniper', n: 'Снайпер', e: '🎯', cond: (s) => s.lowWin >= 1 },
  { key: 'collector', n: 'Коллекционер', e: '💎', cond: (s, q) => Object.keys(q || {}).length >= 60 },
  { key: 'legend', n: 'Легенда', e: '👑', cond: (s) => s.wins >= 100 || s.maxBal >= 1000000 }
];
function cosTitle(key) { return COSM_TITLES.find(t => t.key === key); }
function profileOf(u) { try { return JSON.parse(u.profile || '{}') || {} } catch (e) { return {} } }
function cosmeticsOwned(uid) {
  const rows = db.prepare('SELECT kind,key FROM cosmetics WHERE user_id=?').all(uid);
  const out = [];
  rows.forEach(r => out.push(r.kind + ':' + r.key));
  return out;
}
function cosmeticSet(uid, kind, key) {
  const u = Q.getUserById.get(uid); if (!u) return;
  const prof = profileOf(u);
  if (!['frame', 'bg', 'title'].includes(kind)) return;
  if (key) {
    if (kind === 'title') { const t = cosTitle(key); if (!t) return send(uid, { t: 'err', m: 'Нет такого титула' }); }
    else if (!cosmeticsOwned(uid).includes(kind + ':' + key)) return send(uid, { t: 'err', m: 'Сначала купите' });
  }
  prof[kind] = key || '';
  try { db.prepare('UPDATE users SET profile=? WHERE id=?').run(JSON.stringify(prof), uid); } catch (e) { }
  sync(uid);
  send(uid, { t: 'cosmetics_ok', m: key ? 'Применено' : 'Снято' });
}
function cosmeticBuy(uid, kind, key) {
  const list = kind === 'frame' ? COSM_FRAMES : kind === 'bg' ? COSM_BGS : null;
  if (!list) return send(uid, { t: 'err', m: 'Не продаётся' });
  const item = list.find(x => x.key === key);
  if (!item) return send(uid, { t: 'err', m: 'Не найдено' });
  if (cosmeticsOwned(uid).includes(kind + ':' + key)) return cosmeticSet(uid, kind, key);
  const u = Q.getUserById.get(uid);
  if (u.bal < item.p) return send(uid, { t: 'err', m: 'Не хватает MCOIN' });
  Q.setBal.run(+(u.bal - item.p).toFixed(2), uid);
  db.prepare('INSERT OR IGNORE INTO cosmetics(user_id,kind,key,since) VALUES(?,?,?,?)').run(uid, kind, key, Date.now());
  addTx(uid, 'buy', -item.p, `${item.n}`);
  const prof = profileOf(u); prof[kind] = key;
  try { db.prepare('UPDATE users SET profile=? WHERE id=?').run(JSON.stringify(prof), uid); } catch (e) { }
  sync(uid); send(uid, { t: 'cosmetics_ok', m: 'Куплено: ' + item.n });
}
function vipBuy(uid) {
  const u = Q.getUserById.get(uid);
  const price = +SETTINGS.vip_price || 0, days = +SETTINGS.vip_days || 30;
  if (price <= 0) return send(uid, { t: 'err', m: 'VIP отключён' });
  if (u.bal < price) return send(uid, { t: 'err', m: 'Не хватает MCOIN' });
  const until = Math.max(Date.now(), +(u.vip_until || 0)) + days * 86400000;
  Q.setBal.run(+(u.bal - price).toFixed(2), uid);
  Q.setVip.run('VIP', until, uid);
  addTx(uid, 'buy', -price, `VIP на ${days} дн.`);
  sync(uid); send(uid, { t: 'cosmetics_ok', m: `VIP на ${days} дней оформлен` });
}

function handleAction(uid, m) {
  const u = Q.getUserById.get(uid);
  if (!u) return;
  const a = String(m.a || '');
  const dev = !!u.dev;
  if (a === 'buy') return actBuy(uid, u, m.i, dev);
  if (a === 'spin') return actSpin(uid, u, m, dev);
  if (a === 'case') return actCase(uid, u, m.ci, dev);
  if (a === 'market_open') return sendMarket(uid);
  if (a === 'market_list') return marketListItem(uid, m.id, m.price);
  if (a === 'market_buy') return marketBuyItem(uid, m.id);
  if (a === 'market_cancel') return marketCancel(uid, m.id);
  if (a === 'sticker_apply') return applySticker(uid, m.itemId, m.stickerId);
  if (a === 'sticker_remove') return removeSticker(uid, m.itemId, m.stickerKey);
  if (a === 'sticker_market_list') return marketListSticker(uid, m.stickerId, m.price);
  if (a === 'sticker_market_buy') return marketBuySticker(uid, m.id);
  if (a === 'sticker_market_cancel') return marketCancelSticker(uid, m.id);
  if (a === 'withdraw') return actWithdraw(uid, u, m.ids);
  if (a === 'topup') return actTopup(uid, u, m.amt); // backward compatibility
  if (a === 'topup_start') return startTopupChallenge(uid, u, m.amt);
  if (a === 'topup_confirm') return confirmTopupChallenge(uid, u, m.code);
  if (a === 'topup_cancel') { topupChallenges.delete(uid); return; }
  if (a === 'loan') return actLoan(uid, u, m.x);
  if (a === 'repay') return actRepay(uid, u);
  if (a === 'luck') return actLuck(uid, u);
  if (a === 'asset') return actAsset(uid, u, m.i);
  if (a === 'show') return actShow(uid, m.id, 1);
  if (a === 'unshow') return actShow(uid, m.id, 0);
  /* косметика профиля и VIP */
  if (a === 'cosmetic_buy') return cosmeticBuy(uid, String(m.kind || ''), String(m.key || ''));
  if (a === 'cosmetic_set') return cosmeticSet(uid, String(m.kind || ''), String(m.key || ''));
  if (a === 'vip_buy') return vipBuy(uid);
  if (a === 'claim') {
    const r = claimQuest(uid, String(m.qid || ''));
    if (!r.ok) return send(uid, { t:'err', m: r.m || 'Не выполнено' });
    finishAction(uid);
    return;
  }
  /* ---------- АДМИНКА ---------- */
  if (a === 'dev_toggle') {
    if (m.pw !== ADMIN_PW) return send(uid, { t:'err', m:'Неверный пароль админки' });
    Q.setDev.run(dev ? 0 : 1, uid);
    sync(uid);
    send(uid, { t:'adm_ok', kind:'dev', dev: !dev });
    finishAction(uid);
    return;
  }
  // Все действия админ-панели проходят через одну проверку пароля.
  if (a.startsWith('adm_')) {
    if (m.pw !== ADMIN_PW) return send(uid, { t:'err', m:'Сессия админа истекла' });
    return handleAdmin(uid, a, m);
  }
}

/* ============================ АДМИН-ЛОГИКА ============================= */
function handleAdmin(uid, a, m) {
  if (a === 'adm_report') {
    const users = db.prepare('SELECT COUNT(*) n FROM users').get().n;
    const online = clients.size;
    const economy = db.prepare('SELECT COALESCE(SUM(bal),0) bal, COALESCE(SUM(card),0) card, COALESCE(SUM(debt),0) debt FROM users').get();
    const inv = db.prepare('SELECT COUNT(*) n FROM items').get().n;
    const assets = db.prepare('SELECT COUNT(*) n FROM assets').get().n;
    const msgs = db.prepare('SELECT COUNT(*) n FROM messages').get().n;
    const tx = db.prepare('SELECT COUNT(*) n FROM transactions').get().n;
    const logs = db.prepare('SELECT COUNT(*) n FROM logs').get().n;
    const recent = db.prepare('SELECT kind, COUNT(*) n, COALESCE(SUM(amount),0) amount FROM transactions WHERE created>? GROUP BY kind ORDER BY n DESC LIMIT 12').all(Date.now()-86400000);
    return send(uid, {t:'adm_report', report:{users,online,...economy,inv,assets,msgs,tx,logs,recent}});
  }
  if (a === 'adm_online') {
    const ids = [...clients.keys()];
    const list = ids.length ? db.prepare(`SELECT id,name,icon,bal,last_seen FROM users WHERE id IN (${ids.map(()=>'?').join(',')}) ORDER BY name`).all(...ids) : [];
    return send(uid,{t:'adm_online',list});
  }
  if (a === 'adm_tx') {
    const id = Math.trunc(+m.id || 0), lim = Math.max(1,Math.min(100,Math.trunc(+m.limit||50)));
    const rows = id ? db.prepare('SELECT user_id,kind,amount,meta,created FROM transactions WHERE user_id=? ORDER BY created DESC LIMIT ?').all(id,lim) : db.prepare('SELECT user_id,kind,amount,meta,created FROM transactions ORDER BY created DESC LIMIT ?').all(lim);
    return send(uid,{t:'adm_tx',list:rows.map(x=>({id:x.user_id,kind:x.kind,amount:x.amount,meta:x.meta||'',time:new Date(x.created).toLocaleString('ru-RU')}))});
  }
  if (a === 'adm_clear_logs') {
    const result=db.prepare('DELETE FROM logs').run();
    log('admin', `Admin ${uid} cleared logs`, uid);
    return send(uid,{t:'adm_ok',kind:'clear_logs',count:result.changes});
  }
  if (a === 'adm_set_dev') {
    const id=+m.id, target=Q.getUserById.get(id); if(!target) return send(uid,{t:'err',m:'Игрок не найден'});
    const value=m.value?1:0; Q.setDev.run(value,id); const c=clients.get(id); if(c) c.user.dev=!!value;
    sync(id); return send(uid,{t:'adm_ok',kind:'devset',id,value:!!value});
  }
  if (a === 'adm_reset_progress') {
    const id=+m.id, target=Q.getUserById.get(id); if(!target) return send(uid,{t:'err',m:'Игрок не найден'});
    db.prepare('DELETE FROM user_ach WHERE user_id=?').run(id);
    db.prepare('DELETE FROM user_quests WHERE user_id=?').run(id);
    db.prepare('DELETE FROM stats WHERE user_id=?').run(id);
    db.prepare('DELETE FROM uniq WHERE user_id=?').run(id);
    log('admin',`Admin ${uid} reset progress for user ${id}`,uid);
    sync(id); return send(uid,{t:'adm_ok',kind:'progress',id});
  }
  if (a === 'adm_vip') {
    const id = +m.id;
    const target = Q.getUserById.get(id);
    if (!target) return send(uid, { t:'err', m:'Игрок не найден' });
    const vip = String(m.vip || '').slice(0, 20); // пусто = снять
    const days = Math.max(0, +m.days || 0);       // 0 = навсегда
    const until = days > 0 ? Date.now() + days * 86400000 : 0;
    Q.setVip.run(vip, until, id);
    const client = clients.get(id);
    if (client) { client.user.vip = vip; client.user.vip_until = until; sync(id); }
    bcastPeers();
    send(id, { t:'err', m: vip ? ('Вам выдан VIP: ' + vip) : 'VIP снят' });
    return send(uid, { t:'adm_ok', kind:'vip', id, vip, until });
  }
  if (a === 'adm_users') {
    const q = String(m.q || '').trim();
    let rows;
    if (q) rows = db.prepare('SELECT id,name,icon,bal,card,debt,luck,rating,dev,created_at,last_seen FROM users WHERE name LIKE ? ORDER BY last_seen DESC LIMIT 100').all('%'+q+'%');
    else   rows = db.prepare('SELECT id,name,icon,bal,card,debt,luck,rating,dev,created_at,last_seen FROM users ORDER BY last_seen DESC LIMIT 100').all();
    const online = new Set(clients.keys());
    const list = rows.map(r => ({
      id: r.id, name: r.name, icon: r.icon, bal: r.bal, card: r.card, debt: r.debt,
      luck: r.luck, rating: r.rating, dev: !!r.dev,
      online: online.has(r.id),
      lastSeen: r.last_seen, created: r.created_at
    }));
    return send(uid, { t:'adm_users', list, online: clients.size });
  }
  if (a === 'adm_user') {
    const id = +m.id;
    const u = Q.getUserById.get(id);
    if (!u) return send(uid, { t:'err', m:'Игрок не найден' });
    const inv = Q.itemsByUser.all(id).filter(x=>x.slot===0).map(x=>({ id:x.id, n:x.name, p:x.price }));
    const vit = Q.itemsByUser.all(id).filter(x=>x.slot===1).map(x=>({ id:x.id, n:x.name, p:x.price }));
    const loans = Q.loansByUser.all(id).map(x=>x.amount);
    const assets = Q.assetsByUser.all(id).map(x=>x.name);
    const tx = Q.txList.all(id, 30).map(x => ({ i: kindIcon(x.kind), d: x.meta || '', a: x.amount, t: new Date(x.created).toLocaleString('ru-RU') }));
    return send(uid, { t:'adm_user', user: {
      id: u.id, name: u.name, icon: u.icon, theme: u.theme,
      bal: u.bal, card: u.card, debt: u.debt, luck: u.luck, rating: u.rating, dev: !!u.dev,
      online: clients.has(u.id), created: u.created_at, lastSeen: u.last_seen,
      inv, vit, loans, assets, tx, stats: getStats(id)
    }});
  }
  if (a === 'adm_money') {
    const id = +m.id, amt = +m.amt;
    if (!(amt !== 0) || !isFinite(amt)) return send(uid, { t:'err', m:'Неверная сумма' });
    const t = Q.getUserById.get(id); if (!t) return send(uid, { t:'err', m:'Игрок не найден' });
    const nb = +(t.bal + amt).toFixed(2);
    Q.setBal.run(Math.max(0, nb), id);
    addTx(id, 'gift', amt, amt > 0 ? 'От админа' : 'Списание админом');
    log('admin', `Admin ${uid} changed balance for user ${id} by ${amt}`, uid);
    // Сразу отправляем полное серверное состояние игроку: баланс, историю, статистику и остальные данные.
    sync(id);
    send(id, { t:'err', m: (amt>0?'Админ выдал ':'Админ списал ') + Math.abs(amt).toFixed(2) + ' MCOIN' });
    return send(uid, { t:'adm_ok', kind:'money', id, bal: Math.max(0, nb) });
  }
  if (a === 'adm_item') {
    const id = +m.id, ci = +m.i;
    const it = CAT[ci];
    if (!Number.isInteger(id) || id <= 0 || !Q.getUserById.get(id))
      return send(uid, { t:'err', m:'Игрок не найден' });
    if (!it) return send(uid, { t:'err', m:'Скин не найден' });
    if (countInv(id) >= 9) return send(uid, { t:'err', m:'Инвентарь игрока полон (9/9)' });
    // Админская выдача использует ту же таблицу предметов, что и обычная покупка.
    Q.addItem.run(id, it.n, it.p, 0, 'admin', Date.now());
    noteUniq(id, it.n, it.p);
    addTx(id, 'gift', 0, 'Админ выдал: ' + it.n);
    send(id, { t:'err', m:'Админ выдал скин: ' + it.n });
    sync(id);
    return send(uid, { t:'adm_ok', kind:'item', id, name: it.n });
  }
  if (a === 'adm_nick') {
    const id = +m.id;
    const name = String(m.name || '').trim().slice(0, 14);
    if (name.length < 3) return send(uid, { t:'err', m:'Имя минимум 3' });
    const ex = Q.getUserByName.get(name);
    if (ex && ex.id !== id) return send(uid, { t:'err', m:'Имя занято' });
    Q.setName.run(name, id);
    const t = clients.get(id); if (t) t.user.name = name;
    sync(id); bcastPeers();
    return send(uid, { t:'adm_ok', kind:'nick', id, name });
  }
  if (a === 'adm_reset_pw') {
    const id = +m.id;
    const newPw = String(m.newPw || '').trim();
    if (newPw.length < 4) return send(uid, { t:'err', m:'Пароль минимум 4' });
    const salt = rnd(8), hash = hashPw(newPw, salt);
    db.prepare('UPDATE users SET pw_hash=?, salt=?, token=NULL WHERE id=?').run(hash, salt, id);
    const targetClient = clients.get(id); if (targetClient) { try { targetClient.sock.close(); } catch (e) {} clients.delete(id); sockets.delete(targetClient.sock); }
    return send(uid, { t:'adm_ok', kind:'pw', id });
  }
  if (a === 'adm_delete') {
    const id = +m.id;
    if (id === uid) return send(uid, { t:'err', m:'Нельзя удалить себя' });
    const t = clients.get(id);
    if (t) { try { t.sock.close() } catch(e){} clients.delete(id); }
    db.prepare('DELETE FROM users WHERE id=?').run(id);
    bcastPeers();
    return send(uid, { t:'adm_ok', kind:'del', id });
  }
  if (a === 'adm_logs') {
    const rows = db.prepare('SELECT level,user_id,message,created FROM logs ORDER BY id DESC LIMIT 200').all();
    return send(uid, { t:'adm_logs', list: rows.map(r => ({
      level: r.level, uid: r.user_id, m: r.message,
      t: new Date(r.created).toLocaleString('ru-RU')
    })) });
  }
  if (a === 'adm_broadcast') {
    const text = String(m.text || '').slice(0, 200).trim();
    if (!text) return send(uid, { t:'err', m:'Пустое сообщение' });
    const now = Date.now();
    bcast({ t:'err', m: '📢 ' + text });
    return send(uid, { t:'adm_ok', kind:'broadcast' });
  }
  /* ---------- глобальные настройки ---------- */
  if (a === 'adm_settings') return send(uid, { t:'adm_settings', s: settingsPublic(), def: SETTINGS_DEF });
  if (a === 'adm_set_settings') {
    const patch = m.patch || {};
    let changed = 0;
    for (const k in patch) { if (k in SETTINGS_DEF) { const before = JSON.stringify(SETTINGS[k]); saveSetting(k, patch[k]); if (JSON.stringify(SETTINGS[k]) !== before) changed++; } }
    log('admin', `[настройки] изменено параметров: ${changed} (${Object.keys(patch).join(', ')})`, uid);
    bcastSettings();
    return send(uid, { t:'adm_settings', s: settingsPublic(), def: SETTINGS_DEF, saved: changed });
  }
  /* ---------- имущество игрока ---------- */
  if (a === 'adm_assets') {
    const id = +m.id || 0;
    return send(uid, { t:'adm_assets', id, list: Q.assetsByUser.all(id).map(x => ({ name:x.name, price:x.price, bought:x.bought })), cat: ASSETS });
  }
  if (a === 'adm_asset_give' || a === 'adm_asset_take') {
    const id = +m.id || 0, name = String(m.name || '');
    const a0 = ASSETS.find(x => x.n === name);
    if (!a0) return send(uid, { t:'err', m:'Нет такого имущества' });
    if (a === 'adm_asset_give') {
      if (Q.assetsByUser.all(id).some(x => x.name === name)) return send(uid, { t:'err', m:'Уже есть' });
      Q.addAsset.run(id, name, a0.p, Date.now());
      addTx(id, 'gift', 0, `Админ выдал: ${name}`);
    } else {
      db.prepare('DELETE FROM assets WHERE user_id=? AND name=?').run(id, name);
      addTx(id, 'gift', 0, `Админ забрал: ${name}`);
    }
    log('admin', `[имущество] ${name} → игроку ${id}`, uid);
    sync(id);
    send(uid, { t:'adm_ok', kind:'asset' });
    return send(uid, { t:'adm_assets', id, list: Q.assetsByUser.all(id).map(x => ({ name:x.name, price:x.price, bought:x.bought })), cat: ASSETS });
  }
  return send(uid, { t:'err', m:'Неизвестное админ-действие' });
}

/* Старую ADMIN_OK можно оставить на всякий — она больше не используется */
function ADMIN_OK(uid) { const u = Q.getUserById.get(uid); return u && u.name === 'admin'; }

const STICKER_CATALOG = [
  { key:'crown', name:'Золотая корона', pct:0.08, price:250, emoji:'👑' },
  { key:'dragon', name:'Голографический дракон', pct:0.15, price:500, emoji:'🐉' },
  { key:'skull', name:'Неоновый череп', pct:0.10, price:350, emoji:'💀' },
  { key:'lightning', name:'Молния', pct:0.05, price:150, emoji:'⚡' },
  { key:'star', name:'Золотая звезда', pct:0.03, price:100, emoji:'⭐' }
];
function stickerDef(key) { return STICKER_CATALOG.find(x => x.key === key); }
function awardXp(uid, amount, reason) {
  db.prepare('INSERT OR IGNORE INTO player_progress(user_id,xp,level) VALUES (?,0,1)').run(uid);
  const old = db.prepare('SELECT xp,level FROM player_progress WHERE user_id=?').get(uid);
  const xp = old.xp + amount, level = 1 + Math.floor(Math.sqrt(xp / 100));
  db.prepare('UPDATE player_progress SET xp=?,level=? WHERE user_id=?').run(xp, level, uid);
  if (level > old.level) { const reward=level*50; const u=Q.getUserById.get(uid); Q.setBal.run(+(u.bal+reward).toFixed(2),uid); addTx(uid,'level',reward,`Уровень ${level}`); send(uid, {t:'level_up', level, xp, reward}); }
}
function grantSticker(uid, key, source) {
  const def = key ? stickerDef(key) : STICKER_CATALOG[Math.floor(Math.random()*STICKER_CATALOG.length)];
  if (!def) return null;
  const r = db.prepare('INSERT INTO stickers(user_id,sticker_key,acquired,source) VALUES (?,?,?,?)').run(uid, def.key, Date.now(), source);
  const item = {id:Number(r.lastInsertRowid), key:def.key, name:def.name, pct:def.pct, emoji:def.emoji, source};
  send(uid,{t:'sticker_drop',sticker:item});
  return item;
}
function stickerValue(itemId) {
  const rows = db.prepare('SELECT sticker_key FROM item_stickers WHERE item_id=?').all(itemId);
  return rows.reduce((sum,r)=>sum+(stickerDef(r.sticker_key)?.pct||0),0);
}
function marketItemPrice(itemId, basePrice) { return Math.round(basePrice * (1 + stickerValue(itemId)) * 100) / 100; }
function sendMarket(uid) {
  const listings = db.prepare(`SELECT l.id,l.item_id,l.price,l.created,l.seller_id,u.name seller,i.name itemName,i.price basePrice FROM market_listings l JOIN items i ON i.id=l.item_id JOIN users u ON u.id=l.seller_id ORDER BY l.created DESC LIMIT 100`).all().map(x => ({...x, stickerKeys: db.prepare('SELECT sticker_key FROM item_stickers WHERE item_id=?').all(x.item_id).map(y=>y.sticker_key), stickerPct: db.prepare('SELECT sticker_key FROM item_stickers WHERE item_id=?').all(x.item_id).reduce((sum,y)=>sum+(stickerDef(y.sticker_key)?.pct||0),0)}));
  const stickerListings = db.prepare(`SELECT l.id,l.price,l.created,u.name seller,s.sticker_key FROM sticker_market l JOIN stickers s ON s.id=l.sticker_id JOIN users u ON u.id=l.seller_id ORDER BY l.created DESC LIMIT 100`).all().map(x=>({...x,sticker:stickerDef(x.sticker_key)}));
  send(uid,{t:'market_data',listings,stickerListings,catalog:STICKER_CATALOG});
}
function marketListItem(uid, id, priceRaw) {
  const item = Q.getItem.get(+id,uid); const price=Number(priceRaw);
  if(!item || item.slot!==0) return send(uid,{t:'err',m:'Предмет не найден в инвентаре'});
  if(!Number.isFinite(price)||price<1||price>100000000) return send(uid,{t:'err',m:'Укажи цену от 1 до 100 000 000'});
  try { db.prepare('INSERT INTO market_listings(item_id,seller_id,price,created) VALUES (?,?,?,?)').run(item.id,uid,Math.round(price*100)/100,Date.now()); }
  catch(e){ return send(uid,{t:'err',m:'Предмет уже выставлен на маркет'}); }
  awardXp(uid,2,'выставление предмета'); addTx(uid,'market',0,`Выставлен ${item.name} за ${price}`); finishAction(uid); sendMarket(uid);
}
function marketCancel(uid,id) {
  const row=db.prepare('SELECT item_id FROM market_listings WHERE id=? AND seller_id=?').get(+id,uid);
  if(!row) return send(uid,{t:'err',m:'Лот не найден'});
  db.prepare('DELETE FROM market_listings WHERE id=? AND seller_id=?').run(+id,uid); finishAction(uid); sendMarket(uid);
}
function marketBuyItem(uid,id) {
  const listing=db.prepare('SELECT l.*,i.name itemName,i.price basePrice FROM market_listings l JOIN items i ON i.id=l.item_id WHERE l.id=?').get(+id);
  if(!listing) return send(uid,{t:'err',m:'Лот уже продан или снят'});
  if(listing.seller_id===uid) return send(uid,{t:'err',m:'Нельзя купить собственный предмет'});
  const buyer=Q.getUserById.get(uid); if(buyer.bal<listing.price) return send(uid,{t:'err',m:'Не хватает MCOIN'});
  if(countInv(uid)>=9) return send(uid,{t:'err',m:'Инвентарь полон (9/9)'});
  try {
    db.exec('BEGIN IMMEDIATE');
    const fresh=db.prepare('SELECT * FROM market_listings WHERE id=?').get(+id); if(!fresh) throw new Error('LOT_GONE');
    const buyerNow=Q.getUserById.get(uid), sellerNow=Q.getUserById.get(fresh.seller_id);
    if(!buyerNow || buyerNow.bal<fresh.price || !sellerNow) throw new Error('BALANCE');
    Q.setBal.run(+(buyerNow.bal-fresh.price).toFixed(2),uid);
    Q.setBal.run(+(sellerNow.bal+fresh.price).toFixed(2),fresh.seller_id);
    db.prepare('UPDATE items SET user_id=?,slot=0 WHERE id=?').run(uid,fresh.item_id);
    db.prepare('DELETE FROM market_listings WHERE id=?').run(+id);
    addTx(uid,'market',-fresh.price,`Покупка ${listing.itemName}`); addTx(fresh.seller_id,'market',fresh.price,`Продажа ${listing.itemName}`);
    db.exec('COMMIT');
  } catch(e) { try{db.exec('ROLLBACK')}catch(_){} return send(uid,{t:'err',m:'Не удалось завершить сделку; обнови маркет'}); }
  awardXp(uid,5,'покупка на маркете'); awardXp(listing.seller_id,5,'продажа на маркете'); finishAction(uid); sync(listing.seller_id); sendMarket(uid);
}
function applySticker(uid,itemId,stickerId) {
  const item=Q.getItem.get(+itemId,uid), sticker=db.prepare('SELECT * FROM stickers WHERE id=? AND user_id=?').get(+stickerId,uid);
  if(!item || item.slot!==0 || !sticker) return send(uid,{t:'err',m:'Предмет или наклейка не найдены'});
  if(db.prepare('SELECT 1 FROM market_listings WHERE item_id=?').get(item.id)) return send(uid,{t:'err',m:'Сначала сними предмет с маркета'});
  if(db.prepare('SELECT COUNT(*) n FROM item_stickers WHERE item_id=?').get(item.id).n>=4) return send(uid,{t:'err',m:'На скине уже 4 наклейки'});
  db.prepare('INSERT INTO item_stickers(item_id,sticker_key,applied) VALUES (?,?,?)').run(item.id,sticker.sticker_key,Date.now());
  db.prepare('DELETE FROM stickers WHERE id=? AND user_id=?').run(sticker.id,uid);
  awardXp(uid,3,'наклейка нанесена'); addTx(uid,'sticker',0,`Наклейка ${sticker.sticker_key} нанесена на ${item.name}`); finishAction(uid);
}
function removeSticker(uid,itemId,key) {
  const item=Q.getItem.get(+itemId,uid); if(!item) return send(uid,{t:'err',m:'Предмет не найден'});
  if(db.prepare('SELECT 1 FROM market_listings WHERE item_id=?').get(item.id)) return send(uid,{t:'err',m:'Сними предмет с маркета перед изменением'});
  const row=db.prepare('SELECT rowid FROM item_stickers WHERE item_id=? AND sticker_key=? LIMIT 1').get(item.id,String(key));
  if(!row) return send(uid,{t:'err',m:'Наклейка не найдена'});
  db.prepare('DELETE FROM item_stickers WHERE rowid=?').run(row.rowid); addTx(uid,'sticker',0,`Наклейка ${key} снята и уничтожена`); finishAction(uid);
}
function marketListSticker(uid,stickerId,priceRaw) {
  const sticker=db.prepare('SELECT * FROM stickers WHERE id=? AND user_id=?').get(+stickerId,uid), price=Number(priceRaw);
  if(!sticker) return send(uid,{t:'err',m:'Наклейка не найдена'});
  if(!Number.isFinite(price)||price<1||price>100000000) return send(uid,{t:'err',m:'Некорректная цена'});
  try{db.prepare('INSERT INTO sticker_market(sticker_id,seller_id,price,created) VALUES (?,?,?,?)').run(sticker.id,uid,Math.round(price*100)/100,Date.now());}catch(e){return send(uid,{t:'err',m:'Наклейка уже выставлена'});}
  finishAction(uid); sendMarket(uid);
}
function marketCancelSticker(uid,id) {
  const row=db.prepare('SELECT sticker_id FROM sticker_market WHERE id=? AND seller_id=?').get(+id,uid); if(!row)return send(uid,{t:'err',m:'Лот не найден'});
  db.prepare('DELETE FROM sticker_market WHERE id=? AND seller_id=?').run(+id,uid); finishAction(uid); sendMarket(uid);
}
function marketBuySticker(uid,id) {
  const l=db.prepare('SELECT * FROM sticker_market WHERE id=?').get(+id); if(!l)return send(uid,{t:'err',m:'Наклейка уже продана'});
  if(l.seller_id===uid)return send(uid,{t:'err',m:'Нельзя купить собственную наклейку'});
  if(Q.getUserById.get(uid).bal<l.price)return send(uid,{t:'err',m:'Не хватает MCOIN'});
  try { db.exec('BEGIN IMMEDIATE'); const fresh=db.prepare('SELECT * FROM sticker_market WHERE id=?').get(+id); if(!fresh)throw Error('GONE'); const buyerNow=Q.getUserById.get(uid),sellerNow=Q.getUserById.get(fresh.seller_id); if(!buyerNow||buyerNow.bal<fresh.price||!sellerNow)throw Error('BALANCE'); Q.setBal.run(+(buyerNow.bal-fresh.price).toFixed(2),uid); Q.setBal.run(+(sellerNow.bal+fresh.price).toFixed(2),fresh.seller_id); db.prepare('UPDATE stickers SET user_id=?,source=? WHERE id=?').run(uid,'market',fresh.sticker_id); db.prepare('DELETE FROM sticker_market WHERE id=?').run(+id); addTx(uid,'market',-fresh.price,'Покупка наклейки'); addTx(fresh.seller_id,'market',fresh.price,'Продажа наклейки'); db.exec('COMMIT'); } catch(e) { try{db.exec('ROLLBACK')}catch(_){} return send(uid,{t:'err',m:'Не удалось завершить сделку'}); } awardXp(uid,2,'покупка наклейки'); finishAction(uid); sync(l.seller_id); sendMarket(uid);
}

function actBuy(uid, u, i, dev) {
  const c = CAT[+i]; if (!c) return;
  if (countInv(uid) >= 9) return send(uid, { t:'err', m:'Инвентарь полон (9/9)' });
  const price = priceOf(c.p);
  if (!dev && u.bal < price) return send(uid, { t:'err', m:'Не хватает MCOIN' });
  if (!dev) Q.setBal.run(+(u.bal - price).toFixed(2), uid);
  Q.addItem.run(uid, c.n, c.p, 0, 'buy', Date.now());
  noteUniq(uid, c.n, c.p);
  if (!dev) { const s = getStats(uid); s.bought++; s.boughtSum += c.p; setStats(uid, s); }
  addTx(uid, 'buy', -price, c.n);
  awardXp(uid, 5, 'покупка предмета');
  finishAction(uid);
}

function actSpin(uid, u, m, dev) {
  const ownId = +m.own, tgtIdx = +m.tgt;
  const ownItem = Q.getItem.get(ownId, uid);
  if (!ownItem || ownItem.slot !== 0) return send(uid, { t:'err', m:'Предмет не найден' });
  const tgt = CAT[tgtIdx]; if (!tgt) return send(uid, { t:'err', m:'Цель не найдена' });

  const ownPrice = ownItem.price;
  const mxBoost = dev ? 0 : Math.max(0, Math.min(Math.floor(ownPrice * 10) / 100, Math.floor(u.bal * 100) / 100));
  const boost = dev ? 0 : Math.max(0, Math.min(+m.boost || 0, mxBoost));
  const c = dev ? 100 : chancePct(ownPrice, tgt.p, boost, u.luck);

  if (c <= 0) return send(uid, { t:'err', m:'Шанс 0%' });
  if (boost > 0) Q.setBal.run(+(u.bal - boost).toFixed(2), uid);

  const win = dev ? true : Math.random() * 100 < c;
  const s = getStats(uid);
  s.spins++; s.boostSpent += boost;
  const mult = tgt.p / Math.max(ownPrice, 0.01);

  if (win) {
    Q.delItem.run(ownItem.id, uid);
    Q.addItem.run(uid, tgt.n, tgt.p, 0, 'upgrade', Date.now());
    noteUniq(uid, tgt.n, tgt.p);
    pushTop(uid, tgt.n, tgt.p);
    s.wins++; s.streak++; if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    if (mult >= 5) s.winX5++;
    if (mult >= 50) s.winX50++;
    if (mult >= 500) s.winX500++;
    if (c <= 5) s.lowWin++;
    if (c <= 25) s.lowWin25++;
    if (tgt.p > 5000) s.bigWins++;
    if (tgt.p > s.bestWinP) { s.bestWinP = tgt.p; s.bestWinN = tgt.n; }
    s.rating = Math.max(400, Math.min(2000, s.rating + (1 - c / 100) * 20));
    Q.setRating.run(s.rating, uid);
    addTx(uid, 'spin', tgt.p - ownPrice, `Апгрейд: ${ownItem.name} → ${tgt.n} (${c.toFixed(1)}%)`);
    /* космос: мега-событие (сервер фиксирует ачивку и рассылает эффект) */
    const cosmic = rc(tgt.p) === 8;
    if (cosmic) {
      s.cosmic++; if (s.cosmicUpg === undefined) s.cosmicUpg = 0;
      s.cosmicUpg++;
      addTx(uid, 'ach', 0, `КОСМОС: ${tgt.n}`);
      bcast({ t:'cosmic', name:u.name, icon:u.icon, n:tgt.n, p:tgt.p });
    }
    send(uid, { t:'spin_result', win:true, item:{ n:tgt.n, p:tgt.p }, c, cosmic });
    bcast({ t:'top_new', entry:{ name:u.name, icon:u.icon, n:tgt.n, p:tgt.p } });
  } else {
    Q.delItem.run(ownItem.id, uid);
    const ins = Math.min(ownPrice * 0.25, 2000);
    const balAfterBoost = Q.getUserById.get(uid).bal;
    Q.setBal.run(+(balAfterBoost + ins).toFixed(2), uid);
    s.losses++; s.streak = 0;
    addTx(uid, 'spin', -ownPrice + ins, `Провал: ${ownItem.name}`);
    send(uid, { t:'spin_result', win:false, item:{ n:ownItem.name, p:ownPrice }, c });
  }
  setStats(uid, s);
  finishAction(uid);
}

function actCase(uid, u, ci, dev) {
  const c = CASES[+ci]; if (!c) return;
  const price = casePriceOf(c.p);
  if (!dev && u.bal < price) return send(uid, { t:'err', m:'Не хватает MCOIN' });
  if (!dev) Q.setBal.run(+(u.bal - price).toFixed(2), uid);
  const item = dropFrom(ci);
  const cnt = countInv(uid);
  let sold = false;
  if (cnt < 9) {
    Q.addItem.run(uid, item.n, item.p, 0, 'case', Date.now());
    noteUniq(uid, item.n, item.p);
  } else {
    Q.setBal.run(+(Q.getUserById.get(uid).bal + item.p).toFixed(2), uid);
    sold = true;
  }
  pushTop(uid, item.n, item.p);
  const s = getStats(uid);
  s.cases++; s.caseSpent += price; s.caseValue += item.p;
  if (item.p > s.caseBestP) { s.caseBestP = item.p; s.caseBestN = item.n; }
  setStats(uid, s);
  addTx(uid, 'case', -c.p, `${c.n}: ${item.n} (${item.p})`);
  let stickerDrop = null;
  if (Math.random() < 0.12) { stickerDrop = grantSticker(uid, null, 'case'); }
  awardXp(uid, 10, 'открытие кейса');
  send(uid, { t:'case_result', item, sold, ci, stickerDrop });
  if (item.p >= 1000) bcast({ t:'top_new', entry:{ name:u.name, icon:u.icon, n:item.n, p:item.p } });
  finishAction(uid);
}

function dropFrom(ci) {
  const c = CASES[ci];
  let r = Math.random(), tier = c.t[c.t.length-1];
  for (const t of c.t) { if (r < t[0]) { tier = t; break } r -= t[0] }
  let pool = CAT.filter(x => x.p > tier[1] && x.p <= tier[2]);
  if (!pool.length) pool = CAT.filter(x => x.p <= tier[2]);
  if (!pool.length) pool = CAT;
  return pool[Math.floor(Math.random()*pool.length)];
}

function actWithdraw(uid, u, ids) {
  if (!Array.isArray(ids) || !ids.length) return;
  let sum = 0, cnt = 0;
  const del = [];
  for (const id of ids) {
    const it = Q.getItem.get(+id, uid);
    if (!it || it.slot !== 0) continue;
    sum += it.price; cnt++; del.push(it.id);
  }
  if (!cnt) return;
  const pay = cutOf(sum);
  for (const id of del) Q.delItem.run(id, uid);
  Q.setCard.run(+(u.card + pay).toFixed(2), uid);
  const s = getStats(uid); s.sold += cnt; s.sellSum += sum; s.withdrawSum += pay; setStats(uid, s);
  addTx(uid, 'withdraw', pay, `Вывод ${cnt} шт. (+${pay} ₽)`);
  send(uid, { t:'withdraw_ok', pay, cnt });
  finishAction(uid);
}

function startTopupChallenge(uid, u, amt) {
  amt = Math.floor(Number(amt) || 0);
  if (!Number.isSafeInteger(amt) || amt < 1 || amt > 1000000 || amt > u.card)
    return send(uid, { t:'err', m:'Неверная сумма или недостаточно средств на карте' });
  const prev = topupChallenges.get(uid);
  if (prev && prev.expires > Date.now() && prev.tries < 5)
    return send(uid, { t:'err', m:'Сначала завершите или отмените текущее подтверждение' });
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  topupChallenges.set(uid, { amount:amt, code, expires:Date.now()+5*60*1000, tries:0 });
  send(uid, { t:'topup_code', amt, code, expiresIn:300 });
}

function confirmTopupChallenge(uid, u, rawCode) {
  const ch = topupChallenges.get(uid);
  if (!ch || ch.expires < Date.now()) {
    topupChallenges.delete(uid);
    return send(uid, { t:'err', m:'Код истёк. Начните пополнение заново.' });
  }
  const code = String(rawCode || '').replace(/\D/g, '').slice(0, 6);
  ch.tries++;
  if (ch.tries > 5) {
    topupChallenges.delete(uid);
    return send(uid, { t:'err', m:'Слишком много попыток. Начните пополнение заново.' });
  }
  if (code !== ch.code) return send(uid, { t:'err', m:'Неверный код G-BANK' });
  const amt = ch.amount;
  // Re-read authoritative account state immediately before committing.
  const fresh = Q.getUserById.get(uid);
  if (!fresh || amt < 1 || amt > fresh.card) {
    topupChallenges.delete(uid);
    return send(uid, { t:'err', m:'Недостаточно средств на карте' });
  }
  topupChallenges.delete(uid); // single-use challenge
  Q.setCard.run(+(fresh.card - amt).toFixed(2), uid);
  Q.setBal.run(+(fresh.bal + amt).toFixed(2), uid);
  const stats = getStats(uid); stats.topup += amt; setStats(uid, stats);
  addTx(uid, 'topup', amt, `G-BANK: пополнение на ${amt} MCOIN (код подтверждён)`);
  send(uid, { t:'topup_ok', amt });
  finishAction(uid);
}

// Legacy action is routed through the confirmation flow; clients cannot bypass the code.
function actTopup(uid, u, amt) { return startTopupChallenge(uid, u, amt); }

/* Кредиты удалены из игры: долг всегда 0. Оставлены только заглушки,
   чтобы старые клиенты не ломались. */
function actLoan(uid) { Q.setDebt.run(0, uid); sync(uid); }
function actRepay(uid) { Q.setDebt.run(0, uid); sync(uid); }

function actLuck(uid, u) {
  const L = u.luck | 0;
  if (L >= 5) return;
  const price = luckPriceOf(L);
  if (u.card < price) return send(uid, { t:'err', m:'Не хватает рублей на карте' });
  Q.setCard.run(+(u.card - price).toFixed(2), uid);
  Q.setLuck.run(L + 1, uid);
  const s = getStats(uid); s.luckSpent += price; s.luckLevels++; setStats(uid, s);
  addTx(uid, 'luck', -price, `Удача ур. ${L+1}`);
  finishAction(uid);
}

function actAsset(uid, u, i) {
  const a = ASSETS[+i]; if (!a) return;
  const have = Q.assetsByUser.all(uid).map(x=>x.name);
  if (have.includes(a.n)) return send(uid, { t:'err', m:'Уже куплено' });
  if (u.card < a.p) return send(uid, { t:'err', m:'Не хватает рублей' });
  Q.setCard.run(+(u.card - a.p).toFixed(2), uid);
  Q.addAsset.run(uid, a.n, a.p, Date.now());
  const s = getStats(uid); s.assetsBought++; s.assetsSpent += a.p; setStats(uid, s);
  addTx(uid, 'asset', -a.p, `Куплено: ${a.n}`);
  send(uid, { t:'asset_ok', name:a.n });
  finishAction(uid);
}

function actShow(uid, id, slot) {
  const it = Q.getItem.get(+id, uid);
  if (!it) return;
  if (slot === 1 && it.slot === 0) {
    const cnt = Q.itemsByUser.all(uid).filter(x=>x.slot===1).length;
    if (cnt >= 3) return send(uid, { t:'err', m:'Витрина полна' });
  } else if (slot === 0 && it.slot === 1) {
    if (countInv(uid) >= 9) return send(uid, { t:'err', m:'Инвентарь полон' });
  }
  Q.setItemSlot.run(slot, it.id, uid);
  finishAction(uid);
}

/* ============================== БАТТЛЫ ================================== */
const lobbies = new Map();
const battlers = new Map();
const battles = new Map();

function cleanupUserBattles(uid) {
  for (const [bid, b] of battles) {
    if (b.players && b.players.some(p => p.id === uid)) {
      battles.delete(bid);
      const other = b.players.find(p => p.id !== uid);
      if (other) send(other.id, { t:'bb_cancel', bid });
    }
  }
  for (const [bid, l] of lobbies) {
    if (l.host === uid) {
      lobbies.delete(bid);
      bcast({ t:'battle_cancel', bid });
    }
  }
  battlers.delete(uid);
}

function handleBattleCreate(uid, m) {
  const ci = +m.ci; const c = CASES[ci]; if (!c) return;
  const u = Q.getUserById.get(uid);
  const size = Math.max(2, Math.min(4, +m.size || 2));
  if (battlers.has(uid)) return;
  if (!u.dev && u.bal < c.p) return send(uid, { t:'err', m:'Не хватает MCOIN' });
  if (!u.dev) Q.setBal.run(+(u.bal - c.p).toFixed(2), uid);
  const bid = rnd(6);
  lobbies.set(bid, { bid, host: uid, ci, size, paid: u.dev ? 0 : c.p, players: [{ id: uid, name: u.name, icon: u.icon }], ts: Date.now() });
  battlers.set(uid, bid);
  bcast({ t:'battle_list', list: lobbyList() });
  send(uid, { t:'battle_lobby', bid, ci, size, players: lobbies.get(bid).players });
}
function handleBattleJoin(uid, m) {
  const l = lobbies.get(String(m.bid)); if (!l) return send(uid, { t:'err', m:'Лобби не найдено' });
  const c = CASES[l.ci];
  const u = Q.getUserById.get(uid);
  if (!u.dev && u.bal < c.p) return send(uid, { t:'err', m:'Не хватает MCOIN' });
  if (l.players.some(p => p.id === uid)) return;
  if (l.players.length >= l.size) return send(uid, { t:'err', m:'Лобби заполнено' });
  if (!u.dev) Q.setBal.run(+(u.bal - c.p).toFixed(2), uid);
  l.players.push({ id: uid, name: u.name, icon: u.icon });
  battlers.set(uid, l.bid);
  if (l.players.length >= l.size) startBattle(l);
  else { l.players.forEach(p => send(p.id, { t:'battle_lobby', bid:l.bid, ci:l.ci, size:l.size, players:l.players })); bcast({ t:'battle_list', list: lobbyList() }); }
}
function handleBattleLeave(uid, m) {
  const l = lobbies.get(String(m.bid));
  if (l && l.host === uid) {
    refundBattle(l);
    lobbies.delete(l.bid); battlers.delete(uid);
    bcast({ t:'battle_cancel', bid:l.bid });
    bcast({ t:'battle_list', list: lobbyList() });
    return;
  }
  const b = battles.get(String(m.bid));
  if (b) {
    const other = b.players.find(p => p.id !== uid);
    battles.delete(b.bid);
    if (other) send(other.id, { t:'bb_cancel', bid:b.bid });
  }
}
function lobbyList() {
  const now = Date.now();
  const out = [];
  for (const [bid, l] of lobbies) {
    if (now - l.ts > 60000) { lobbies.delete(bid); continue }
    out.push({ bid, ci: l.ci, size: l.size, n: l.players.length, host: l.players[0].name });
  }
  return out;
}
function refundBattle(l) {
  if (!l.paid) return;
  const u = Q.getUserById.get(l.host);
  if (!u) return;
  Q.setBal.run(+(u.bal + l.paid).toFixed(2), u.id);
  addTx(u.id, 'repay', l.paid, 'Возврат ставки');
  sync(u.id);
}
function startBattle(l) {
  lobbies.delete(l.bid);
  const res = l.players.map(p => ({ id: p.id, item: dropFrom(l.ci) }));
  const mx = Math.max(...res.map(r => r.item.p));
  const winners = res.filter(r => r.item.p === mx);
  const win = winners[Math.floor(Math.random()*winners.length)].id;
  const d = { bid: l.bid, ci: l.ci, players: l.players, res, win };
  battles.set(l.bid, d);
  const s = getStats(win);
  s.battleWins++;
  setStats(win, s);
  const winU = Q.getUserById.get(win);
  for (const r of res) {
    if (r.id === win) {
      let sold = 0;
      for (const r2 of res) {
        const cnt = countInv(r.id);
        if (cnt < 9) { Q.addItem.run(r.id, r2.item.n, r2.item.p, 0, 'battle', Date.now()); noteUniq(r.id, r2.item.n, r2.item.p) }
        else { Q.setBal.run(+(Q.getUserById.get(r.id).bal + r2.item.p).toFixed(2), r.id); sold += r2.item.p }
      }
      pushTop(r.id, r.item.n, r.item.p);
      addTx(r.id, 'battle', 0, `Победа в баттле ${CASES[l.ci].n}`);
      if (sold > 0) addTx(r.id, 'sell', sold, 'Автопродажа');
    }
  }
  const s2 = getStats(win); setStats(win, s2);
  for (const p of l.players) {
    battlers.delete(p.id);
    const u = Q.getUserById.get(p.id); if (!u) continue;
    const st = getStats(p.id); st.battles++; setStats(p.id, st);
    send(p.id, { t:'battle_result', ...d, me: p.id });
    sync(p.id);
  }
  bcast({ t:'battle_list', list: lobbyList() });
}

/* ========================== СКИН-БАТТЛ БОЛЬШЕ/МЕНЬШЕ =================== */
const bbs = new Map();
const bbUser = new Map();

function handleBBCreate(uid, m) {
  const u = Q.getUserById.get(uid);
  const skinId = +m.skin;
  const it = Q.getItem.get(skinId, uid);
  if (!it || it.slot !== 0) return send(uid, { t:'err', m:'Скин не найден' });
  if (bbUser.has(uid)) return send(uid, { t:'err', m:'Вы уже в баттле' });
  const bid = rnd(6);
  Q.setItemSlot.run(2, it.id, uid);
  bbs.set(bid, { bid, p1: uid, p2: null, skin1: { n: it.name, p: it.price, id: it.id }, skin2: null, stage: 'wait' });
  bbUser.set(uid, bid);
  bcast({ t:'bb_list', list: bbList() });
  send(uid, { t:'bb_wait', bid, my: { n: it.name, p: it.price } });
  sync(uid);
}
function bbList() {
  const out = [];
  for (const [bid, b] of bbs) {
    if (b.stage !== 'wait') continue;
    const u = Q.getUserById.get(b.p1); if (!u) continue;
    out.push({ bid, skin: b.skin1, host: u.name, icon: u.icon });
  }
  return out;
}
function handleBBJoin(uid, m) {
  const b = bbs.get(String(m.bid));
  if (!b || b.stage !== 'wait') return send(uid, { t:'err', m:'Лобби недоступно' });
  if (b.p1 === uid) return send(uid, { t:'err', m:'Это ваше лобби' });
  const skinId = +m.skin;
  const it = Q.getItem.get(skinId, uid);
  if (!it || it.slot !== 0) return send(uid, { t:'err', m:'Скин не найден' });
  const ratio = Math.max(it.price, b.skin1.p) / Math.max(1, Math.min(it.price, b.skin1.p));
  if (ratio > 3) return send(uid, { t:'err', m:'Разница цен >×3' });
  if (bbUser.has(uid)) return send(uid, { t:'err', m:'Вы уже в баттле' });
  Q.setItemSlot.run(2, it.id, uid);
  b.p2 = uid; b.skin2 = { n: it.name, p: it.price, id: it.id };
  b.stage = 'pick'; b.cur = 1 + Math.floor(Math.random()*10);
  b.picks = {};
  bbUser.set(uid, b.bid);
  const p1u = Q.getUserById.get(b.p1);
  const p2u = Q.getUserById.get(uid);
  send(b.p1, { t:'bb_start', bid:b.bid, cur:b.cur, me:{ n:b.skin1.n, p:b.skin1.p }, opp:{ n:b.skin2.n, p:b.skin2.p, name:p2u.name, icon:p2u.icon } });
  send(b.p2, { t:'bb_start', bid:b.bid, cur:b.cur, me:{ n:b.skin2.n, p:b.skin2.p }, opp:{ n:b.skin1.n, p:b.skin1.p, name:p1u.name, icon:p1u.icon } });
  bcast({ t:'bb_list', list: bbList() });
  sync(b.p1); sync(b.p2);
  setTimeout(() => bbTimeout(b.bid), 12000);
}
function handleBBPick(uid, m) {
  const b = bbs.get(String(m.bid));
  if (!b || b.stage !== 'pick') return;
  if (uid !== b.p1 && uid !== b.p2) return;
  if (b.picks[uid]) return;
  b.picks[uid] = m.dir === 'more' ? 'more' : 'less';
  const other = uid === b.p1 ? b.p2 : b.p1;
  send(other, { t:'bb_opp_pick' });
  if (b.picks[b.p1] && b.picks[b.p2]) bbResolve(b.bid);
}
function bbTimeout(bid) {
  const b = bbs.get(bid);
  if (!b || b.stage !== 'pick') return;
  if (!b.picks[b.p1]) b.picks[b.p1] = 'more';
  if (!b.picks[b.p2]) b.picks[b.p2] = 'more';
  bbResolve(bid);
}
function bbResolve(bid) {
  const b = bbs.get(bid);
  if (!b) return;
  b.stage = 'done';
  const next = 1 + Math.floor(Math.random()*10);
  const cur = b.cur;
  const ok = (dir) => (dir === 'more' && next > cur) || (dir === 'less' && next < cur);
  const p1ok = ok(b.picks[b.p1]), p2ok = ok(b.picks[b.p2]);
  let winner = null;
  if (p1ok && !p2ok) winner = b.p1;
  else if (!p1ok && p2ok) winner = b.p2;
  Q.setItemSlot.run(0, b.skin1.id, b.p1);
  Q.setItemSlot.run(0, b.skin2.id, b.p2);
  if (winner) {
    const loser = winner === b.p1 ? b.p2 : b.p1;
    const winSkin = winner === b.p1 ? b.skin1 : b.skin2;
    const loseSkin = winner === b.p1 ? b.skin2 : b.skin1;
    const cnt = countInv(winner);
    if (cnt < 9) { Q.addItem.run(winner, loseSkin.n, loseSkin.p, 0, 'bb', Date.now()); noteUniq(winner, loseSkin.n, loseSkin.p) }
    else { Q.setBal.run(+(Q.getUserById.get(winner).bal + loseSkin.p).toFixed(2), winner) }
    if (cnt > 0) { } /* оба скина у победителя */
    Q.delItem.run(loseSkin.id, loser);
    if (countInv(winner) < 9 && !Q.itemsByUser.all(winner).some(x => x.id === winSkin.id && x.slot === 2)) {
      /* вернуть его собственный скин — уже вернули выше через slot 0 */
    }
    pushTop(winner, loseSkin.n, loseSkin.p);
    const s = getStats(winner); s.bbWins++; setStats(winner, s);
    addTx(winner, 'bb', loseSkin.p, `Победа: ${loseSkin.n}`);
    const s2 = getStats(loser); s2.bbLosses++; setStats(loser, s2);
    addTx(loser, 'bb', -loseSkin.p, `Проигрыш: ${loseSkin.n}`);
  }
  for (const pid of [b.p1, b.p2]) {
    const u = Q.getUserById.get(pid);
    if (!u) continue;
    send(pid, {
      t: 'bb_result', bid,
      cur, next,
      myPick: b.picks[pid],
      oppPick: b.picks[pid === b.p1 ? b.p2 : b.p1],
      winner, me: pid,
      mySkin: pid === b.p1 ? b.skin1 : b.skin2,
      oppSkin: pid === b.p1 ? b.skin2 : b.skin1
    });
    bbUser.delete(pid);
    sync(pid);
  }
  bbs.delete(bid);
}
function handleBBCancel(uid) {
  const bid = bbUser.get(uid);
  if (!bid) return;
  const b = bbs.get(bid);
  if (!b) { bbUser.delete(uid); return }
  if (b.p1 === uid && b.stage === 'wait') {
    Q.setItemSlot.run(0, b.skin1.id, b.p1);
    bbs.delete(bid); bbUser.delete(uid);
    bcast({ t:'bb_list', list: bbList() });
    sync(b.p1);
    return;
  }
  if (b.p2 === uid || b.p1 === uid) {
    if (b.skin1) Q.setItemSlot.run(0, b.skin1.id, b.p1);
    if (b.skin2) Q.setItemSlot.run(0, b.skin2.id, b.p2);
    const other = uid === b.p1 ? b.p2 : b.p1;
    bbs.delete(bid); bbUser.delete(uid);
    if (other) { bbUser.delete(other); send(other, { t:'bb_cancel', bid }); sync(other); }
    sync(uid);
  }
}

server.listen(PORT, () => {
  const nets = os.networkInterfaces(), ips = [];
  Object.values(nets).forEach(arr => (arr || []).forEach(n => { if (n.family === 'IPv4' && !n.internal) ips.push(n.address) }));
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      Golda Drop — сервер (SQLite)       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('  локально:  http://localhost:' + PORT);
  ips.forEach(ip => console.log('  в сети:    http://' + ip + ':' + PORT));
  console.log('  файл:      ' + FILE);
  console.log('  БД:        golda.db');
  console.log('  юзеров:    ' + db.prepare('SELECT COUNT(*) c FROM users').get().c);
  console.log('');
});

