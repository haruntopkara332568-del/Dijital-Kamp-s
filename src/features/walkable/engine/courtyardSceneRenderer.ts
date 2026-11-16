/**
 * Yürünebilir Kampüs Avlusu zemin, yol, binalar ve peyzaj çizimi.
 * 2,5B Anadolu–Selçuklu mimari tarzı ve tasarım sistemi renk belirteçleriyle uyumludur.
 */
export function renderCourtyardBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  // 1. Zemin (Taş-Krem Meydan Tonu)
  ctx.fillStyle = '#efe7d6'; // var(--iso-ground-base)
  ctx.fillRect(0, 0, width, height);

  // 2. Arka Plan Sınır Duvarları (Taş Örgü Kemerler)
  ctx.fillStyle = '#beb094'; // var(--stone-shade)
  ctx.fillRect(0, 0, width, 55);

  ctx.strokeStyle = '#948165';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.arc(x + 20, 55, 18, Math.PI, 0);
    ctx.stroke();
  }

  // 3. Merkez Sekiz Köşeli Yıldız Meydanı (Taş Döşeme)
  const centerX = width / 2;
  const centerY = height / 2 + 30;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Dış Halka
  ctx.beginPath();
  ctx.arc(0, 0, 160, 0, Math.PI * 2);
  ctx.fillStyle = '#f7f2e7'; // var(--iso-ground-plaza)
  ctx.fill();
  ctx.strokeStyle = '#d7cab2';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Sekiz Köşeli Selçuklu Yıldızı Taş Deseni
  ctx.fillStyle = '#e8dec9';
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.fillRect(-85, -85, 170, 170);
    ctx.restore();
  }

  // Yıldız İç Çemberi ve Havuz / Fıskiye Kaidesi
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#dcf0f3'; // var(--seljuk-teal-soft)
  ctx.fill();
  ctx.strokeStyle = '#0e768a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Fıskiye Suyu
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#249ab0';
  ctx.fill();

  ctx.restore();

  // 4. Binalara Uzanan Taş Yollar (5 Merkez Yol)
  const paths = [
    { x: 300, y: 310 }, // Gezi ve Keşif
    { x: 700, y: 270 }, // Kitap Dünyası
    { x: 960, y: 340 }, // İngilizce Dünyası
    { x: 340, y: 640 }, // Yolculuğum
    { x: 980, y: 640 }, // Görev Panosu
  ];

  ctx.strokeStyle = '#fbf0d9'; // var(--sandstone-gold-soft)
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';

  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // Yol bordür çizgileri
  ctx.strokeStyle = '#d7cab2';
  ctx.lineWidth = 2;
  for (const p of paths) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // 5. Binaların ve Görsel Yapıların Çizimi
  // A. İngilizce Dünyası (Kuzeydoğu)
  drawBuilding(
    ctx,
    860,
    140,
    220,
    190,
    'İngilizce Dünyası',
    '#0e768a', // Turkuaz çini tonu
    '#1b3152',
    true, // Giriş kapısı parlar
  );

  // B. Gezi ve Keşif (Kuzeybatı)
  drawBuilding(
    ctx,
    180,
    140,
    220,
    190,
    'Gezi ve Keşif',
    '#b25938', // Pişmiş toprak tonu
    '#8d4227',
  );

  // C. Kitap ve Hikâye Dünyası (Kuzey Merkez)
  drawBuilding(
    ctx,
    580,
    100,
    240,
    180,
    'Kitap ve Hikâye Dünyası',
    '#a66414', // Kumtaşı altın tonu
    '#87500e',
  );

  // D. Kampüs Yolculuğum (Güneybatı Köşk)
  drawPavilion(ctx, 220, 560, 190, 150, 'Kampüs Yolculuğum', '#2d7350');

  // E. Keşif Görevleri Panosu (Güneydoğu Taş Pano)
  drawStoneKiosk(ctx, 910, 560, 190, 150, 'Görev Panosu', '#1b3152');

  // 6. Peyzaj Unsurları: Ağaçlar
  const trees = [
    { x: 120, y: 380 },
    { x: 120, y: 520 },
    { x: 500, y: 290 },
    { x: 1240, y: 380 },
    { x: 1240, y: 540 },
    { x: 700, y: 760 },
  ];

  for (const t of trees) {
    drawTree(ctx, t.x, t.y);
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  accentColor: string,
  shadeColor: string,
  isInteractiveTarget: boolean = false,
) {
  // Bina gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + 10, y + h + 8, w / 2 + 15, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ana Gövde
  ctx.fillStyle = '#f5efe2'; // Taş rengi
  ctx.strokeStyle = '#d7cab2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y + 40, w, h - 40, 8);
  ctx.fill();
  ctx.stroke();

  // Çatı Saçağı / Kemer Süslemesi
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(x - 6, y + 32, w + 12, 18, 4);
  ctx.fill();

  // Kubbe / Taç Kümbet
  ctx.fillStyle = shadeColor;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 32, 40, Math.PI, 0);
  ctx.fill();

  // Selçuklu Taç Kapı (Portal)
  const portalW = 60;
  const portalH = 80;
  const portalX = x + (w - portalW) / 2;
  const portalY = y + h - portalH;

  ctx.fillStyle = '#e8dec9';
  ctx.beginPath();
  ctx.roundRect(portalX - 8, portalY - 14, portalW + 16, portalH + 14, 6);
  ctx.fill();
  ctx.strokeStyle = '#beb094';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Kapı Giriş Boşluğu
  ctx.fillStyle = isInteractiveTarget ? '#14253e' : '#172b47';
  ctx.beginPath();
  ctx.roundRect(portalX, portalY, portalW, portalH, [18, 18, 0, 0]);
  ctx.fill();

  // Eğer etkileşimli hedef ise (İngilizce Dünyası Girişi) parıltı efekti
  if (isInteractiveTarget) {
    ctx.strokeStyle = '#249ab0';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Giriş paspası / basamağı
    ctx.fillStyle = '#249ab0';
    ctx.fillRect(portalX - 4, portalY + portalH - 4, portalW + 8, 8);
  }

  // Tabela / Başlık Kartı
  ctx.fillStyle = '#1b3152';
  ctx.beginPath();
  ctx.roundRect(x + (w - 150) / 2, y + 60, 150, 24, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 76);
}

