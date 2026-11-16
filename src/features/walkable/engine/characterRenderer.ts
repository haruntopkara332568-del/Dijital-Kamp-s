import type { PlayerCharacter } from '../types';

/**
 * Çocuk dostu, animasyon filmi estetiğine sahip öğrenci karakteri çizici.
 * 4 yönlü (ön, arka, sol, sağ), zengin yüz ifadesi, Selçuklu motifli yelek,
 * sırt çantası, doğal adım salınımı ve bekleme (idle nefes alma + göz kırpma) animasyonları içerir.
 */
export function drawCharacter(ctx: CanvasRenderingContext2D, player: PlayerCharacter) {
  const { x, y, direction, state, walkFrame } = player;

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();
  const isWalking = state === 'walk';

  // 1. Zemin Gölgeleri (Katmanlı temas ve ortam gölgesi)
  ctx.save();
  ctx.translate(x, y);

  // Dış yumuşak gölge
  ctx.beginPath();
  ctx.ellipse(0, 18, 15, 6.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.14)';
  ctx.fill();

  // İç koyu temas gölgesi (Ayakların tam altına basma hissi verir)
  ctx.beginPath();
  ctx.ellipse(0, 18, 9, 3.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.28)';
  ctx.fill();

  // 2. Animasyon Salınımları (Bobbing & Sway)
  // Yürürken ritmik gövde sekmesi; dururken nazik nefes alma salınımı
  const bobY = isWalking
    ? Math.abs(Math.sin(walkFrame * Math.PI)) * -3.2
    : Math.sin(now / 520) * 0.9;

  // Yürürken hafif omuz çalkantısı (yan salınım)
  const swayX = isWalking ? Math.sin(walkFrame * Math.PI) * 0.8 : 0;

  ctx.translate(swayX, bobY);

  // Bacak ve kol açısı salınımı
  const walkPhase = walkFrame * Math.PI;
  const legSwing = isWalking ? Math.sin(walkPhase) * 7.5 : 0;
  const armSwing = isWalking ? Math.sin(walkPhase) * 6.5 : 0;

  // Göz kırpma döngüsü (Her ~3.8 saniyede bir kısa 130ms göz kırpma)
  const isBlinking = !isWalking && now % 3800 < 130;

  // Renk Paleti (Anadolu–Selçuklu Kimliği)
  const palette = {
    skin: '#fdf3e7',
    skinShade: '#f1dfcb',
    blush: 'rgba(226, 114, 91, 0.38)',
    hairDark: '#1b2c45',
    hairMid: '#243b5c',
    hairLight: '#395782',
    vestBase: '#0e768a',
    vestLight: '#1896ae',
    vestDark: '#085361',
    shirtCollar: '#fbf7ee',
    goldTrim: '#d8972b',
    goldStar: '#f5c35b',
    pants: '#192b44',
    pantsFold: '#101e31',
    shoes: '#422f20',
    shoesSole: '#6e5138',
    backpack: '#a84c28',
    backpackDark: '#813516',
    backpackPocket: '#bf5930',
  };

  // 3. AYAKLAR VE BACAKLAR (Alt Katman)
  drawLegs(ctx, direction, legSwing, palette);

  // 4. SIRT ÇANTASI (Yalnızca 'up' yönünde gövdenin arkasında çizilir)
  if (direction === 'up') {
    drawBackpack(ctx, palette);
  }

  // 5. GÖVDE VE YELEK (Orta Katman)
  drawTorso(ctx, direction, armSwing, palette);

  // 6. KOLLAR (Ön ve Yan Yönlerde)
  drawArms(ctx, direction, armSwing, palette);

  // 7. KAFA, SAÇLAR VE SEVİMLİ YÜZ (Üst Katman)
  drawHead(ctx, direction, isBlinking, palette);

  ctx.restore();
}

/**
 * Bacaklar ve ayakkabılar: Yürürken doğal ileri-geri açılma, dururken dengeli basış.
 */
