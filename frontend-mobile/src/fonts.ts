import { createContext } from 'react';

/** Font loading never gates authentication, recovery or the staff workflow. */
export const NativeFontsReady = createContext(false);

export function nativeFontFamily(language: 'en' | 'ur', emphasized: boolean) {
  return language === 'ur'
    ? emphasized ? 'HygeneArabicBold' : 'HygeneArabic'
    : emphasized ? 'HygeneInterSemiBold' : 'HygeneInter';
}
