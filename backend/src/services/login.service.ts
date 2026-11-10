import { prisma } from "../prisma/prisma.js";
import { managerLoginSchema } from "../validations/manager.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, isPasswordCorrect } from "../utils/auth.js";

type LoginAccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  companyId: number;
  credentialVersion: number;
  isActive: boolean;
  locationId?: number | null;
};

type LoginModel = {
  findUnique(args: { where: { email: string } }): Promise<LoginAccount | null>;
  findMany(args: { where: { email: { equals: string; mode: "insensitive" } }; take: number }): Promise<LoginAccount[]>;
  update(args: { where: { id: number }; data: { refreshToken: string } }): Promise<unknown>;
};
type LoginDb = { manager: LoginModel; staff: LoginModel };

const loginSchema = managerLoginSchema.strict();
// Valid cost-10 bcrypt hash, matching the existing password hashing cost. Never
// authenticate against it: it only supplies comparison work for missing users.
const DUMMY_PASSWORD_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const invalidCredentials = () => new ApiError(401, "Invalid email or password");

async function findAccount(model: LoginModel, email: string) {
  const exact = await model.findUnique({ where: { email } });
  if (exact) return { account: exact, ambiguous: false };
  const matches = await model.findMany({ where: { email: { equals: email, mode: "insensitive" } }, take: 2 });
  return { account: matches.length === 1 ? matches[0]! : null, ambiguous: matches.length > 1 };
}

/** Manager/owner credentials take precedence; staff credentials remain usable
 * when a same-email manager has a different password. No tenant comes from input.
 */
export async function login(input: unknown, db: LoginDb = prisma) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues.map(issue => ({ field: issue.path.join("."), message: issue.message })));
  }
  const { email, password } = parsed.data;
  let compared = false;
  for (const kind of ["manager", "staff"] as const) {
    const { account, ambiguous } = await findAccount(db[kind], email);
    if (ambiguous) {
      if (!compared) await isPasswordCorrect(password, DUMMY_PASSWORD_HASH);
      throw invalidCredentials();
    }
    if (!account) continue;
    compared = true;
    if (!await isPasswordCorrect(password, account.password)) continue;
    if (!account.isActive) throw new ApiError(403, kind === "manager" ? "Account is deactivated" : "Your account has been deactivated", [{ code: "ACCOUNT_DEACTIVATED" }]);

    const accessToken = generateAccessToken(account, account.role);
    const refreshToken = generateRefreshToken(account, account.role);
    await db[kind].update({ where: { id: account.id }, data: { refreshToken } });
    const user = { id: account.id, name: account.name, email: account.email, role: account.role, companyId: account.companyId };
    return {
      accessToken,
      refreshToken,
      user: kind === "staff" ? { ...user, locationId: account.locationId, accessToken, refreshToken } : user,
    };
  }
  if (!compared) await isPasswordCorrect(password, DUMMY_PASSWORD_HASH);
  throw invalidCredentials();
}
