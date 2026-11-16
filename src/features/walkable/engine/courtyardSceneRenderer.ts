/**
 * Yürünebilir Kampüs Avlusu (Courtyard) Görsel Sahne Çizici — Aşama 4 Görsel Dönüşümü.
 * 2,5B Anadolu–Selçuklu mimari kimliğini animasyon filmi estetiği, katmanlı derinlik,
 * zarif ışık-gölge dengesi, su parıltısı ve çevre salınımı ile buluşturur.
 *
 * ÖNEMLİ KURAL:
 * Yürünebilir yollar, bina çarpışma sınırları (AABB) ve kapı koordinatları
 * mevcut motor ve testlerle %100 uyumlu olarak korunmuştur.
 */

export function renderCourtyardBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();

  // 1. ZEMİN (Katmanlı Sıcak Taş Meydan & Bahçe Dokusu)
  drawCourtyardGround(ctx, width, height);

  // 2. ARKA PLAN SINIR DUVARLARI (Selçuklu Taş Kemerli Surlar & Mazgallar)
  drawPerimeterWall(ctx, width);

  // 3. MERKEZ SEKİZ KÖŞELİ YILDIZ MEYDANI VE ŞADIRVAN (Havuz / Fıskiye)
  const centerX = width / 2; // 700
  const centerY = height / 2 + 30; // 480
  drawCentralStarPlaza(ctx, centerX, centerY, now);

  // 4. TAŞ DÖŞELİ BAĞLANTI YOLLARI (5 Ana Rota)
  drawStonePathways(ctx, centerX, centerY);

  // 5. MİMARİ YAPILAR VE BİNALAR
  // A. İngilizce Dünyası (Kuzeydoğu — Turkuaz Çinili Anıtsal Taç Kapılı Mektep)
  drawEnglishBuilding(ctx, 860, 140, 220, 180, now);

  // B. Gezi ve Keşif (Kuzeybatı — Pişmiş Toprak / Tuğla Kubbeli Medrese)
  drawDiscoveryBuilding(ctx, 180, 140, 220, 180);

  // C. Kitap ve Hikâye Dünyası (Kuzey Merkez — Altın Kumtaşı Kütüphane Kümbeti)
  drawLibraryBuilding(ctx, 580, 100, 240, 170);

  // D. Kampüs Yolculuğum (Güneybatı — Adaçayı Yeşili Kemerli Selçuklu Köşkü)
  drawJourneyPavilion(ctx, 220, 560, 190, 140);

  // E. Keşif Görevleri Panosu (Güneydoğu — Tarihi Kitabe & Pano Köşkü)
  drawMissionsKiosk(ctx, 910, 560, 190, 140);

  // 6. PEYZAJ UNSURLARI (Ağaçlar, Oturma Bankları, Çiçek Tarhları, Selçuklu Sokak Kandilleri)
  drawCourtyardLandscape(ctx, now);
}

/**
 * Zemin: Sıcak taş plaka dokusu ve yumuşak vinyet / ışık süzülmesi.
 */
function drawCourtyardGround(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Ana zemin degrade geçişi
  const groundGrad = ctx.createRadialGradient(
    width / 2,
    height / 2 + 30,
    120,
    width / 2,
    height / 2 + 30,
    width * 0.7,
  );
  groundGrad.addColorStop(0, '#f5edd9'); // Merkez aydınlık kumtaşı
  groundGrad.addColorStop(0.6, '#ede2cb'); // Yumuşak geçiş
  groundGrad.addColorStop(1, '#dfd2b5'); // Kenarlara doğru gölgeli taş

  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, 0, width, height);

  // Taş plaka çizgileri (Hafif, göz yormayan geometrik avlu ızgarası)
  ctx.strokeStyle = 'rgba(190, 176, 148, 0.35)';
  ctx.lineWidth = 1;

  for (let x = 40; x < width; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 80; y < height; y += 70) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Arka Plan Sınır Duvarı: Selçuklu sur kemerleri, mazgal dişleri ve gölgeli derinlik.
 */
