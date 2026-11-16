/**
 * İngilizce Dünyası Sınıfı (Classroom) Görsel Sahne Çizici — Aşama 4 Görsel Dönüşümü.
 * Sıcak ahşap parke zemin, pencerelerden vuran güneş ışığı huzmeleri,
 * Selçuklu mukarnas kemerli pencereler, akıllı tahta, öğretmen kürsüsü ve sıralar.
 *
 * ÖNEMLİ KURAL:
 * Mevcut çarpışma kutuları (AABB), akıllı tahta ve çıkış kapısı etkileşim
 * koordinatları testler ve motorla %100 uyumlu olarak korunmuştur.
 */

export function renderClassroomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isSmartBoardActive: boolean,
  isSmartBoardPoweringOn: boolean,
) {
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const now = isReducedMotion ? 0 : performance.now();

  // 1. ZEMİN (Sıcak Ahşap Parke Dokusu)
  drawParquetFloor(ctx, width, height);

  // 2. KUZEY ÖN DUVARI (Ahşap Lambri, Selçuklu Çini Bordürü ve Posterler)
  drawClassroomWall(ctx, width);

  // 3. KEMERLİ AYDINLIK PENCERELER VE GÜNEŞ IŞIĞI HUZMELERİ
  drawSunlitArchedWindow(ctx, 110, 26, 88, 92, now);
  drawSunlitArchedWindow(ctx, 762, 26, 88, 92, now);

  // 4. AKILLI TAHTA (Smart Board — Sınıfın Odak Noktası)
  drawSmartBoard(
    ctx,
    350,
    25,
    260,
    120,
    isSmartBoardActive,
    isSmartBoardPoweringOn,
    now,
  );

  // 5. ÖĞRETMEN KÜRSÜSÜ VE MASASI (670, 160, 100, 50)
  drawTeacherPodium(ctx, 670, 160);

  // 6. KİTAPLIK VE MATERYAL DOLABI (40, 150, 60, 85)
  drawBookshelf(ctx, 40, 150);

  // 7. ÖĞRENCİ SIRALARI (4 Sıra Grubu)
  drawStudentDesk(ctx, 190, 260, '1. Sıra (Sol)', '#d87a32');
  drawStudentDesk(ctx, 590, 260, '1. Sıra (Sağ)', '#249ab0');
  drawStudentDesk(ctx, 190, 390, '2. Sıra (Sol)', '#2d7350');
  drawStudentDesk(ctx, 590, 390, '2. Sıra (Sağ)', '#b25938');

  // 8. AVLUYA ÇIKIŞ KAPISI (Güney Duvarı — 480, 590)
  drawExitDoor(ctx, width, height);
}

/**
 * Zemin: Sıcak lamine ahşap parke döşeme ve güneş ışığı yansıması.
 */
