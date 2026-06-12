import type { Request } from 'express';

import type { AuthorSnapshot, UserDocument } from './types';

export const AUTH_COOKIE = 'bulletproof_react_app_token';

export const encode = (value: object): string => {
  return Buffer.from(JSON.stringify(value), 'binary').toString('base64');
};

export const decode = (value: string): object => {
  return JSON.parse(Buffer.from(value, 'base64').toString('binary'));
};

export const hash = (value: string): string => {
  let hashValue = 5381;
  let index = value.length;

  while (index) {
    hashValue = (hashValue * 33) ^ value.charCodeAt(--index);
  }

  return String(hashValue >>> 0);
};

const omit = <T extends object>(obj: T, keys: string[]): T => {
  const result = {} as T;

  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const sanitizeUser = <T extends object>(user: T): T => {
  return omit(user, ['password', 'iat']);
};

export const toAuthorSnapshot = (user: UserDocument): AuthorSnapshot => {
  const { password: _password, _id, ...fields } = user;
  return { id: _id, ...fields };
};

export const serializeUser = (user: UserDocument): AuthorSnapshot => {
  return toAuthorSnapshot(user);
};

type AuthResult =
  | { user: AuthorSnapshot; error?: undefined }
  | { user: null; error: string };

export const requireAuthUser = async (
  req: Request,
  findUserById: (id: string) => Promise<UserDocument | null>,
): Promise<AuthResult> => {
  try {
    const encodedToken = req.cookies[AUTH_COOKIE];

    if (!encodedToken) {
      return { error: 'Unauthorized', user: null };
    }

    const decodedToken = decode(encodedToken) as { id: string };
    const user = await findUserById(decodedToken.id);

    if (!user) {
      return { error: 'Unauthorized', user: null };
    }

    return { user: serializeUser(user) };
  } catch {
    return { error: 'Unauthorized', user: null };
  }
};

export const requireAdmin = (user: AuthorSnapshot): void => {
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
};

export const authenticate = async (
  credentials: { email: string; password: string },
  findUserByEmail: (email: string) => Promise<UserDocument | null>,
): Promise<{ user: AuthorSnapshot; jwt: string }> => {
  const user = await findUserByEmail(credentials.email);

  if (user?.password === hash(credentials.password)) {
    const sanitizedUser = sanitizeUser(serializeUser(user));
    const encodedToken = encode(sanitizedUser);
    return { user: sanitizedUser, jwt: encodedToken };
  }

  throw new Error('Invalid username or password');
};

export const setAuthCookie = (jwt: string): string => {
  return `${AUTH_COOKIE}=${jwt}; Path=/;`;
};

export const clearAuthCookie = (): string => {
  return `${AUTH_COOKIE}=; Path=/;`;
};
