export type AuthenticatedUser = {
  id: string; // your DB user id
  clerk_id: string; // Clerk identity id
  email: string | null;
  role: string;
};

export type RequestWithUser = {
  user?: AuthenticatedUser;
  headers: Record<string, string | string[] | undefined>;
};

export type LoginDto = {
  email?: string;
  username?: string;
  password: string;
};

export type RegisterDto = {
  firstName?: string;
  lastName?: string;
  name?: string;
  username: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  user: unknown;
};