function drawParquetFloor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Ahşap taban
  ctx.fillStyle = '#f4ede1';
  ctx.fillRect(0, 130, width, height - 130);

  // Parke tahtaları ve derz çizgileri
  const plankH = 34;
  const plankW = 75;

  ctx.strokeStyle = '#e6dcce';
  ctx.lineWidth = 1.2;

  let row = 0;
  for (let y = 130; y < height; y += plankH) {
    row++;
    const xShift = (row % 2) * (plankW / 2);

    // Yatay parke çizgisi
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Dikey birleşim derzleri
    for (let x = -plankW + xShift; x < width + plankW; x += plankW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankH);
      ctx.stroke();
    }
  }

  // Pencerelerden zemine vuran sıcak gün ışığı huzmesi (Ambient sunlight beams)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 248, 225, 0.18)';

  // Sol pencere ışık huzmesi
  ctx.beginPath();
  ctx.moveTo(110, 118);
  ctx.lineTo(198, 118);
  ctx.lineTo(310, height);
  ctx.lineTo(150, height);
  ctx.closePath();
  ctx.fill();

  // Sağ pencere ışık huzmesi
  ctx.beginPath();
  ctx.moveTo(762, 118);
  ctx.lineTo(850, 118);
  ctx.lineTo(950, height);
  ctx.lineTo(790, height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Kuzey Ön Duvarı: Selçuklu çinili bordür, ahşap lambri ve eğitim posterleri.
 */
function drawClassroomWall(ctx: CanvasRenderingContext2D, width: number) {
  ctx.save();

  // 1. Üst Açık Krem Duvar
  ctx.fillStyle = '#eee6d5';
  ctx.fillRect(0, 0, width, 130);

  // 2. Alt Ahşap Lambri Panel
  ctx.fillStyle = '#c7b494';
  ctx.fillRect(0, 118, width, 12);

  // 3. Selçuklu Turkuaz & Altın Çini Kuşağı
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(0, 112, width, 6);

  ctx.fillStyle = '#d8972b';
  ctx.fillRect(0, 110, width, 2);

  // 4. Duvarda Asılı Eğitim Posterleri
  // Sol Poster: İngilizce Dünya Haritası
  drawWallPoster(ctx, 230, 36, 80, 58, 'World Map', '#0e768a');

  // Sağ Poster: Alfabe ve Selçuklu Motifleri
  drawWallPoster(ctx, 650, 36, 80, 58, 'Vocabulary', '#b25938');

  ctx.restore();
}

/**
 * Duvar Posteri / Eğitim Tablosu.
 */
function drawWallPoster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  accentColor: string,
) {
  ctx.save();

  // Çerçeve gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.08)';
  ctx.fillRect(x + 2, y + 2, w, h);

  // Beyaz parşömen kâğıdı
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);

  // Ahşap çıta çerçeve
  ctx.strokeStyle = '#8a6f4e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Başlık şeridi
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 2, y + 2, w - 4, 14);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8.5px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 12);

  // Çizim çizgileri (Harita veya kelime kutucukları simülasyonu)
  ctx.fillStyle = '#dfd6c4';
  ctx.fillRect(x + 8, y + 22, w - 16, 8);
  ctx.fillRect(x + 8, y + 34, w - 16, 8);
  ctx.fillRect(x + 8, y + 46, (w - 16) * 0.7, 6);

  ctx.restore();
}

/**
 * Selçuklu Kemerli Pencere: Bahçe manzarası, vitray bölmeleri ve cam parıltısı.
 */
function drawSunlitArchedWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  now: number,
) {
  ctx.save();

  // 1. Dış Kemer Taş Çerçevesi
  ctx.fillStyle = '#cfbe9f';
  ctx.beginPath();
  ctx.roundRect(x - 4, y + 28, w + 8, h - 24, [0, 0, 4, 4]);
  ctx.arc(x + w / 2, y + 28, w / 2 + 4, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#9e8b6b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Pencere İçi Manzara (Dışarıdaki mavi gökyüzü ve bahçe yeşilliği)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y + 28, w, h - 28, [0, 0, 2, 2]);
  ctx.arc(x + w / 2, y + 28, w / 2, Math.PI, 0);
  ctx.clip();

  // Gökyüzü degrade
  const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
  skyGrad.addColorStop(0, '#c7ebf2');
  skyGrad.addColorStop(0.65, '#e4f6f8');
  skyGrad.addColorStop(1, '#8bc998'); // Bahçe çimi
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h);

  // Bahçe servi ağacı silüeti
  ctx.fillStyle = '#2d7350';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h + 10, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 3. Ahşap Kemer Pencere Doğraması
  ctx.strokeStyle = '#6b5438';
  ctx.lineWidth = 2.5;

  // Dikey orta kayıt
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Yatay kemer altı kaydı
  ctx.beginPath();
  ctx.moveTo(x, y + 42);
  ctx.lineTo(x + w, y + 42);
  ctx.stroke();

  // 4. Cam Parıltısı (Canlı yansıma)
  const shimmer = Math.sin(now / 700) * 0.05 + 0.15;
  ctx.fillStyle = `rgba(255, 255, 255, ${shimmer})`;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 42);
  ctx.lineTo(x + 28, y + 10);
  ctx.lineTo(x + 36, y + 10);
  ctx.lineTo(x + 12, y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Akıllı Tahta (Smart Board): Sınıfın odak noktası, Selçuklu ahşap-metal kakma kasa,
 * akıcı açılış ışık efekti ve bekleme LED göstergesi.
 */
function drawSmartBoard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isActive: boolean,
  isPoweringOn: boolean,
  now: number,
) {
  ctx.save();

  // 1. Tahta Duvar Askı Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.22)';
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 4, w + 16, h + 16, 10);
  ctx.fill();

  // 2. Ahşap & Metal Selçuklu Çerçeve
  ctx.fillStyle = '#523e2b';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 8);
  ctx.fill();

  // Pirinç / Altın Kakma Köşe Süsleri
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(x - 8, y - 8, w + 16, h + 16);

  // 3. Ekran Yüzeyi
  if (isPoweringOn) {
    // Açılma Animasyonu: Merkezden yayılan yumuşak ışık dalgası
    const glowRad = ((now % 600) / 600) * (w / 1.5) + 20;
    const powerGrad = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      5,
      x + w / 2,
      y + h / 2,
      glowRad,
    );
    powerGrad.addColorStop(0, '#ffffff');
    powerGrad.addColorStop(0.35, '#2dc2dd');
    powerGrad.addColorStop(0.8, '#0e768a');
    powerGrad.addColorStop(1, '#093a44');

    ctx.fillStyle = powerGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Açılıyor Yazısı
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AKILLI TAHTA BAŞLATILIYOR...', x + w / 2, y + h / 2 + 5);
  } else if (isActive) {
    // Açık Ekran: Canlı Selçuklu Turkuaz Eğitim Arayüzü
    ctx.fillStyle = '#0f243c';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Üst Arayüz Başlık Çubuğu
    ctx.fillStyle = '#0e768a';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 8, w - 16, 26, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DİJİTAL EĞİTİM KAMPÜSÜ — İNGİLİZCE DÜNYASI', x + w / 2, y + 25);

    // Görev Kartı Ön İzlemesi
    ctx.fillStyle = '#172b47';
    ctx.beginPath();
    ctx.roundRect(x + 18, y + 42, w - 36, 68, 6);
    ctx.fill();
    ctx.strokeStyle = '#d8972b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fbf2df';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Etkinlik: Kapıların Anlattığı Hikâye', x + w / 2, y + 66);

    // Başlatma Çağrısı (Pulsing buton)
    const btnPulse = Math.sin(now / 350) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(36, 154, 176, ${btnPulse})`;
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 80, y + 80, 160, 22, 11);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('BAŞLATMAK İÇİN [E] TUŞUNA BAS', x + w / 2, y + 94);
  } else {
    // Bekleme / Kapalı Ekran: Karartılmış Cam Yansıması
    ctx.fillStyle = '#101a27';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Çapraz Cam Yansıma Efekti
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.55, y);
    ctx.lineTo(x + w * 0.25, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Merkez Selçuklu Yıldız Arması
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 - 12);
    ctx.fillStyle = 'rgba(14, 118, 138, 0.4)';
    for (let i = 0; i < 2; i++) {
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-12, -12, 24, 24);
    }
    ctx.restore();

    ctx.fillStyle = '#249ab0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ETKİLEŞİMLİ AKILLI TAHTA', x + w / 2, y + h / 2 + 14);

    ctx.fillStyle = '#bfae95';
    ctx.font = '10px sans-serif';
    ctx.fillText('Yaklaş ve [E] ile aç', x + w / 2, y + h / 2 + 30);

    // Güç LED Işığı (Nefes alan turkuaz/yeşil ışıltı)
    const ledGlow = Math.sin(now / 450) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(36, 154, 176, ${ledGlow})`;
    ctx.beginPath();
    ctx.arc(x + w - 16, y + h - 14, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Öğretmen Masası ve Kürsüsü (670, 160, 100, 50).
 */
function drawTeacherPodium(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Masa gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 42, 96, 14, 4);
  ctx.fill();

  // Masanın ahşap tablası
  ctx.fillStyle = '#9e805e';
  ctx.beginPath();
  ctx.roundRect(x, y, 100, 48, 5);
  ctx.fill();
  ctx.strokeStyle = '#6e5439';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Masa ön ahşap paneli
  ctx.fillStyle = '#826545';
  ctx.fillRect(x + 6, y + 14, 88, 30);

  // Masada dizili kitaplar ve defter
  ctx.fillStyle = '#fbf7ee';
  ctx.fillRect(x + 14, y + 8, 26, 20); // Açık defter
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(x + 50, y + 10, 18, 6); // Kalem kutusu

  // Sıcak lamba / masa lambası
  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(x + 84, y + 12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Kitaplık ve Materyal Dolabı (40, 150, 60, 85).
 */
function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();

  // Kitaplık gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.fillRect(x + 4, y + 82, 56, 10);

  // Ahşap gövde
  ctx.fillStyle = '#6b5037';
  ctx.beginPath();
  ctx.roundRect(x, y, 60, 85, 4);
  ctx.fill();
  ctx.strokeStyle = '#4a3521';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Raflar
  ctx.fillStyle = '#9e805e';
  ctx.fillRect(x + 5, y + 26, 50, 4);
  ctx.fillRect(x + 5, y + 54, 50, 4);

  // Renkli Kitap Ciltleri
  const bookColors = ['#0e768a', '#ba5734', '#21573c', '#d8972b', '#172b47'];

  // Üst raf kitapları
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bookColors[i % bookColors.length];
    ctx.fillRect(x + 8 + i * 9.5, y + 8, 7.5, 18);
  }

  // Orta raf kitapları
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = bookColors[(i + 2) % bookColors.length];
    ctx.fillRect(x + 8 + i * 9.5, y + 34, 7.5, 20);
  }

  // Alt raf: Dünya küresi
  ctx.fillStyle = '#249ab0';
  ctx.beginPath();
  ctx.arc(x + 30, y + 69, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Öğrenci Sıraları (150 x 55 px).
 */
function drawStudentDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  accentColor: string,
) {
  const w = 150;
  const h = 55;

  ctx.save();

  // 1. Sıra Derinlik Gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 8, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sandalyeler (Sıranın arkasında beliren ahşap arkalıklar)
  ctx.fillStyle = '#7a5e42';
  ctx.beginPath();
  ctx.roundRect(x + 18, y - 10, 42, 12, 3);
  ctx.roundRect(x + 90, y - 10, 42, 12, 3);
  ctx.fill();

  // 3. Masanın Ahşap Tablası
  ctx.fillStyle = '#c7b494';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#947e60';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Masa Ahşap Çıtası
  ctx.fillStyle = '#b5a181';
  ctx.fillRect(x + 6, y + 6, w - 12, 4);

  // Masada Açık Defterler ve Kalemlikler
  // Sol öğrenci defteri
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 20, y + 16, 32, 26);
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 35, y + 16, 2, 26); // Defter omurgası

  // Sağ öğrenci defteri
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 98, y + 16, 32, 26);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(x + 113, y + 16, 2, 26);

  // Sıra Etiketi
  ctx.fillStyle = '#5c4532';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 36);

  ctx.restore();
}

/**
 * Avluya Dönüş Kapısı (Güney Duvarı — width/2 - 45, height - 35).
 */
function drawExitDoor(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const doorX = width / 2 - 45;
  const doorY = height - 35;

  ctx.save();

  // Ahşap Kemerli Kapı Kasası
  ctx.fillStyle = '#5a422e';
  ctx.beginPath();
  ctx.roundRect(doorX - 4, doorY, 98, 35, [10, 10, 0, 0]);
  ctx.fill();
  ctx.strokeStyle = '#d8972b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Kapı Giriş Açıklığı
  ctx.fillStyle = '#172b47';
  ctx.beginPath();
  ctx.roundRect(doorX, doorY + 4, 90, 31, [8, 8, 0, 0]);
  ctx.fill();

  // Kapı Tokmağı
  ctx.fillStyle = '#d8972b';
  ctx.beginPath();
  ctx.arc(doorX + 38, doorY + 18, 3, 0, Math.PI * 2);
  ctx.arc(doorX + 52, doorY + 18, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tabela
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Avluya Çıkış [E]', width / 2, doorY + 24);

  ctx.restore();
}
