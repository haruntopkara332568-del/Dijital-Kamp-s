/**
 * İngilizce Dünyası Sınıfı iç mekân zemin, mobilyalar ve Akıllı Tahta çizimi.
 * Sıcak, modern ve Anadolu-Selçuklu motifleriyle uyumlu sınıf atmosferi sunar.
 */
export function renderClassroomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isSmartBoardActive: boolean,
  isSmartBoardPoweringOn: boolean,
) {
  // 1. Zemin (Sıcak Ahşap / Taş Parke Dokusu)
  ctx.fillStyle = '#f4ede1';
  ctx.fillRect(0, 0, width, height);

  // Parke karoları
  ctx.strokeStyle = '#e5dac7';
  ctx.lineWidth = 1;
  for (let y = 140; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 140);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 2. Kuzey Duvarı (Ön Duvar)
  ctx.fillStyle = '#e8dec9';
  ctx.fillRect(0, 0, width, 140);

  // Selçuklu Turkuaz Bordür Çizgisi
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(0, 130, width, 10);

  ctx.fillStyle = '#a66414';
  ctx.fillRect(0, 137, width, 3);

  // 3. Pencereler (Kemerli Işıklı Pencereler)
  drawArchedWindow(ctx, 120, 30, 80, 85);
  drawArchedWindow(ctx, 760, 30, 80, 85);

  // 4. Akıllı Tahta (Smart Board)
  const boardX = 350;
  const boardY = 25;
  const boardW = 260;
  const boardH = 120;

  // Tahta dış ahşap çerçevesi
  ctx.fillStyle = '#6b5a44';
  ctx.beginPath();
  ctx.roundRect(boardX - 8, boardY - 8, boardW + 16, boardH + 16, 8);
  ctx.fill();

  ctx.strokeStyle = '#a66414';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ekran yüzeyi
  if (isSmartBoardPoweringOn) {
    // Açılma ışık animasyonu
    const gradient = ctx.createRadialGradient(
      boardX + boardW / 2,
      boardY + boardH / 2,
      10,
      boardX + boardW / 2,
      boardY + boardH / 2,
      140,
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, '#249ab0');
    gradient.addColorStop(1, '#0e768a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 4);
    ctx.fill();

    // Açılma yazısı
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AKILLI TAHTA AÇILIYOR...', boardX + boardW / 2, boardY + boardH / 2 + 5);
  } else if (isSmartBoardActive) {
    // Açık ekran
    ctx.fillStyle = '#1b3152';
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 4);
    ctx.fill();

    // Tahta içeriği simülasyonu
    ctx.fillStyle = '#0e768a';
    ctx.fillRect(boardX + 10, boardY + 10, boardW - 20, 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DİJİTAL KAMPÜS — İNGİLİZCE DÜNYASI', boardX + boardW / 2, boardY + 25);

    ctx.fillStyle = '#fbf0d9';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Etkinlik: Kapıların Anlattığı Hikâye', boardX + boardW / 2, boardY + 65);

    ctx.fillStyle = '#249ab0';
    ctx.font = '10px sans-serif';
    ctx.fillText('Dokun veya E tuşuna basarak başlat', boardX + boardW / 2, boardY + 90);
  } else {
    // Kapalı / Bekleme Ekranı
    ctx.fillStyle = '#14253e';
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 4);
    ctx.fill();

    // Cam yansıma efekti
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(boardX, boardY);
    ctx.lineTo(boardX + boardW * 0.6, boardY);
    ctx.lineTo(boardX + boardW * 0.2, boardY + boardH);
    ctx.lineTo(boardX, boardY + boardH);
    ctx.fill();

    // Merkezde bekleme Selçuklu yıldızı ve açma çağrısı
    ctx.fillStyle = '#249ab0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AKILLI TAHTA (KAPALI)', boardX + boardW / 2, boardY + boardH / 2 - 4);

    ctx.fillStyle = '#beb094';
    ctx.font = '10px sans-serif';
    ctx.fillText('Yaklaş ve [E] ile aç', boardX + boardW / 2, boardY + boardH / 2 + 14);

    // Kırmızı güç ledi
    ctx.fillStyle = '#b25938';
    ctx.beginPath();
    ctx.arc(boardX + boardW - 14, boardY + boardH - 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Öğretmen Kürsüsü
  drawTeacherPodium(ctx, 670, 160);

  // 6. Kitaplık
  drawBookshelf(ctx, 40, 150);

  // 7. Öğrenci Sıraları
  drawStudentDesk(ctx, 190, 260, '1. Sıra (Sol)');
  drawStudentDesk(ctx, 590, 260, '1. Sıra (Sağ)');
  drawStudentDesk(ctx, 190, 390, '2. Sıra (Sol)');
  drawStudentDesk(ctx, 590, 390, '2. Sıra (Sağ)');

  // 8. Çıkış Kapısı (Güney Duvarı)
  const doorX = width / 2 - 45;
  const doorY = height - 35;
  ctx.fillStyle = '#6b5a44';
  ctx.beginPath();
  ctx.roundRect(doorX, doorY, 90, 35, [8, 8, 0, 0]);
  ctx.fill();

  ctx.strokeStyle = '#a66414';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Avluya Çıkış [E]', width / 2, doorY + 22);
}

function drawArchedWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  // Dış Kemer Çerçevesi
  ctx.fillStyle = '#dcf0f3'; // Gökyüzü ışığı
  ctx.beginPath();
  ctx.roundRect(x, y + 25, w, h - 25, [0, 0, 4, 4]);
  ctx.arc(x + w / 2, y + 25, w / 2, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = '#948165';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Kemer pencere bölmeleri
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + 35);
  ctx.lineTo(x + w, y + 35);
  ctx.stroke();
}

function drawTeacherPodium(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Masa gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.15)';
  ctx.fillRect(x + 5, y + 45, 95, 12);

  // Masa tablası
  ctx.fillStyle = '#948165';
  ctx.beginPath();
  ctx.roundRect(x, y, 100, 45, 4);
  ctx.fill();
  ctx.strokeStyle = '#6b5a44';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Defter / Kalem
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 15, y + 10, 24, 18);
  ctx.fillStyle = '#0e768a';
  ctx.fillRect(x + 45, y + 14, 14, 6);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Kitaplık gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.12)';
  ctx.fillRect(x + 4, y + 80, 52, 10);

  // Ahşap gövde
  ctx.fillStyle = '#87500e';
  ctx.beginPath();
  ctx.roundRect(x, y, 55, 80, 4);
  ctx.fill();

  // Raflar ve renkli kitaplar
  ctx.fillStyle = '#beb094';
  ctx.fillRect(x + 5, y + 24, 45, 4);
  ctx.fillRect(x + 5, y + 52, 45, 4);

  // Kitaplar
  const bookColors = ['#0e768a', '#b25938', '#2d7350', '#a66414', '#1b3152'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = bookColors[i % bookColors.length];
    ctx.fillRect(x + 8 + i * 10, y + 8, 8, 16);
    ctx.fillRect(x + 8 + i * 10, y + 36, 8, 16);
  }
}

function drawStudentDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
) {
  const w = 150;
  const h = 50;

  // Sıra gölgesi
  ctx.fillStyle = 'rgba(23, 43, 71, 0.14)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 6, w / 2 + 6, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Masa tablası
  ctx.fillStyle = '#beb094';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#948165';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Defter ve kalemlik süslemesi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 20, y + 12, 28, 24);
  ctx.fillRect(x + 95, y + 12, 28, 24);

  // Sıra etiketi
  ctx.fillStyle = '#6b5a44';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 30);
}