function drawPavilion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  accentColor: string,
) {
  // Köşk gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 5, w / 2 + 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f7f2e7';
  ctx.strokeStyle = '#d7cab2';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 25, w, h - 25, 8);
  ctx.fill();
  ctx.stroke();

  // Kemerli Revaklar
  ctx.fillStyle = accentColor;
  ctx.fillRect(x - 4, y + 18, w + 8, 12);

  // Tabela
  ctx.fillStyle = '#1b3152';
  ctx.beginPath();
  ctx.roundRect(x + (w - 130) / 2, y + 40, 130, 22, 5);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 55);
}

function drawStoneKiosk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  accentColor: string,
) {
  // Kiosk gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 5, w / 2 + 10, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#f7f2e7';
  ctx.strokeStyle = '#d7cab2';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y + 25, w, h - 25, 8);
  ctx.fill();
  ctx.stroke();

  // Çatı
  ctx.fillStyle = accentColor;
  ctx.fillRect(x - 4, y + 18, w + 8, 12);

  // Tabela
  ctx.fillStyle = '#1b3152';
  ctx.beginPath();
  ctx.roundRect(x + (w - 120) / 2, y + 40, 120, 22, 5);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 55);
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Ağaç gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 32, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gövde
  ctx.fillStyle = '#6b5a44';
  ctx.fillRect(x - 4, y, 8, 32);

  // Yaprak tacı (2 katmanlı Selçuklu bahçe çamı)
  ctx.fillStyle = '#21573c';
  ctx.beginPath();
  ctx.arc(x, y - 6, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2d7350';
  ctx.beginPath();
  ctx.arc(x - 4, y - 10, 20, 0, Math.PI * 2);
  ctx.fill();
}