function drawPerimeterWall(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();

  // Sur ana gövdesi
  ctx.fillStyle = '#b7a88b';
  ctx.fillRect(0, 0, width, 58);

  // Sur alt gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.15)';
  ctx.fillRect(0, 58, width, 8);

  // Mazgal kemerleri
  ctx.fillStyle = '#9e8d6e';
  ctx.strokeStyle = '#827153';
  ctx.lineWidth = 1.5;

  for (let x = 0; x < width; x += 44) {
    // Mazgal dişi
    ctx.fillRect(x + 6, 0, 32, 14);

    // Kemer oyuğu
    ctx.beginPath();
    ctx.arc(x + 22, 58, 16, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Kemer içi taş örgü çizgisi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x + 22, 58, 12, Math.PI, 0);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Merkez Sekiz Köşeli Selçuklu Yıldız Meydanı ve Şadırvan Havuzu.
 */
function drawCentralStarPlaza(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  now: number,
) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Dış Mermer Halka ve Taş Bordür
  ctx.beginPath();
  ctx.arc(0, 0, 168, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.08)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 162, 0, Math.PI * 2);
  ctx.fillStyle = '#faf5e8';
  ctx.fill();
  ctx.strokeStyle = '#cbb898';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Dış bordür geometrik noktaları
  ctx.fillStyle = '#0e768a';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const bx = Math.cos(a) * 153;
    const by = Math.sin(a) * 153;
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Selçuklu Sekiz Köşeli Yıldız Taş Deseni (İki kare 45 derece dönük)
  ctx.fillStyle = '#eae0cb';
  ctx.strokeStyle = '#bda888';
  ctx.lineWidth = 2;

  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-88, -88, 176, 176);
    ctx.strokeRect(-88, -88, 176, 176);
    ctx.restore();
  }

  // Yıldız İç Kademesi (Turkuaz Taş Mozaik)
  ctx.fillStyle = '#e2f0f2';
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-62, -62, 124, 124);
    ctx.restore();
  }

  // 3. Merkez Mermer Şadırvan / Havuz Kaidesi
  // Havuz dış gölgesi
  ctx.beginPath();
  ctx.arc(0, 3, 49, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.fill();

  // Havuz mermer haznesi
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  const poolRimGrad = ctx.createLinearGradient(-48, -48, 48, 48);
  poolRimGrad.addColorStop(0, '#ffffff');
  poolRimGrad.addColorStop(1, '#c5b597');
  ctx.fillStyle = poolRimGrad;
  ctx.fill();
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Havuz İçi Berrak Su (Turkuaz derinlik)
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  const waterGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 38);
  waterGrad.addColorStop(0, '#4fc3d9');
  waterGrad.addColorStop(0.7, '#1b8b9f');
  waterGrad.addColorStop(1, '#0c5c6b');
  ctx.fillStyle = waterGrad;
  ctx.fill();

  // Su Parıltısı ve Dalgalanma Animasyonu (Water Shimmer)
  const wave1 = Math.sin(now / 480) * 2;
  const wave2 = Math.cos(now / 360) * 1.5;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 24 + wave1, 0.3, Math.PI * 1.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 15 + wave2, Math.PI * 0.8, Math.PI * 1.9);
  ctx.stroke();

  // Merkez Fıskiye Mermer Göbeği ve Işıltı
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * 5 Ana Yürüyüş Yolu: Dokulu kesme taş döşeme ve kumtaşı bordürler.
 */
