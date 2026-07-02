import type { OnboardingData, UserProfile } from "@/types";

const SESSION_KEY = "trajectory-local-session";
const ACCOUNTS_KEY = "trajectory-local-accounts";
const PROFILE_PREFIX = "trajectory-local-profile:";

export type LocalUser = {
  id: string;
  email: string;
  displayName: string | null;
};

type LocalAccount = LocalUser & {
  passwordHash: string;
  createdAt: string;
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getAccounts(): LocalAccount[] {
  return readJson<LocalAccount[]>(ACCOUNTS_KEY, []);
}

function saveAccounts(accounts: LocalAccount[]) {
  writeJson(ACCOUNTS_KEY, accounts);
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function hashPassword(password: string) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return `plain:${password}`;
  }

  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getLocalSession(): LocalUser | null {
  return readJson<LocalUser | null>(SESSION_KEY, null);
}

export function getLocalProfile(userId?: string): UserProfile | null {
  const user = userId ? null : getLocalSession();
  const id = userId || user?.id;
  if (!id) return null;
  return readJson<UserProfile | null>(`${PROFILE_PREFIX}${id}`, null);
}

export function saveLocalProfile(profile: UserProfile) {
  writeJson(`${PROFILE_PREFIX}${profile.userId}`, profile);
}

export function makeDefaultProfile(user: LocalUser, onboardingData: OnboardingData | null = null): UserProfile {
  return {
    id: `profile-${user.id}`,
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: null,
    onboardingData,
    onboardingCompleted: Boolean(onboardingData),
    level: onboardingData ? 1 : 0,
    xpPoints: onboardingData ? 50 : 0,
    currentStreak: 0,
    longestStreak: 0,
    tier: "free",
  };
}

export async function signUpLocal(name: string, email: string, password: string): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  const existing = accounts.find((account) => account.email === normalizedEmail);
  const passwordHash = await hashPassword(password);

  const account: LocalAccount = existing
    ? { ...existing, displayName: name || existing.displayName, passwordHash }
    : {
        id: randomId(),
        email: normalizedEmail,
        displayName: name || normalizedEmail.split("@")[0],
        passwordHash,
        createdAt: new Date().toISOString(),
      };

  const nextAccounts = existing
    ? accounts.map((item) => (item.id === account.id ? account : item))
    : [...accounts, account];
  saveAccounts(nextAccounts);

  const user: LocalUser = {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
  };
  writeJson(SESSION_KEY, user);

  if (!getLocalProfile(user.id)) {
    saveLocalProfile(makeDefaultProfile(user));
  }

  return user;
}

export async function signInLocal(email: string, password: string): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const account = getAccounts().find((item) => item.email === normalizedEmail);
  if (!account) {
    throw new Error("No local account found. Use sign up first while the cloud backend is unavailable.");
  }

  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) {
    throw new Error("Incorrect password for this local account.");
  }

  const user: LocalUser = {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
  };
  writeJson(SESSION_KEY, user);

  if (!getLocalProfile(user.id)) {
    saveLocalProfile(makeDefaultProfile(user));
  }

  return user;
}

export function signOutLocal() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export async function continueAsDemoUser() {
  return signUpLocal("Demo User", "demo@trajectory.local", "trajectory-demo-password");
}
