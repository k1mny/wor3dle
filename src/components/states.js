import { atom } from 'jotai';

const date = new Date();
const [month, day, year] = [
  date.getMonth() + 1,
  date.getDate(),
  date.getFullYear(),
];
const dateStr =
  year.toString() + ('00' + month).slice(-2) + ('00' + day).slice(-2);
const localStorageName = 'wor3dle-results';

const getStoredResults = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const savedValue = localStorage.getItem(localStorageName);
  if (savedValue === null) {
    return {};
  }

  try {
    return JSON.parse(savedValue);
  } catch {
    return {};
  }
};

const setStoredResults = (value) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(localStorageName, JSON.stringify(value));
};

const normalizeStoredValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const withDailyStorage = (baseAtom, key) => {
  baseAtom.onMount = (setAtom) => {
    const stored = getStoredResults();
    const dailyValue = stored[dateStr]?.[key];

    if (dailyValue !== undefined) {
      setAtom(dailyValue);
    }
  };

  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const currentValue = get(baseAtom);
      const newValue =
        typeof update === 'function' ? update(currentValue) : update;
      set(baseAtom, newValue);

      const stored = getStoredResults();
      setStoredResults({
        ...stored,
        [dateStr]: {
          ...stored[dateStr],
          [key]: newValue,
        },
      });
    }
  );
};

const withStorage = (baseAtom, key) => {
  baseAtom.onMount = (setAtom) => {
    const stored = getStoredResults();
    const storedValue = stored[key];

    if (storedValue !== undefined && storedValue !== null) {
      setAtom(normalizeStoredValue(storedValue));
    }
  };

  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const currentValue = get(baseAtom);
      const newValue =
        typeof update === 'function' ? update(currentValue) : update;
      set(baseAtom, newValue);

      const stored = getStoredResults();
      setStoredResults({
        ...stored,
        [key]: newValue,
      });
    }
  );
};

export const useBoxApiState = atom([]);

export const useClearState = withDailyStorage(atom(null), 'game-state');

export const useWordleResultTextState = withDailyStorage(
  atom([]),
  'result-text'
);

export const useWordInputState = atom('');

export const useContentsState = atom([]);

export const useWrongMessageState = atom('');

export const useInfoModalState = withStorage(atom(true), 'is-info-open');

export const useCountInputState = withDailyStorage(atom(0), 'count-input');
