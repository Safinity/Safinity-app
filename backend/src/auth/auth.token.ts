import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return (
    process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? 'dev-secret-change-me'
  );
}

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeBase64Url<T>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');

  return `${salt}:${hash}`;
}

export function comparePassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64).toString('base64url');
  const storedBuffer = Buffer.from(hash, 'base64url');
  const derivedBuffer = Buffer.from(derivedHash, 'base64url');

  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedBuffer);
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(fullPayload);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', getSecret())
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

export function verifyToken(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = createHmac('sha256', getSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = decodeBase64Url<JwtPayload>(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload;
}
