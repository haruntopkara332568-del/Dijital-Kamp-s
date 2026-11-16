import type { PlayerCharacter } from '../types';

/**
 * Öğrenci karakterini 2,5B Anadolu–Selçuklu renk belirteçleriyle çizer.
 * Dört yönlü (ön, arka, sol, sağ) ve yürüme adım döngüsü animasyonunu içerir.
 */
export function drawCharacter(ctx: CanvasRenderingContext2D, player: PlayerCharacter) {
  const { x, y, direction, state, walkFrame } = player;

  ctx.save();
  ctx.translate(x, y);

  // Yere hafif gölge (ambient shadow)
  ctx.beginPath();
  ctx.ellipse(0, 18, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.fill();

  // Yürüme adımı için dikey salınım (bobbing)
  const isWalking = state === 'walk';
  const bobY = isWalking ? Math.sin(walkFrame * Math.PI) * 2.5 : Math.sin(Date.now() / 400) * 0.8;
  const legOffset = isWalking ? Math.sin(walkFrame * Math.PI) * 6 : 0;

  ctx.translate(0, bobY);

  // Ayaklar ve Bacaklar
  ctx.fillStyle = '#172b47'; // var(--campus-ink)

  if (direction === 'down' || direction === 'up') {
    // Sol ayak
    ctx.beginPath();
    ctx.roundRect(-7, 12 + (direction === 'down' ? legOffset : -legOffset), 5, 8, 2);
    ctx.fill();

    // Sağ ayak
    ctx.beginPath();
    ctx.roundRect(2, 12 + (direction === 'down' ? -legOffset : legOffset), 5, 8, 2);
    ctx.fill();
  } else if (direction === 'left') {
    ctx.beginPath();
    ctx.roundRect(-4 + legOffset, 12, 5, 8, 2);
    ctx.roundRect(-1 - legOffset, 12, 5, 8, 2);
    ctx.fill();
  } else if (direction === 'right') {
    ctx.beginPath();
    ctx.roundRect(-1 - legOffset, 12, 5, 8, 2);
    ctx.roundRect(-4 + legOffset, 12, 5, 8, 2);
    ctx.fill();
  }

  // Gövde (Ceket / Yelek - Selçuklu Turkuazı / Taş Mavisi)
  ctx.fillStyle = '#0e768a'; // var(--seljuk-teal)
  ctx.beginPath();
  ctx.roundRect(-9, -2, 18, 16, 4);
  ctx.fill();

  // Çanta askıları veya Selçuklu motif süslemesi
  ctx.strokeStyle = '#a66414'; // var(--sandstone-gold)
  ctx.lineWidth = 1.8;

  if (direction === 'down') {
    // Ön görünüm - yelek çizgileri ve rozet
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.lineTo(-3, 14);
    ctx.moveTo(3, -2);
    ctx.lineTo(3, 14);
    ctx.stroke();

    // Minik sekiz köşeli yıldız rozeti
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(-2, 3, 4, 4);
  } else if (direction === 'up') {
    // Arka görünüm - sırt çantası
    ctx.fillStyle = '#b25938'; // var(--terracotta)
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, 12, 3);
    ctx.fill();

    ctx.fillStyle = '#8d4227';
    ctx.beginPath();
    ctx.roundRect(-5, 2, 10, 4, 2);
    ctx.fill();
  } else if (direction === 'left') {
    // Sol yan görünüm - kol hareketi
    ctx.fillStyle = '#0b5d6d';
    ctx.beginPath();
    ctx.roundRect(-6 - legOffset * 0.4, 0, 5, 12, 2);
    ctx.fill();
  } else if (direction === 'right') {
    // Sağ yan görünüm - kol hareketi
    ctx.fillStyle = '#0b5d6d';
    ctx.beginPath();
    ctx.roundRect(1 + legOffset * 0.4, 0, 5, 12, 2);
    ctx.fill();
  }

  // Kollar (Ön ve Arka Yön için)
  if (direction === 'down' || direction === 'up') {
    ctx.fillStyle = '#0b5d6d';
    // Sol kol
    ctx.beginPath();
    ctx.roundRect(-12, 0 - legOffset * 0.4, 4, 11, 2);
    ctx.fill();

    // Sağ kol
    ctx.beginPath();
    ctx.roundRect(8, 0 + legOffset * 0.4, 4, 11, 2);
    ctx.fill();
  }

  // Baş / Kafa
  ctx.fillStyle = '#f5efe2'; // Ten rengi / taş krem
  ctx.beginPath();
  ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Saç / Başlık
  ctx.fillStyle = '#1b3152'; // var(--seljuk-navy)
  if (direction === 'down') {
    // Ön saçlar
    ctx.beginPath();
    ctx.arc(0, -13, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8.5, -13, 17, 3);

    // Gözler (Canlı, sevimli çocuk bakışı)
    ctx.fillStyle = '#172b47';
    ctx.beginPath();
    ctx.arc(-3, -10, 1.4, 0, Math.PI * 2);
    ctx.arc(3, -10, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Göz ışıltısı
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3.5, -11, 1, 1);
    ctx.fillRect(2.5, -11, 1, 1);

    // Gülümseme
    ctx.strokeStyle = '#b25938';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -7.5, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (direction === 'up') {
    // Arka saçlar tam kapatır
    ctx.beginPath();
    ctx.arc(0, -11.5, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === 'left') {
    // Sol yan saç ve göz
    ctx.beginPath();
    ctx.arc(1, -12.5, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sol göz
    ctx.fillStyle = '#172b47';
    ctx.beginPath();
    ctx.arc(-4, -10, 1.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === 'right') {
    // Sağ yan saç ve göz
    ctx.beginPath();
    ctx.arc(-1, -12.5, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sağ göz
    ctx.fillStyle = '#172b47';
    ctx.beginPath();
    ctx.arc(4, -10, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