function drawLegs(
  ctx: CanvasRenderingContext2D,
  direction: string,
  legSwing: number,
  palette: Record<string, string>,
) {
  ctx.save();

  if (direction === 'down' || direction === 'up') {
    // Sol ve Sağ bacak (Ön/Arka görünüm)
    const leftOffset = legSwing;
    const rightOffset = -legSwing;

    // Sol bacak pantolon
    ctx.fillStyle = palette.pants;
    ctx.beginPath();
    ctx.roundRect(-8, 9 + (direction === 'down' ? leftOffset * 0.4 : -leftOffset * 0.4), 6, 8, [2, 2, 0, 0]);
    ctx.fill();

    // Sol ayakkabı
    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(-8.5, 14.5 + (direction === 'down' ? leftOffset : -leftOffset), 6.5, 4.5, 2);
    ctx.fill();
    // Ayakkabı tabanı
    ctx.fillStyle = palette.shoesSole;
    ctx.fillRect(-8.5, 17.5 + (direction === 'down' ? leftOffset : -leftOffset), 6.5, 1.5);

    // Sağ bacak pantolon
    ctx.fillStyle = palette.pants;
    ctx.beginPath();
    ctx.roundRect(2, 9 + (direction === 'down' ? rightOffset * 0.4 : -rightOffset * 0.4), 6, 8, [2, 2, 0, 0]);
    ctx.fill();

    // Sağ ayakkabı
    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(2, 14.5 + (direction === 'down' ? rightOffset : -rightOffset), 6.5, 4.5, 2);
    ctx.fill();
    // Ayakkabı tabanı
    ctx.fillStyle = palette.shoesSole;
    ctx.fillRect(2, 17.5 + (direction === 'down' ? rightOffset : -rightOffset), 6.5, 1.5);
  } else {
    // Yan görünüm (Sol / Sağ)
    const isLeft = direction === 'left';
    const primaryOffset = isLeft ? -legSwing : legSwing;
    const secondaryOffset = -primaryOffset;

    // Arka Bacak
    ctx.fillStyle = palette.pantsFold;
    ctx.beginPath();
    ctx.roundRect(-3 + secondaryOffset * 0.6, 9, 6, 7.5, 2);
    ctx.fill();

    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(-4 + secondaryOffset, 14.5, 7.5, 4.5, 2);
    ctx.fill();

    // Ön Bacak
    ctx.fillStyle = palette.pants;
    ctx.beginPath();
    ctx.roundRect(-3 + primaryOffset * 0.6, 9, 6, 7.5, 2);
    ctx.fill();

    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(-4 + primaryOffset, 14.5, 8, 4.5, 2);
    ctx.fill();
    ctx.fillStyle = palette.shoesSole;
    ctx.fillRect(-4 + primaryOffset, 17.5, 8, 1.5);
  }

  ctx.restore();
}

/**
 * Sırt Çantası (Yalnızca 'up' yönünde gövdenin arkasında belirginleşir).
 */
function drawBackpack(ctx: CanvasRenderingContext2D, palette: Record<string, string>) {
  ctx.save();

  // Çanta ana gövdesi (Terracotta deri)
  ctx.fillStyle = palette.backpack;
  ctx.beginPath();
  ctx.roundRect(-8, -2, 16, 14, 4);
  ctx.fill();

  // Üst kapak
  ctx.fillStyle = palette.backpackDark;
  ctx.beginPath();
  ctx.roundRect(-7, -4, 14, 6, [3, 3, 1, 1]);
  ctx.fill();

  // Ön cep
  ctx.fillStyle = palette.backpackPocket;
  ctx.beginPath();
  ctx.roundRect(-5.5, 3, 11, 7, 2);
  ctx.fill();

  // Toka ve askı dikişi (Altın sarısı pirinç)
  ctx.fillStyle = palette.goldTrim;
  ctx.fillRect(-2, 1, 4, 3);

  ctx.restore();
}

/**
 * Gövde, Selçuklu Turkuaz Yelek ve Yaka Detayları.
 */