function drawStonePathways(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const paths = [
    { x: 300, y: 310 }, // Gezi ve Keşif
    { x: 700, y: 270 }, // Kitap Dünyası
    { x: 960, y: 340 }, // İngilizce Dünyası
    { x: 340, y: 640 }, // Yolculuğum
    { x: 980, y: 640 }, // Görev Panosu
  ];

  ctx.save();
  ctx.lineCap = 'round';

  // 1. Yol Alt Tabanı (Gölge & Kenar Bordürü)
  ctx.strokeStyle = '#c7b494';
  ctx.lineWidth = 46;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // 2. Yol Üst Taş Kaplaması (Sıcak Kumtaşı)
  ctx.strokeStyle = '#fbf2df';
  ctx.lineWidth = 38;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // 3. Yol Yan Bordür Çizgileri
  ctx.strokeStyle = '#bca888';
  ctx.lineWidth = 2;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * A. İngilizce Dünyası Binası (860, 140, 220, 180)
 * Selçuklu mukarnaslı taç kapısı, çinili kubbe, asılı fener ve davetkâr kapı ışıltısı.
 */
function drawEnglishBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  ctx.save();

  // 1. Zemin Derinlik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 12, y + h + 10, w / 2 + 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ana Taş Gövde (Kesme taş bloklar)
  ctx.fillStyle = '#f6f0e3';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Cephe taş derz çizgileri
  ctx.strokeStyle = 'rgba(204, 185, 151, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 80);
  ctx.lineTo(x + w, y + 80);
  ctx.moveTo(x, y + 120);
  ctx.lineTo(x + w, y + 120);
  ctx.stroke();

  // 3. Selçuklu Turkuaz Çini Saçak ve Bordür
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.roundRect(x - 8, y + 32, w + 16, 20, 5);
  ctx.fill();

  // Çini üzerine altın sarısı geometrik friz
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, y + 34, w + 12, 16);

  // 4. Taç Kümbet / Kubbe (Turkuaz kabartmalı dilimli kubbe)
  ctx.fillStyle = '#0a5969';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 32, 46, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#1791a8';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 4, y + 32, 42, Math.PI, 0);
  ctx.fill();

  // Kubbe alemi (Hilal ve yıldız tepeliği)
  ctx.fillStyle = '#d8972b';
  ctx.fillRect(x + w / 2 - 2, y - 24, 4, 12);
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 26, 5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Selçuklu Mukarnaslı Anıtsal Taç Kapı (Portal)
  const portalW = 74;
  const portalH = 92;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  // Taç kapı dış çerçeve bloğu
  ctx.fillStyle = '#eae0cb';
  ctx.beginPath();
  ctx.roundRect(portalX - 10, portalY - 18, portalW + 20, portalH + 18, 6);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Sivri Kemer (Mukarnas kemer formu)
  ctx.fillStyle = '#0e768a';
  ctx.beginPath();
  ctx.moveTo(portalX, portalY + 28);
  ctx.quadraticCurveTo(portalX + portalW / 2, portalY - 12, portalX + portalW, portalY + 28);
  ctx.lineTo(portalX + portalW, portalY + portalH);
  ctx.lineTo(portalX, portalY + portalH);
  ctx.closePath();
  ctx.fill();

  // Kapı İçi Giriş Boşluğu (Karanlık derinlik)
  ctx.fillStyle = '#0f1d30';
  ctx.beginPath();
  ctx.roundRect(portalX + 6, portalY + 12, portalW - 12, portalH - 12, [18, 18, 0, 0]);
  ctx.fill();

  // Ahşap Selçuklu kapı kanatları
  ctx.fillStyle = '#5c4532';
  ctx.fillRect(portalX + 9, portalY + 28, portalW / 2 - 10, portalH - 28);
  ctx.fillRect(portalX + portalW / 2 + 1, portalY + 28, portalW / 2 - 10, portalH - 28);

  // Kapı tokmakları
  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(portalX + portalW / 2 - 5, portalY + 54, 2.8, 0, Math.PI * 2);
  ctx.arc(portalX + portalW / 2 + 5, portalY + 54, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // 6. Etkileşimli Kapı Işıltısı (Pulsing Entry Aura)
  const pulse = Math.sin(now / 320) * 0.35 + 0.65;
  ctx.save();
  ctx.strokeStyle = `rgba(36, 154, 176, ${pulse})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.roundRect(portalX + 4, portalY + 10, portalW - 8, portalH - 10, [18, 18, 0, 0]);
  ctx.stroke();
  ctx.restore();

  // Giriş Mermer Basamağı ve Paspassı
  ctx.fillStyle = '#249ab0';
  ctx.beginPath();
  ctx.roundRect(portalX - 4, portalY + portalH - 4, portalW + 8, 8, 3);
  ctx.fill();

  // Giriş Yan Fenerleri (Selçuklu Kandilleri)
  drawLantern(ctx, portalX - 6, portalY + 22, now);
  drawLantern(ctx, portalX + portalW + 6, portalY + 22, now);

  // 7. Mimari Tabela Kartı
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x + (w - 156) / 2, y + 64, 156, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('İNGİLİZCE DÜNYASI', x + w / 2, y + 81);

  ctx.restore();
}

/**
 * B. Gezi ve Keşif Binası (180, 140, 220, 180)
 * Pişmiş toprak rengi tuğla kubbeler, kervansaray taş kapısı ve Selçuklu kemerleri.
 */
function drawDiscoveryBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  // Zemin gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 10, y + h + 10, w / 2 + 16, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f5ede0';
  ctx.strokeStyle = '#cbb898';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Pişmiş Toprak (Terracotta) Kubbe
  ctx.fillStyle = '#8f3b1e';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 36, 44, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ba5734';
  ctx.beginPath();
  ctx.arc(x + w / 2 - 3, y + 36, 40, Math.PI, 0);
  ctx.fill();

  // Çatı Saçağı
  ctx.fillStyle = '#ba5734';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 32, w + 12, 18, 4);
  ctx.fill();

  // Taç Kapı
  const portalW = 66;
  const portalH = 82;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  ctx.fillStyle = '#e5dbca';
  ctx.beginPath();
  ctx.roundRect(portalX - 6, portalY - 12, portalW + 12, portalH + 12, 5);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Kapı Boşluğu
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(portalX, portalY, portalW, portalH, [16, 16, 0, 0]);
  ctx.fill();

  // Tabela
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x + (w - 146) / 2, y + 64, 146, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#ba5734';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GEZİ VE KEŞİF', x + w / 2, y + 81);

  ctx.restore();
}

/**
 * C. Kitap ve Hikâye Dünyası Binası (580, 100, 240, 170)
 * Altın kumtaşı kümbet, sekizgen kasnak ve Selçuklu kütüphane silüeti.
 */
function drawLibraryBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 10, y + h + 8, w / 2 + 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f8f3e8';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 42, w, h - 42, 8);
  ctx.fill();
  ctx.stroke();

  // Altın Kumtaşı Kümbet Külahı (Piramidal Selçuklu Çatısı)
  ctx.fillStyle = '#7a4e10';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 18);
  ctx.lineTo(x + w / 2 + 55, y + 36);
  ctx.lineTo(x + w / 2 - 55, y + 36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b88126';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 18);
  ctx.lineTo(x + w / 2 + 48, y + 36);
  ctx.lineTo(x + w / 2 - 48, y + 36);
  ctx.closePath();
  ctx.fill();

  // Saçak
  ctx.fillStyle = '#a66414';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 32, w + 12, 18, 4);
  ctx.fill();

  // Taç Kapı
  const portalW = 70;
  const portalH = 82;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  ctx.fillStyle = '#eae0cb';
  ctx.beginPath();
  ctx.roundRect(portalX - 6, portalY - 12, portalW + 12, portalH + 12, 5);
  ctx.fill();
  ctx.strokeStyle = '#bfa888';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(portalX, portalY, portalW, portalH, [16, 16, 0, 0]);
  ctx.fill();

  // Tabela
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x + (w - 180) / 2, y + 64, 180, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#a66414';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KİTAP VE HİKÂYE DÜNYASI', x + w / 2, y + 81);

  ctx.restore();
}

/**
 * D. Kampüs Yolculuğum Köşkü (220, 560, 190, 140)
 */
function drawJourneyPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f9f6ed';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 26, w, h - 26, 8);
  ctx.fill();
  ctx.stroke();

  // Adaçayı Yeşili Çatı
  ctx.fillStyle = '#21573c';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 18, w + 12, 16, 4);
  ctx.fill();

  // Kemerli Revaklar
  ctx.fillStyle = '#172b47';
  for (let i = 0; i < 3; i++) {
    const rx = x + 16 + i * 56;
    ctx.beginPath();
    ctx.roundRect(rx, y + 54, 44, h - 56, [14, 14, 0, 0]);
    ctx.fill();
  }

  // Tabela
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x + (w - 146) / 2, y + 26, 146, 22, 5);
  ctx.fill();
  ctx.strokeStyle = '#2d7350';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KAMPÜS YOLCULUĞUM', x + w / 2, y + 41);

  ctx.restore();
}

/**
 * E. Keşif Görevleri Panosu (910, 560, 190, 140)
 */
function drawMissionsKiosk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.save();

  // Gölge
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 12, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f9f6ed';
  ctx.strokeStyle = '#ccb997';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 26, w, h - 26, 8);
  ctx.fill();
  ctx.stroke();

  // Lacivert Selçuklu Saçağı
  ctx.fillStyle = '#1b3152';
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 18, w + 12, 16, 4);
  ctx.fill();

  // Ahşap Görev Bülten Panoları
  ctx.fillStyle = '#8f6843';
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 52, w - 28, h - 58, 4);
  ctx.fill();

  // Pano İçi Parşömen Notlar
  ctx.fillStyle = '#fcf8ec';
  ctx.fillRect(x + 22, y + 58, 44, 52);
  ctx.fillRect(x + 74, y + 58, 44, 52);
  ctx.fillRect(x + 126, y + 58, 44, 52);

  // Minik rozetler
  ctx.fillStyle = '#d8972b';
  ctx.fillRect(x + 40, y + 54, 8, 4);
  ctx.fillRect(x + 92, y + 54, 8, 4);
  ctx.fillRect(x + 144, y + 54, 8, 4);

  // Tabela
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(x + (w - 140) / 2, y + 26, 140, 22, 5);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GÖREV PANOSU', x + w / 2, y + 41);

  ctx.restore();
}

/**
 * Peyzaj Unsurları: Çok katmanlı gölgeli ağaçlar, bahçe bankları ve çiçekler.
 */
function drawCourtyardLandscape(ctx: CanvasRenderingContext2D, now: number) {
  // Ağaçlar (Koordinatlar mevcut çarpışma düzeniyle tam uyumludur)
  const trees = [
    { x: 120, y: 380, scale: 1 },
    { x: 120, y: 520, scale: 0.95 },
    { x: 500, y: 290, scale: 0.9 },
    { x: 1240, y: 380, scale: 1 },
    { x: 1240, y: 540, scale: 0.95 },
    { x: 700, y: 760, scale: 1.05 },
  ];

  for (const t of trees) {
    drawLushTree(ctx, t.x, t.y, t.scale, now);
  }

  // Bahçe Bankları (Açık dinlenme alanlarında dekoratif)
  drawGardenBench(ctx, 420, 480);
  drawGardenBench(ctx, 980, 480);

  // Renkli Çiçek Tarhları (Lavanta, adaçayı, gül hatmi)
  drawFlowerPatch(ctx, 450, 680);
  drawFlowerPatch(ctx, 880, 680);
}

/**
 * Katmanlı, gölgeli ve rüzgârda hafif salınan Selçuklu bahçe ağacı.
 */
function drawLushTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  now: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Hafif rüzgâr salınımı
  const sway = Math.sin((now + x * 5) / 1100) * 1.8;

  // 1. Zemin Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 34, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Ağaç Gövdesi ve Dallar
  ctx.fillStyle = '#54412f';
  ctx.beginPath();
  ctx.moveTo(-5, 34);
  ctx.lineTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(6, 34);
  ctx.closePath();
  ctx.fill();

  // 3. Katmanlı Yaprak Tacı (Üç kademeli zengin gölgeli taç)
  ctx.save();
  ctx.translate(sway, 0);

  // Koyu alt yaprak katmanı (Derinlik)
  ctx.fillStyle = '#17402c';
  ctx.beginPath();
  ctx.arc(0, -6, 29, 0, Math.PI * 2);
  ctx.arc(-14, 2, 22, 0, Math.PI * 2);
  ctx.arc(14, 2, 22, 0, Math.PI * 2);
  ctx.fill();

  // Orta yeşil yaprak katmanı
  ctx.fillStyle = '#21573c';
  ctx.beginPath();
  ctx.arc(0, -12, 26, 0, Math.PI * 2);
  ctx.arc(-10, -4, 20, 0, Math.PI * 2);
  ctx.arc(10, -4, 20, 0, Math.PI * 2);
  ctx.fill();

  // Açık güneş alan üst yaprak vurgusu (Sol-üst ışık)
  ctx.fillStyle = '#2f7551';
  ctx.beginPath();
  ctx.arc(-6, -18, 19, 0, Math.PI * 2);
  ctx.arc(6, -16, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Ahşap ve ferforje Selçuklu bahçe bankı.
 */
function drawGardenBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Bank gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.14)';
  ctx.beginPath();
  ctx.ellipse(x + 22, y + 16, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ahşap oturak çıtaları
  ctx.fillStyle = '#8f6843';
  ctx.beginPath();
  ctx.roundRect(x, y + 2, 44, 10, 2);
  ctx.fill();

  // Sırtlık
  ctx.fillStyle = '#735031';
  ctx.beginPath();
  ctx.roundRect(x, y - 6, 44, 7, 2);
  ctx.fill();

  // Demir döküm ayaklar
  ctx.fillStyle = '#172b47';
  ctx.fillRect(x + 4, y + 8, 3, 9);
  ctx.fillRect(x + 37, y + 8, 3, 9);

  ctx.restore();
}

/**
 * Çiçek Tarhı (Avluya renk katan küçük bitkiler).
 */
function drawFlowerPatch(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Toprak zemin
  ctx.fillStyle = '#d5c4a5';
  ctx.beginPath();
  ctx.ellipse(x, y, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Çiçek tomurcukları (Mor lavanta, turuncu hatmi)
  const colors = ['#875fad', '#d87a32', '#249ab0', '#b54838'];
  for (let i = 0; i < 6; i++) {
    const fx = x - 14 + i * 5;
    const fy = y - 4 + (i % 2) * 5;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Selçuklu Duvar / Kapı Feneri (Kandil).
 */
function drawLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  now: number,
) {
  ctx.save();

  // Askı kolu
  ctx.fillStyle = '#172b47';
  ctx.fillRect(x - 1, y - 10, 3, 10);

  // Fener camı ve sarı ışık
  const glow = Math.sin(now / 280) * 0.15 + 0.85;
  ctx.fillStyle = `rgba(252, 219, 131, ${glow})`;
  ctx.beginPath();
  ctx.roundRect(x - 4, y, 9, 12, 2);
  ctx.fill();

  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - 4, y, 9, 12);

  // Üst pirinç külah
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y - 4);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x - 5, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
