import { useEffect, useState } from "react";

const STORED_EVENT = "kurio:stored";

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Grava e avisa os `useStoredState` montados na mesma aba (o evento `storage` só chega às outras). */
export function writeStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORED_EVENT, { detail: key }));
}

export function readStoredValue<T>(key: string, fallback: T) {
  return readStored(key, fallback);
}

export function useStoredState<T>(key: string, fallback: T) {
  // O estado guarda a chave a que pertence: ao trocar de chave (ex.: outro usuário) nada vaza de uma para a outra.
  const [state, setState] = useState<{ key: string; value: T }>(() => ({ key, value: readStored(key, fallback) }));
  const value = state.key === key ? state.value : readStored(key, fallback);

  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);

  useEffect(() => {
    const reload = (event: Event) => {
      if ((event as CustomEvent<string>).detail === key) setState({ key, value: readStored(key, fallback) });
    };
    window.addEventListener(STORED_EVENT, reload);
    return () => window.removeEventListener(STORED_EVENT, reload);
  }, [key, fallback]);

  const setValue = (update: T | ((current: T) => T)) =>
    setState((previous) => {
      const current = previous.key === key ? previous.value : readStored(key, fallback);
      return { key, value: typeof update === "function" ? (update as (current: T) => T)(current) : update };
    });

  return [value, setValue] as const;
}
