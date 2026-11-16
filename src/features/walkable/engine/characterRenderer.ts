import type { PlayerCharacter } from '../types';
import { getStudentCharacterAtlas } from './assetLoader';

/**
 * Çocuk dostu, 3D animasyon filmi estetiğine sahip öğrenci karakteri çizici (Aşama 4.4).
 * Bağımsız Sprite Atlas (character_student_atlas.png) üzerinden 4 yönlü (ön, arka, sol, sağ)
 * ve 4 kareli yürüyüş/bekleme döngüsüyle yüksek kaliteli Pixar/Disney estetiğinde çizilir.
 * Görsel yüklenene kadar veya test ortamlarında geriye dönük vektörel çizim yedeği devreye girer.
 */
export function drawCharacter(ctx: CanvasRenderingContext2D, player: PlayerCharacter) {
  const { x, y, direction, state, walkFrame } = player;

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();
  const isWalking = state === 'walk';

  // 1. Yeni 2,5B Sinematik Sprite Atlas Entegrasyonu (Aşama 4.4)
  const atlas = getStudentCharacterAtlas();
  if (atlas) {
    ctx.save();
    ctx.translate(x, y);

    // Zemin Gölgeleri (Katmanlı temas ve ortam gölgesi)
    // Dış yumuşak gölge
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(23, 43, 71, 0.14)';
    ctx.fill();

    // İç koyu temas gölgesi (Ayakların tam altına basma hissi verir)
    ctx.beginPath();
    ctx.ellipse(0, 18, 10, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(23, 43, 71, 0.32)';
    ctx.fill();

    // Yön ve Animasyon Karesi Hesaplama (Sprite Atlas: 4 kolon x 4 satır, hücre: 140x180 px)
    const CELL_W = 140;
    const CELL_H = 180;

    let row = 0; // 0: down, 1: up, 2: right, 3: left
    switch (direction) {
      case 'down':
        row = 0;
        break;
      case 'up':
        row = 1;
        break;
      case 'right':
        row = 2;
        break;
      case 'left':
        row = 3;
        break;
    }

    let col = 0; // 0: idle
    if (isWalking) {
      // Yürüyüş döngüsü: frame 1 -> frame 2 -> frame 3 -> frame 2
      const walkCycle = [1, 2, 3, 2];
      const cycleIndex = Math.floor(walkFrame * 1.2) % walkCycle.length;
      col = walkCycle[cycleIndex];
    }

    // Salınım ve Ritim (Bobbing & Sway)
    const bobY = isWalking
      ? (isReducedMotion ? 0 : Math.abs(Math.sin(walkFrame * Math.PI)) * -2.2)
      : (isReducedMotion ? 0 : Math.sin(now / 520) * 0.8);

    const swayX = isWalking && !isReducedMotion ? Math.sin(walkFrame * Math.PI) * 0.6 : 0;

    // Tuvalde Render Boyutu ve Hizalama
    // Karakterin ayak temas noktası y + 18'dir; baş yukarı uzanır.
    const renderW = 46;
    const renderH = 58;
    const renderX = -renderW / 2 + swayX;
    const renderY = 18 - renderH + 3 + bobY;

    // Sprite Atlas'tan ilgili kareyi çiz
    const srcX = col * CELL_W;
    const srcY = row * CELL_H;

    ctx.drawImage(
      atlas,
      srcX,
      srcY,
      CELL_W,
      CELL_H,
      renderX,
      renderY,
      renderW,
      renderH,
    );

    ctx.restore();
    return;
  }

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

  // Renk Paleti (Konsept Görselindeki Öğrenci: Mercan Kırmızı Ceket, Selçuklu Yıldız Rozeti, Mavi Kot, Turkuaz Sırt Çantası)
  const palette = {
    skin: '#fdf2e9',
    skinShade: '#f5dfcb',
    blush: 'rgba(239, 68, 68, 0.32)',
    hairDark: '#1e1b18',
    hairMid: '#2d241e',
    hairLight: '#42342b',
    hairTie: '#dc2626',
    jacketBase: '#dc2626', // Mercan Kırmızı Ceket / Kapüşonlu
    jacketLight: '#ef4444',
    jacketDark: '#b91c1c',
    innerShirt: '#fde047', // Güneş Sarısı İç Tişört
    goldTrim: '#d97706',
    goldStar: '#fef08a', // Selçuklu Sekiz Köşeli Yıldız Rozeti
    pants: '#2563eb', // Mavi Kot Pantolon (Denim Jeans)
    pantsFold: '#1d4ed8',
    shoes: '#dc2626', // Kırmızı Spor Ayakkabı
    shoesWhite: '#ffffff', // Beyaz Burun & Taban
    shoesSole: '#e2e8f0',
    backpack: '#0284c7', // Turkuaz / Mavi Sırt Çantası
    backpackDark: '#0369a1',
    backpackPocket: '#38bdf8',
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
 * Bacaklar ve spor ayakkabılar: Yürürken doğal ileri-geri açılma, dururken dengeli basış.
 * Konsept görselindeki mavi kot pantolon ve kırmızı-beyaz spor ayakkabıları yansıtır.
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

    // Sol bacak kot pantolon
    ctx.fillStyle = palette.pants;
    ctx.beginPath();
    ctx.roundRect(-8, 9 + (direction === 'down' ? leftOffset * 0.4 : -leftOffset * 0.4), 6, 8, [2, 2, 0, 0]);
    ctx.fill();

    // Sol ayakkabı (Kırmızı gövde, beyaz burun ve taban)
    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(-8.5, 14.5 + (direction === 'down' ? leftOffset : -leftOffset), 6.5, 4.5, 2);
    ctx.fill();
    if (direction === 'down') {
      ctx.fillStyle = palette.shoesWhite;
      ctx.fillRect(-8.5, 16.5 + leftOffset, 6.5, 1.5);
    }
    // Ayakkabı tabanı
    ctx.fillStyle = palette.shoesSole;
    ctx.fillRect(-8.5, 17.5 + (direction === 'down' ? leftOffset : -leftOffset), 6.5, 1.5);

    // Sağ bacak kot pantolon
    ctx.fillStyle = palette.pants;
    ctx.beginPath();
    ctx.roundRect(2, 9 + (direction === 'down' ? rightOffset * 0.4 : -rightOffset * 0.4), 6, 8, [2, 2, 0, 0]);
    ctx.fill();

    // Sağ ayakkabı
    ctx.fillStyle = palette.shoes;
    ctx.beginPath();
    ctx.roundRect(2, 14.5 + (direction === 'down' ? rightOffset : -rightOffset), 6.5, 4.5, 2);
    ctx.fill();
    if (direction === 'down') {
      ctx.fillStyle = palette.shoesWhite;
      ctx.fillRect(2, 16.5 + rightOffset, 6.5, 1.5);
    }
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

    // Spor ayakkabı beyaz burun kapağı
    ctx.fillStyle = palette.shoesWhite;
    const toeX = isLeft ? -4 + primaryOffset : 2 + primaryOffset;
    ctx.fillRect(toeX, 15, 2, 3);

    ctx.fillStyle = palette.shoesSole;
    ctx.fillRect(-4 + primaryOffset, 17.5, 8, 1.5);
  }

  ctx.restore();
}

/**
 * Sırt Çantası (Yalnızca 'up' yönünde gövdenin arkasında belirginleşir).
 * Turkuaz/mavi renkli çocuk okul sırt çantası.
 */
function drawBackpack(ctx: CanvasRenderingContext2D, palette: Record<string, string>) {
  ctx.save();

  // Çanta ana gövdesi
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

  // Toka ve fermuar dikişi
  ctx.fillStyle = palette.goldTrim;
  ctx.fillRect(-2, 1, 4, 3);

  ctx.restore();
}

/**
 * Gövde: Mercan Kırmızı Ceket / Kapüşonlu, Güneş Sarısı İç Tişört ve Selçuklu Yıldız Rozeti.
 */
function drawTorso(
  ctx: CanvasRenderingContext2D,
  direction: string,
  _armSwing: number,
  palette: Record<string, string>,
) {
  ctx.save();

  // 1. Sarı İç Tişört Tabanı
  ctx.fillStyle = palette.innerShirt;
  ctx.beginPath();
  ctx.roundRect(-8.5, -4, 17, 14, 4);
  ctx.fill();

  // 2. Mercan Kırmızı Ceket Ana Gövdesi
  ctx.fillStyle = palette.jacketBase;
  ctx.beginPath();
  ctx.roundRect(-9.5, -3, 19, 14.5, 4);
  ctx.fill();

  // Sol-üst Işık Vurgusu (Hacim ve derinlik katar)
  ctx.fillStyle = palette.jacketLight;
  ctx.fillRect(-8.5, -2, 4, 12);

  // Kapüşon Omuz Kıvrımı
  ctx.fillStyle = palette.jacketDark;
  ctx.beginPath();
  ctx.roundRect(-9, -4.5, 18, 3.5, [2, 2, 0, 0]);
  ctx.fill();

  // Ceket Ön Süslemeleri
  if (direction === 'down') {
    // İç tişört V yakası
    ctx.fillStyle = palette.innerShirt;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-4, -3);
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fill();

    // Ceket fermuar ve kenar çizgileri
    ctx.strokeStyle = palette.jacketDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.lineTo(0, 4);
    ctx.lineTo(4, -3);
    ctx.stroke();

    // Fermuar hattı
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 11);
    ctx.stroke();

    // Göğüste Selçuklu Sekiz Köşeli Yıldız Rozeti
    ctx.save();
    ctx.translate(-4.5, 4.5);
    ctx.fillStyle = palette.goldTrim;
    for (let i = 0; i < 2; i++) {
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-1.8, -1.8, 3.6, 3.6);
    }
    ctx.fillStyle = palette.goldStar;
    for (let i = 0; i < 2; i++) {
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
    }
    ctx.restore();

    // Kemer çizgisi
    ctx.fillStyle = palette.pantsFold;
    ctx.fillRect(-9, 10, 18, 2);
  } else if (direction === 'left' || direction === 'right') {
    // Yan görünüm ceket fermuar ayrımı
    ctx.fillStyle = palette.jacketDark;
    const splitX = direction === 'left' ? -2 : 2;
    ctx.fillRect(splitX, -3, 2, 14);

    // Yan çanta askısı (Mavi/turkuaz)
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
    ctx.fillStyle = palette.jacketBase;
    ctx.beginPath();
    ctx.roundRect(-13.5, -2 + leftArmY, 4.5, 11, 2.5);
    ctx.fill();

    // Sol kol manşet ışığı
    ctx.fillStyle = palette.jacketLight;
    ctx.fillRect(-13.5, 7 + leftArmY, 4.5, 1.5);

    // Sol el (Ten)
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(-11.2, 9.5 + leftArmY, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Sağ kol
    const rightArmY = armSwing * 0.35;
    ctx.fillStyle = palette.jacketBase;
    ctx.beginPath();
    ctx.roundRect(9, -2 + rightArmY, 4.5, 11, 2.5);
    ctx.fill();

    // Sağ kol manşet ışığı
    ctx.fillStyle = palette.jacketLight;
    ctx.fillRect(9, 7 + rightArmY, 4.5, 1.5);

    // Sağ el (Ten)
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.arc(11.2, 9.5 + rightArmY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Yan görünümde tek kol salınımı
    const isLeft = direction === 'left';
    const armX = isLeft ? -7 : 2.5;

    ctx.fillStyle = palette.jacketBase;
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
 * Kafa, saç modeli, konsept görselindeki iki yandan atkuyruklu/örgü saçlar,
 * şık gözler, yanak allığı ve canlı mimik.
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

  // 3. Saç Katmanları, İki Yandan Örgüler/Atkuyrukları ve Yüz İfadesi
  if (direction === 'down') {
    // İki Yandan Sarkan Sevimli Örgüler / Atkuyrukları (Sol & Sağ)
    // Sol Atkuyruğu
    ctx.fillStyle = palette.hairTie;
    ctx.beginPath();
    ctx.roundRect(-12.5, headY + 2, 3.5, 2.5, 1);
    ctx.fill();
    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.ellipse(-12, headY + 8, 3.2, 5.2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.hairMid;
    ctx.beginPath();
    ctx.ellipse(-12, headY + 7, 2, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Sağ Atkuyruğu
    ctx.fillStyle = palette.hairTie;
    ctx.beginPath();
    ctx.roundRect(9, headY + 2, 3.5, 2.5, 1);
    ctx.fill();
    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.ellipse(12, headY + 8, 3.2, 5.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.hairMid;
    ctx.beginPath();
    ctx.ellipse(12, headY + 7, 2, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

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
    // İki Yandan Atkuyrukları (Arka Görünüm)
    ctx.fillStyle = palette.hairTie;
    ctx.beginPath();
    ctx.roundRect(-12.5, headY + 2, 3.5, 2.5, 1);
    ctx.roundRect(9, headY + 2, 3.5, 2.5, 1);
    ctx.fill();

    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.ellipse(-12, headY + 8, 3.2, 5.2, 0.2, 0, Math.PI * 2);
    ctx.ellipse(12, headY + 8, 3.2, 5.2, -0.2, 0, Math.PI * 2);
    ctx.fill();

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

    // Yan Atkuyruğu (Arkada sallanan pigtail)
    const pigtailX = -faceDir * 9;
    ctx.fillStyle = palette.hairTie;
    ctx.beginPath();
    ctx.roundRect(pigtailX - 1.5, headY + 2, 3, 2.5, 1);
    ctx.fill();

    ctx.fillStyle = palette.hairDark;
    ctx.beginPath();
    ctx.ellipse(pigtailX, headY + 8, 3, 5.2, -faceDir * 0.2, 0, Math.PI * 2);
    ctx.fill();

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
