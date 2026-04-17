const protectedPrefixes = ["/admin"];

export function isProtectedPagePath(pathname: string) {
  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }

  return /^\/cases\/[^/]+\/edit\/?$/.test(pathname);
}
