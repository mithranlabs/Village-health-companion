// hooks/useStrings.ts
import { createContext, useContext } from 'react';
import { strings } from '@/constants/Strings';
import type { Lang } from '@/constants/Strings';

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof strings.en;
};

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: strings.en,
});

export function useStrings() {
  return useContext(LangContext);
}