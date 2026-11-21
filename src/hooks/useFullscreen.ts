import { useCallback, useSyncExternalStore } from 'react';
import {
  exitAppFullscreen,
  getIsFullscreen,
  isFullscreenSupported,
  requestAppFullscreen,
  subscribeToFullscreenChanges,
  toggleAppFullscreen,
} from '@/src/services/fullscreen';

export interface UseFullscreenResult {
  isFullscreen: boolean;
  isSupported: boolean;
  toggleFullscreen: () => Promise<boolean>;
  requestFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
}

/**
 * Bileşenlerin gerçek tam ekran durumunu izlemesini ve ortak kapsayıcı üzerinde
 * kesintisiz tam ekran geçişleri yapmasını sağlayan kanca.
 */
export function useFullscreen(targetElementRef?: React.RefObject<HTMLElement | null>): UseFullscreenResult {
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreenChanges,
    getIsFullscreen,
    () => false,
  );
  const isSupported = isFullscreenSupported();

  const handleToggle = useCallback(async () => {
    const target = targetElementRef?.current ?? null;
    return toggleAppFullscreen(target);
  }, [targetElementRef]);

  const handleRequest = useCallback(async () => {
    const target = targetElementRef?.current ?? null;
    return requestAppFullscreen(target);
  }, [targetElementRef]);

  const handleExit = useCallback(async () => {
    return exitAppFullscreen();
  }, []);

  return {
    isFullscreen,
    isSupported,
    toggleFullscreen: handleToggle,
    requestFullscreen: handleRequest,
    exitFullscreen: handleExit,
  };
}
