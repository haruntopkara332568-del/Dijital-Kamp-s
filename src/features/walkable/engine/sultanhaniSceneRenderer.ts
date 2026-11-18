/**
 * Aksaray Sultanhanı Kervansarayı Dış Meydanı ve Taç Kapı Sahne Çizici.
 * 
 * Bu çizici:
 * 1. Orijinal fotoğrafı (/assets/walkable/sultanhani_caravanserai.jpg) zemin ve mimari arka plan olarak çizer.
 * 2. Karakteri sınıfta kullanılan 'drawCharacter' (character_student_atlas.png) çizimiyle render eder.
 * 3. Gerçek taç kapı açıklığını (x: 520-586, y: 480-590) yürünebilir geçiş alanı olarak korur.
 * 4. Cephenin üzerine dekoratif eşik veya ikinci kapı eklemez.
 */

import type { PlayerCharacter } from '../types';
import { drawCharacter } from './characterRenderer';
import { getSultanhaniCaravanseraiAsset } from './assetLoader';

/**
 * Katman 1: Sultanhanı Dış Meydan Arka Planı (Fotoğraf ve İç Tonoz Geçişi)
 */
export function renderSultanhaniBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const bgAsset = getSultanhaniCaravanseraiAsset();

  if (bgAsset && typeof ctx.drawImage === 'function') {
    // Fotoğrafı sahne boyutuna orantılı biçimde tam kaplayarak çiz
    ctx.drawImage(bgAsset, 0, 0, width, height);
  } else {
    // Görsel yüklenene kadar veya test ortamlarında çalışan mimari zemin
    // 1. Gökyüzü
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, 260);

    // 2. Kervansaray Ön Duvarı (Sarı-Bej Selçuklu Kesme Taş)
    ctx.fillStyle = '#d4b584';
    ctx.fillRect(0, 260, width, 330);

    // Duvar derz çizgileri
    ctx.strokeStyle = '#b89460';
    ctx.lineWidth = 1;
    for (let y = 280; y < 590; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Taç Kapı Anıtsal Portali (Merkez: 553, Genişlik: 240)
    ctx.fillStyle = '#c4a068';
    ctx.fillRect(433, 240, 240, 350);
    ctx.strokeStyle = '#8c6836';
    ctx.lineWidth = 3;
    ctx.strokeRect(433, 240, 240, 350);

    // 3. Meydan Taş Zemini (y: 590 - 932)
    const groundGrad = ctx.createLinearGradient(0, 590, 0, height);
    groundGrad.addColorStop(0, '#ecd5b3');
    groundGrad.addColorStop(1, '#cbb088');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 590, width, height - 590);

    // Meydan parke taş döşeme ızgarası
    ctx.strokeStyle = 'rgba(140, 104, 54, 0.25)';
    ctx.lineWidth = 1.2;
    for (let y = 590; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // TAÇ KAPI AÇIKLIĞININ İÇİ (x: 520 - 586, y: 480 - 590):
  // Öğrenci kapıdan girdiğinde içeride yürüyüşün devam ettiğini gösteren tonozlu taş geçit
  ctx.save();
  // Tonozlu geçit taban ve derinlik gölgesi
  const passageGrad = ctx.createLinearGradient(553, 480, 553, 590);
  passageGrad.addColorStop(0, 'rgba(8, 12, 18, 0.98)');
  passageGrad.addColorStop(0.6, 'rgba(18, 24, 34, 0.92)');
  passageGrad.addColorStop(1, 'rgba(28, 24, 20, 0.65)');
  ctx.fillStyle = passageGrad;

  // Kemer açıklığını doldur
  ctx.beginPath();
  ctx.moveTo(520, 590);
  ctx.lineTo(520, 510);
  ctx.arc(553, 510, 33, Math.PI, 0, false);
  ctx.lineTo(586, 590);
  ctx.closePath();
  ctx.fill();

  // İç koridordan süzülen hafif altın rengi gün ışığı (İç avlunun devam ettiğini hissettirir)
  const innerLight = ctx.createRadialGradient(553, 500, 4, 553, 500, 28);
  innerLight.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
  innerLight.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
  innerLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = innerLight;
  ctx.beginPath();
  ctx.arc(553, 500, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Katman 2: Derinlik Sıralı Varlıklar ve Karakter (Y-Sorting)
 */
export function renderSultanhaniEntities(
  ctx: CanvasRenderingContext2D,
  player: PlayerCharacter,
  width?: number,
  height?: number,
) {
  void width;
  void height;

  // Karakter sınıftaki çiziciyle doğrudan render edilir
  // Y-sorting: Karakterin ayak tabanı (player.y + 18)
  drawCharacter(ctx, player);
}

/**
 * Katman 3: Ön Plan ve Atmosferik Aydınlatma (Kapı kemeri ön yüzü, güneş ışığı)
 */
export function renderSultanhaniForeground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  player?: PlayerCharacter,
) {
  // 1. Karakter taç kapı açıklığından içeri girdiğinde (y < 585):
  // Açıklığın üst kemerinin karakterin önünde kalarak derinlik hissi vermesi
  if (player && player.y + 18 < 585 && player.x >= 512 && player.x <= 594) {
    ctx.save();
    // Portal kemer üst çerçeve gölgesi
    const archShadow = ctx.createLinearGradient(0, 470, 0, 520);
    archShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    archShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = archShadow;
    ctx.fillRect(518, 470, 70, 50);

    // Kervansaray içine giriş bildirim rozeti
    if (player.y <= 555) {
      ctx.save();
      const badgeX = 553;
      const badgeY = 460;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';

      // Rozet arka planı
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      const text = '🏛️ Selçuklu Taç Kapısı Geçildi — Kervansaray Koridoru';
      const textMetrics = ctx.measureText(text);
      const padX = 14;
      const padY = 6;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(
          badgeX - textMetrics.width / 2 - padX,
          badgeY - 14 - padY,
          textMetrics.width + padX * 2,
          28,
          14,
        );
      } else {
        ctx.rect(
          badgeX - textMetrics.width / 2 - padX,
          badgeY - 14 - padY,
          textMetrics.width + padX * 2,
          28,
        );
      }
      ctx.fill();
      ctx.stroke();

      // Rozet metni
      ctx.fillStyle = '#fef3c7';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }
    ctx.restore();
  }

  // 2. Sabah güneşi sıcak ambiyansı ve hafif ışık süzülmesi
  ctx.save();
  const sunBeamGrad = ctx.createLinearGradient(0, 0, width, height);
  sunBeamGrad.addColorStop(0, 'rgba(254, 243, 199, 0.08)');
  sunBeamGrad.addColorStop(0.4, 'rgba(253, 230, 138, 0.03)');
  sunBeamGrad.addColorStop(1, 'rgba(15, 23, 42, 0.08)');
  ctx.fillStyle = sunBeamGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
