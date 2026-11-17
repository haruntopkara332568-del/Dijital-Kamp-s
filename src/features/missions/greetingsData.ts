import { Sun, Moon, Hand, Clock } from 'lucide-react';

export type GreetingId = 'hello' | 'good_morning' | 'goodbye' | 'good_night';

export interface GreetingItem {
  id: GreetingId;
  english: string;
  turkish: string;
  visualTitle: string;
  visualDetail: string;
  hint: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: typeof Hand;
}

export const GREETINGS_DATA: GreetingItem[] = [
  {
    id: 'hello',
    english: 'Hello!',
    turkish: 'Merhaba!',
    visualTitle: 'Selam Veren Çocuk',
    visualDetail: 'El sallayarak neşeyle selam veriyor',
    hint: '"Hello!" arkadaşlarına günün her anında merhaba demek için kullanılır.',
    bgGradient: 'from-sky-50 to-blue-100',
    borderColor: 'border-sky-300 hover:border-sky-500',
    badgeBg: 'bg-sky-500',
    badgeText: 'text-sky-950',
    icon: Hand,
  },
  {
    id: 'good_morning',
    english: 'Good morning!',
    turkish: 'Günaydın!',
    visualTitle: 'Sabah Güneşi ve Çocuk',
    visualDetail: 'Doğan güneşle güne enerjik başlıyor',
    hint: '"Good morning!" sabahları uyanınca ve güne başlarken söylenir.',
    bgGradient: 'from-amber-50 to-yellow-100',
    borderColor: 'border-amber-300 hover:border-amber-500',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-amber-950',
    icon: Sun,
  },
  {
    id: 'goodbye',
    english: 'Goodbye!',
    turkish: 'Hoşça kal!',
    visualTitle: 'Ayrılan Çocuk',
    visualDetail: 'Okul çıkışında el sallayarak vedalaşıyor',
    hint: '"Goodbye!" bir yerden ayrılırken ve vedalaşırken söylenir.',
    bgGradient: 'from-rose-50 to-orange-100',
    borderColor: 'border-rose-300 hover:border-rose-500',
    badgeBg: 'bg-rose-500',
    badgeText: 'text-rose-950',
    icon: Clock,
  },
  {
    id: 'good_night',
    english: 'Good night!',
    turkish: 'İyi geceler!',
    visualTitle: 'Gece ve Uyuyan Çocuk',
    visualDetail: 'Hilal ay ve yıldızlar altında uyumaya hazırlanıyor',
    hint: '"Good night!" gece yatmadan önce ve iyi uykular dilemek için söylenir.',
    bgGradient: 'from-indigo-50 to-purple-100',
    borderColor: 'border-indigo-300 hover:border-indigo-500',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-indigo-950',
    icon: Moon,
  },
];