function drawTorso(
  ctx: CanvasRenderingContext2D,
  direction: string,
  _armSwing: number,
  palette: Record<string, string>,
) {
  ctx.save();

  // 1. Beyaz Gömlek / Yaka Tabanı
  ctx.fillStyle = palette.shirtCollar;
  ctx.beginPath();
  ctx.roundRect(-8.5, -4, 17, 14, 4);
  ctx.fill();

  // 2. Selçuklu Turkuaz Yelek Ana Gövdesi
  ctx.fillStyle = palette.vestBase;
  ctx.beginPath();
  ctx.roundRect(-9.5, -3, 19, 14.5, 4);
  ctx.fill();

  // Sol-üst Işık Vurgusu (Derinlik katar)
  ctx.fillStyle = palette.vestLight;
  ctx.fillRect(-8.5, -2, 4, 12);

  // Yelek Ön Süslemeleri
  if (direction === 'down') {
    // Gömlek yaka üçgeni
    ctx.fillStyle = palette.shirtCollar;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(-4, -3);
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fill();

    // Altın sarısı yelek kenar bordürleri
    ctx.strokeStyle = palette.goldTrim;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.lineTo(0, 4);
    ctx.lineTo(4, -3);
    ctx.stroke();

    // Orta dikiş hattı
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 11);
    ctx.stroke();

    // Göğüste Minik Selçuklu Sekiz Köşeli Yıldız Rozeti
    ctx.save();
    ctx.translate(-4.5, 4.5);
    ctx.fillStyle = palette.goldStar;
    for (let i = 0; i < 2; i++) {
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
    }
    ctx.restore();

    // Kemer çizgisi
    ctx.fillStyle = palette.pantsFold;
    ctx.fillRect(-9, 10, 18, 2);
  } else if (direction === 'left' || direction === 'right') {
    // Yan görünüm yelek ayrımı
    ctx.fillStyle = palette.vestDark;
    const splitX = direction === 'left' ? -2 : 2;
    ctx.fillRect(splitX, -3, 2, 14);

    // Yan çanta askısı
    ctx.fillStyle = palette.backpack;
    ctx.fillRect(direction === 'left' ? 2 : -4, -3, 3, 14);
  }

  ctx.restore();
}

/**
 * Kollar ve Eller.
 */
