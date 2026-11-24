import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
};

/**
 * オンラインかどうか。オフラインのまま開いたときも最初から判定できるよう navigator.onLine を直接読む
 * (TanStack Query の onlineManager は最初をオンラインとみなすため使わない)
 */
export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    // SSR ではオンラインとして描画する
    () => true,
  );
}
