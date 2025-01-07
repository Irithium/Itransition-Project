"use server";

import { cookies } from "next/headers";
import { defaultLocale } from "@/lib/locales";
import { COOKIE_NAME, I18NEXT_COOKIE } from "@/lib/constant";

export async function getUserLocale() {
  const allCookies = await cookies();
  return allCookies.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale) {
  const allCookies = await cookies();
  allCookies.set(I18NEXT_COOKIE, locale);
  allCookies.set(COOKIE_NAME, locale);
}
