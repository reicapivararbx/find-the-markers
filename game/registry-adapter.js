import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

export const GAME_ID = 'find-the-markers';
export const DEFAULT_MAX_PLAYERS = 8;
export const MAXIMUM_ALLOWED_PLAYERS = 8;

const REGISTRY_URL = process.env.CAPY_REGISTRY_URL || process.env.PORTAL_REGISTRY_URL || 'http://127.0.0.1:8080';
const BRIDGE_SECRET =
  process.env.CAPY_RUNTIME_BRIDGE_SECRET ||
  process.env.CAPYQUAKE_RUNTIME_BRIDGE_SECRET ||
  'dev-runtime-bridge';

function post(path, body) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(path, REGISTRY_URL);
    } catch {
      resolve(null);
      return;
    }
    const payload = JSON.stringify(body);
    const lib = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = lib(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Runtime-Bridge-Secret': BRIDGE_SECRET,
        },
        timeout: 2500,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

export function createSessionKey(seed = '') {
  const base = String(seed || Math.random().toString(36).slice(2, 6)).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (base + 'XXXX').slice(0, 4);
}

export async function registerMarkersRuntime(opts = {}) {
  const runtimeKey = opts.runtimeKey || createSessionKey(opts.seed);
  const maxPlayers = Math.max(
    2,
    Math.min(MAXIMUM_ALLOWED_PLAYERS, Number(opts.maxPlayers) || DEFAULT_MAX_PLAYERS),
  );
  return post('/api/internal/runtime/register', {
    gameId: GAME_ID,
    runtimeKey,
    code: runtimeKey,
    name: opts.name || `Markers ${runtimeKey}`,
    visibility: opts.visibility === 'private' ? 'private' : 'public',
    maxPlayers,
    playerCount: Math.max(0, Number(opts.playerCount) || 1),
    status: opts.status || 'waiting',
    hostUserId: Number(opts.hostUserId) || 0,
    hostUsername: opts.hostUsername || opts.hostName || 'host',
    hostDisplayName: opts.hostDisplayName || opts.hostName || 'host',
    serverId: opts.serverId || null,
    inviteCode: runtimeKey,
  });
}

export async function syncMarkersRuntime(runtimeKey, data = {}) {
  if (!runtimeKey) return null;
  return post('/api/internal/runtime/sync', {
    gameId: GAME_ID,
    runtimeKey,
    code: runtimeKey,
    playerCount: data.playerCount,
    status: data.status,
    started: data.started,
    name: data.name,
    hostName: data.hostName,
    hostUserId: data.hostUserId,
  });
}

export async function closeMarkersRuntime(runtimeKey, reason = 'runtime_closed') {
  if (!runtimeKey) return null;
  return post('/api/internal/runtime/close', {
    gameId: GAME_ID,
    runtimeKey,
    code: runtimeKey,
    reason,
  });
}

export function playerProgressSlot(userId, displayName = '') {
  return {
    userId: Number(userId) || 0,
    displayName: String(displayName || 'player').slice(0, 48),
    markersFound: [],
    room: null,
    separated: true,
  };
}
