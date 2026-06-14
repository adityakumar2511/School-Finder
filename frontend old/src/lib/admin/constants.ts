/** Sentinel stored in `User.phone` when an account is disabled (no schema migration). */
export const ACCOUNT_DISABLED_PHONE = "__DISABLED__";

export function isAccountDisabled(phone: string | null | undefined): boolean {
  return phone === ACCOUNT_DISABLED_PHONE;
}
