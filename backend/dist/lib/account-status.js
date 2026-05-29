"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_DISABLED_PHONE = void 0;
exports.isAccountDisabled = isAccountDisabled;
/** Sentinel stored in `User.phone` when an account is disabled (no schema migration). */
exports.ACCOUNT_DISABLED_PHONE = "__DISABLED__";
function isAccountDisabled(phone) {
    return phone === exports.ACCOUNT_DISABLED_PHONE;
}