function drawArms(
  ctx: CanvasRenderingContext2D,
  direction: string,
  armSwing: number,
  palette: Record<string, string>,
) {
  ctx.save();

  if (direction === 'down' || direction === 'up') {
    // Sol kol
    const leftArmY = -armSwing * 0.35;
    ctx.fillStyle = palette.vestBase;
    ctx.beginPath();
    ctx.roundRect(-13.5, -2 + leftArmY, 4.5, 11, 2.5);
    ctx.fill();

    // Sol el (Ten)
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(-11.2, 9.5 + leftArmY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Sağ kol
    const rightArmY = armSwing * 0.35;
    ctx.fillStyle = palette.vestBase;
    ctx.beginPath();
    ctx.roundRect(9, -2 + rightArmY, 4.5, 11, 2.5);
    ctx.fill();

    // Sağ el (Ten)
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(11.2, 9.5 + rightArmY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Yan görünümde tek kol salınımı
    const isLeft = direction === 'left';
    const armX = isLeft ? -7 : 2.5;

    ctx.fillStyle = palette.vestBase;
    ctx.beginPath();
    ctx.roundRect(armX + (isLeft ? -armSwing * 0.4 : armSwing * 0.4), -1, 5, 11, 2.5);
    ctx.fill();

    // El
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(armX + 2.5 + (isLeft ? -armSwing * 0.4 : armSwing * 0.4), 10.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Kafa, saç modeli, şık gözler, yanak allığı ve canlı mimik.
 */
function drawHead(
  ctx: CanvasRenderingContext2D,
  direction: string,
  isBlinking: boolean,
  palette: Record<string, string>,
) {
  ctx.save();

  const headY = -14;

  // 1. Kafa Tabanı (Ten tonu + yumuşak alt çene gölgesi)
  ctx.fillStyle = palette.skinShade;
  ctx.beginPath();
  ctx.arc(0, headY + 1, 9.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.skin;
  ctx.beginPath();
  ctx.arc(0, headY, 9.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Kulaklar (Ön ve Yan Yönlerde)
  if (direction === 'down') {
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(-9.5, headY + 1, 2.3, 0, Math.PI * 2);
    ctx.arc(9.5, headY + 1, 2.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === 'left') {
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(6.5, headY + 1, 2.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (direction === 'right') {
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(-6.5, headY + 1, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Saç Katmanları ve Yüz İfadesi
  if (direction === 'down') {
    // Saç Tabanı (Üst ve yanlar)
    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.arc(0, headY - 1.5, 10.5, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();

    // Sevimli kaküller (Ön saç tutamları)
    ctx.fillStyle = palette.hairMid;
    ctx.beginPath();
    ctx.moveTo(-9.5, headY - 4);
    ctx.quadraticCurveTo(-4, headY + 0.5, -2, headY - 3.5);
    ctx.quadraticCurveTo(2, headY + 1.2, 5, headY - 3);
    ctx.quadraticCurveTo(8, headY - 1, 9.5, headY - 4);
    ctx.lineTo(8.5, headY - 11);
    ctx.lineTo(-8.5, headY - 11);
    ctx.closePath();
    ctx.fill();

    // Üst saç ışık ışıltısı
    ctx.fillStyle = palette.hairLight;
    ctx.beginPath();
    ctx.ellipse(0, headY - 9, 6.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sevimli Yanak Pembeliği (Blush)
    ctx.fillStyle = palette.blush;
    ctx.beginPath();
    ctx.ellipse(-5.5, headY + 2.8, 2.6, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(5.5, headY + 2.8, 2.6, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gözler (Canlı, parlak çocuk bakışı veya göz kırpma)
    if (isBlinking) {
      // Göz kırparken mutlu yay çizgileri
      ctx.strokeStyle = palette.hairDark;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-3.5, headY + 0.5, 2.2, 0.2, Math.PI - 0.2);
      ctx.arc(3.5, headY + 0.5, 2.2, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Göz akı ve bebeği
      ctx.fillStyle = palette.hairDark;
      ctx.beginPath();
      ctx.ellipse(-3.5, headY - 0.2, 2.2, 2.7, 0, 0, Math.PI * 2);
      ctx.ellipse(3.5, headY - 0.2, 2.2, 2.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // İki katmanlı parıltı (Canlılık veren catchlight)
      ctx.fillStyle = '#ffffff';
      // Büyük sol-üst ışıltı
      ctx.beginPath();
      ctx.arc(-4.2, headY - 1.2, 0.9, 0, Math.PI * 2);
      ctx.arc(2.8, headY - 1.2, 0.9, 0, Math.PI * 2);
      ctx.fill();
      // Küçük sağ-alt ışıltı
      ctx.beginPath();
      ctx.arc(-2.8, headY + 0.8, 0.5, 0, Math.PI * 2);
      ctx.arc(4.2, headY + 0.8, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Kaşlar (Dost canlısı kavis)
    ctx.strokeStyle = palette.hairMid;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(-3.6, headY - 3.8, 2.2, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(3.6, headY - 3.8, 2.2, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Gülümseme (Sıcak, sevimli ağız)
    ctx.strokeStyle = '#b04933';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, headY + 3.2, 2.8, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (direction === 'up') {
    // Arka saçlar (Tam hacimli ve katmanlı)
    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.arc(0, headY - 0.5, 11, 0, Math.PI * 2);
    ctx.fill();

    // Saç bukle ve ışıltı katmanı
    ctx.fillStyle = palette.hairMid;
    ctx.beginPath();
    ctx.ellipse(0, headY - 5, 8.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.hairLight;
    ctx.beginPath();
    ctx.ellipse(0, headY - 7, 5.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Yan Profil (Sol / Sağ)
    const isLeft = direction === 'left';
    const faceDir = isLeft ? -1 : 1;

    // Saç Arka ve Üst Kısmı
    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.arc(-faceDir * 1.5, headY - 1, 10.5, 0, Math.PI * 2);
    ctx.fill();

    // Yüzün görünen ten kısmı
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(faceDir * 2.5, headY + 0.5, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Yan saç kakülü
    ctx.fillStyle = palette.hairMid;
    ctx.beginPath();
    ctx.moveTo(faceDir * 1, headY - 11);
    ctx.quadraticCurveTo(faceDir * 8, headY - 6, faceDir * 5, headY - 2);
    ctx.quadraticCurveTo(faceDir * 2, headY - 1, -faceDir * 5, headY - 4);
    ctx.closePath();
    ctx.fill();

    // Yan yanak allığı
    ctx.fillStyle = palette.blush;
    ctx.beginPath();
    ctx.ellipse(faceDir * 4, headY + 3, 2.2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yan Göz
    if (isBlinking) {
      ctx.strokeStyle = palette.hairDark;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(faceDir * 4.5, headY + 0.5, 2, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = palette.hairDark;
      ctx.beginPath();
      ctx.ellipse(faceDir * 4.5, headY - 0.2, 2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Işıltı
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(faceDir * 4, headY - 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Yan profil küçük sevimli gülümseme
    ctx.strokeStyle = '#b04933';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(faceDir * 6.5, headY + 3.5, 1.8, 0.4, Math.PI - 0.4);
    ctx.stroke();
  }

  ctx.restore();
}
