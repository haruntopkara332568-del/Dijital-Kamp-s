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

/**
 * Tarayıcının gerçek tam ekran API'sini destekleyip desteklemediğini kontrol eder.
 */
export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorDocument;
  const el = document.documentElement as VendorElement;

  return Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled ||
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen,
  );
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

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    }
    if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return true;
    }
    if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return true;
    }
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
