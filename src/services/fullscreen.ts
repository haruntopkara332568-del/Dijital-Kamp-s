/**
 * Dijital Eğitim Kampüsü — Tam Ekran Tarayıcı Yönetim Servisi
 *
 * Modern ve mobil tarayıcılar için (Safari/WebKit, Chrome, Firefox, Edge)
 * ortak tam ekran kontrolü, durum dinleyicisi ve hata toleransı sağlar.
 */

type VendorDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

type VendorElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

function getFullscreenRequest(el: VendorElement): (() => Promise<void> | void) | undefined {
  const doc = el.ownerDocument as VendorDocument;
  if (doc.fullscreenEnabled !== false && typeof el.requestFullscreen === 'function') {
    return el.requestFullscreen;
  }
  if (doc.webkitFullscreenEnabled !== false && typeof el.webkitRequestFullscreen === 'function') {
    return el.webkitRequestFullscreen;
  }
  if (doc.mozFullScreenEnabled !== false && typeof el.mozRequestFullScreen === 'function') {
    return el.mozRequestFullScreen;
  }
  if (doc.msFullscreenEnabled !== false && typeof el.msRequestFullscreen === 'function') {
    return el.msRequestFullscreen;
  }
  return undefined;
}

/** Gerçek tam ekran isteği bu belge için kullanılabilir mi? */
export function isFullscreenSupported(): boolean {
  return typeof document !== 'undefined' &&
    Boolean(getFullscreenRequest(document.documentElement));
}

/**
 * Şu anda tam ekran modunda olunup olunmadığını döner.
 */
export function getIsFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorDocument;
  return Boolean(
    doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement,
  );
}

/**
 * Sahne geçişlerinde ekranda kalan ortak kapsayıcıyı (varsayılan: document.documentElement) tam ekran yapar.
 */
export async function requestAppFullscreen(
  targetElement?: HTMLElement | null,
): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const el = (targetElement || document.documentElement) as VendorElement;

  const request = getFullscreenRequest(el);
  if (!request) return false;

  try {
    await request.call(el);
    return true;
  } catch (error) {
    console.warn('Tam ekran isteği tarayıcı tarafından reddedildi veya engellendi:', error);
  }
  return false;
}

/**
 * Tam ekran modundan çıkar.
 */
export async function exitAppFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorDocument;

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    }
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    }
    if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    }
    if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
  } catch (error) {
    console.warn('Tam ekrandan çıkış işlemi başarısız oldu:', error);
  }
  return false;
}

/**
 * Tam ekran durumunu açar veya kapatır (toggle).
 */
export async function toggleAppFullscreen(
  targetElement?: HTMLElement | null,
): Promise<boolean> {
  if (getIsFullscreen()) {
    await exitAppFullscreen();
    return false;
  }
  await requestAppFullscreen(targetElement);
  return getIsFullscreen();
}

/**
 * Esc tuşu, tarayıcı arayüzü veya API ile tetiklenen tam ekran değişimlerini dinler.
 */
export function subscribeToFullscreenChanges(callback: (isFullscreen: boolean) => void): () => void {
  if (typeof document === 'undefined') return () => {};

  const handler = () => {
    callback(getIsFullscreen());
  };

  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange',
  ];

  events.forEach((evt) => {
    document.addEventListener(evt, handler);
  });

  return () => {
    events.forEach((evt) => {
      document.removeEventListener(evt, handler);
    });
  };
}
