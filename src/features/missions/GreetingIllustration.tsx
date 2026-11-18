import type { GreetingId } from './greetingsData';

/**
 * 4 Özel Çocuk Dostu Kart Çizimi (SVG)
 */
export function GreetingIllustration({ id }: { id: GreetingId }) {
  if (id === 'hello') {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="skyHello" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        {/* Arka Plan Gökyüzü ve Çimenlik */}
        <rect width="200" height="160" rx="16" fill="url(#skyHello)" />
        <path d="M 0,125 Q 100,115 200,125 L 200,160 L 0,160 Z" fill="#86efac" />
        {/* Güneş Çizgisi */}
        <circle cx="170" cy="30" r="18" fill="#fde047" opacity="0.9" />

        {/* Karakter Gövdesi (Kırmızı Yelek & Tişört) */}
        <path d="M 75,160 L 80,105 Q 100,100 120,105 L 125,160 Z" fill="#ef4444" />
        <rect x="92" y="105" width="16" height="55" fill="#3b82f6" />
        {/* Sırt Çantası Askısı */}
        <path d="M 82,108 Q 72,125 78,145" stroke="#1d4ed8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 118,108 Q 128,125 122,145" stroke="#1d4ed8" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* Sol Kol (Sakin Yan Tarafta) */}
        <path d="M 78,108 Q 65,125 68,140" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="140" r="7" fill="#fed7aa" />

        {/* El Sallayan Sağ Kol */}
        <path d="M 122,108 Q 145,85 140,65" stroke="#ef4444" strokeWidth="11" strokeLinecap="round" fill="none" />
        <circle cx="140" cy="65" r="9" fill="#fed7aa" />
        {/* El Sallama Dalgaları */}
        <path d="M 148,56 Q 155,64 150,72" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 154,52 Q 163,64 156,76" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Boyun ve Baş */}
        <rect x="94" y="85" width="12" height="18" rx="3" fill="#fed7aa" />
        <circle cx="100" cy="65" r="26" fill="#fed7aa" />

        {/* Kahverengi Sevimli Saç */}
        <path d="M 74,65 Q 100,32 126,65 Q 100,48 74,65 Z" fill="#78350f" />
        <circle cx="78" cy="55" r="8" fill="#78350f" />
        <circle cx="122" cy="55" r="8" fill="#78350f" />

        {/* Yüz: Gülen Gözler ve Ağız */}
        <circle cx="92" cy="65" r="3" fill="#1e293b" />
        <circle cx="108" cy="65" r="3" fill="#1e293b" />
        <path d="M 93,76 Q 100,85 107,76" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Yanak Pembelikleri */}
        <circle cx="86" cy="72" r="4" fill="#fca5a5" opacity="0.6" />
        <circle cx="114" cy="72" r="4" fill="#fca5a5" opacity="0.6" />
      </svg>
    );
  }

  if (id === 'good_morning') {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="morningSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <rect width="200" height="160" rx="16" fill="url(#morningSky)" />

        {/* Doğan Sabah Güneşi ve Işınları */}
        <g transform="translate(100, 45)">
          <circle cx="0" cy="0" r="26" fill="#f59e0b" />
          <circle cx="0" cy="0" r="22" fill="#fde047" />
          {/* Işınlar */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="0"
              y1="-30"
              x2="0"
              y2="-38"
              stroke="#eab308"
              strokeWidth="3.5"
              strokeLinecap="round"
              transform={`rotate(${deg})`}
            />
          ))}
          {/* Güneşin Sevimli Yüzü */}
          <circle cx="-7" cy="-3" r="2" fill="#78350f" />
          <circle cx="7" cy="-3" r="2" fill="#78350f" />
          <path d="M -5,6 Q 0,11 5,6" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Sabah Tepeleri */}
        <path d="M 0,110 Q 60,90 120,115 Q 160,95 200,110 L 200,160 L 0,160 Z" fill="#86efac" />
        <path d="M 0,130 Q 100,118 200,130 L 200,160 L 0,160 Z" fill="#4ade80" />

        {/* Sabah Uyanıp Güneşi Selamlayan Çocuk */}
        <g transform="translate(100, 85)">
          {/* Kollar: İki yana açılmış enerjik karşılama */}
          <path d="M -15,22 Q -38,10 -35,-2" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="-35" cy="-2" r="6" fill="#fed7aa" />
          <path d="M 15,22 Q 38,10 35,-2" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="35" cy="-2" r="6" fill="#fed7aa" />

          {/* Gövde (Turuncu Pijama/Tişört) */}
          <path d="M -16,45 L -12,18 Q 0,14 12,18 L 16,45 Z" fill="#f97316" />

          {/* Baş */}
          <rect x="-5" y="6" width="10" height="12" rx="2" fill="#fed7aa" />
          <circle cx="0" cy="-6" r="20" fill="#fed7aa" />
          {/* Sarı/Açık Kahve Saç */}
          <path d="M -18,-6 Q 0,-30 18,-6 Q 0,-18 -18,-6 Z" fill="#b45309" />

          {/* Mutlu Gülen Yüz */}
          <circle cx="-6" cy="-6" r="2.5" fill="#1e293b" />
          <circle cx="6" cy="-6" r="2.5" fill="#1e293b" />
          <path d="M -5,3 Q 0,9 5,3" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (id === 'goodbye') {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xs" aria-hidden="true">
        <defs>
          <linearGradient id="goodbyeSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="70%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>
        <rect width="200" height="160" rx="16" fill="url(#goodbyeSky)" />

        {/* Taş Okul Yolu ve Serviler */}
        <path d="M 60,160 L 90,100 L 110,100 L 140,160 Z" fill="#e5e7eb" />
        {/* Çimenlik */}
        <path d="M 0,120 L 80,100 L 0,160 Z" fill="#86efac" />
        <path d="M 200,120 L 120,100 L 200,160 Z" fill="#86efac" />
        {/* Yol Kenarı Ağaç */}
        <rect x="25" y="70" width="8" height="40" fill="#78350f" />
        <circle cx="29" cy="65" r="20" fill="#16a34a" />

        {/* Sırt Çantasıyla Yürüyüp Geriye El Sallayan Çocuk */}
        <g transform="translate(105, 75)">
          {/* Mavi Sırt Çantası */}
          <rect x="-14" y="16" width="18" height="24" rx="4" fill="#2563eb" />
          <path d="M -10,16 L -10,36" stroke="#1d4ed8" strokeWidth="2" />

          {/* Gövde (Arkası hafif dönük yeşil mont) */}
          <path d="M -8,45 L -6,18 Q 4,16 14,18 L 16,45 Z" fill="#0d9488" />

          {/* Yürüyen Bacaklar */}
          <line x1="-2" y1="45" x2="-8" y2="65" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="8" y1="45" x2="14" y2="62" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

          {/* Geriye Dönüp El Sallayan Kol */}
          <path d="M 12,20 Q 32,5 28,-12" stroke="#0d9488" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="-12" r="5.5" fill="#fed7aa" />
          {/* El sallama efekti */}
          <path d="M 33,-18 Q 38,-10 34,-4" stroke="#f59e0b" strokeWidth="2" fill="none" />

          {/* Baş (Hafif profilden tebessüm) */}
          <rect x="0" y="8" width="8" height="10" fill="#fed7aa" />
          <circle cx="4" cy="-2" r="17" fill="#fed7aa" />
          {/* Saç */}
          <path d="M -11,-2 Q 4,-20 19,-2 Q 4,-12 -11,-2 Z" fill="#451a03" />
          {/* Gülümseyen Göz ve Ağız */}
          <circle cx="10" cy="-2" r="2.5" fill="#1e293b" />
          <path d="M 7,6 Q 11,10 14,6" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // Good night
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-xs" aria-hidden="true">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="200" height="160" rx="16" fill="url(#nightSky)" />

      {/* Pırıldayan Yıldızlar */}
      {[
        { x: 30, y: 25, r: 2 },
        { x: 70, y: 20, r: 1.5 },
        { x: 120, y: 35, r: 2.5 },
        { x: 165, y: 22, r: 1.8 },
        { x: 45, y: 65, r: 1.5 },
        { x: 175, y: 70, r: 2 },
      ].map((star, idx) => (
        <circle key={idx} cx={star.x} cy={star.y} r={star.r} fill="#fef08a" opacity="0.9" />
      ))}

      {/* Parlayan Hilal Ay */}
      <path
        d="M 155,20 A 18,18 0 1,1 140,48 A 15,15 0 0,0 155,20 Z"
        fill="#fde047"
        filter="drop-shadow(0 0 6px rgba(253, 224, 71, 0.6))"
      />

      {/* Yatak Odası Pencere Pervazı / Gece Sahnesi */}
      <rect x="0" y="125" width="200" height="35" fill="#1e1b4b" />
      <line x1="0" y1="125" x2="200" y2="125" stroke="#6366f1" strokeWidth="2" />

      {/* Gece Pijamalı ve Uyku Şapkalı Sevimli Çocuk */}
      <g transform="translate(100, 85)">
        {/* Yastık */}
        <ellipse cx="0" cy="40" rx="42" ry="14" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="2" />

        {/* Gövde (Mavi Pijama) */}
        <path d="M -18,40 L -14,14 Q 0,10 14,14 L 18,40 Z" fill="#6366f1" />
        <circle cx="0" cy="22" r="2" fill="#fde047" />
        <circle cx="0" cy="30" r="2" fill="#fde047" />

        {/* Sarıldığı Sevimli Yıldız Yastık / Ayıcık */}
        <circle cx="16" cy="32" r="10" fill="#fbcfe8" />
        <circle cx="12" cy="24" r="3" fill="#fbcfe8" />
        <circle cx="20" cy="24" r="3" fill="#fbcfe8" />

        {/* Boyun ve Baş */}
        <rect x="-5" y="4" width="10" height="10" fill="#fed7aa" />
        <circle cx="0" cy="-6" r="19" fill="#fed7aa" />

        {/* Uyku Şapkası (Yana Kıvrılan Gece Külahı) */}
        <path d="M -18,-8 Q 0,-24 20,-8 L 28,-18 Q 38,-8 28,0 Z" fill="#4f46e5" />
        <circle cx="28" cy="0" r="4.5" fill="#fde047" />

        {/* Huzurlu Kapalı Gözler ve Tatlı Gülümseme */}
        <path d="M -9,-5 Q -6,-2 -3,-5" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 3,-5 Q 6,-2 9,-5" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M -3,4 Q 0,8 3,4" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Pembe Yanak */}
        <circle cx="-10" cy="0" r="3.5" fill="#fca5a5" opacity="0.6" />
        <circle cx="10" cy="0" r="3.5" fill="#fca5a5" opacity="0.6" />
      </g>
    </svg>
  );
}
