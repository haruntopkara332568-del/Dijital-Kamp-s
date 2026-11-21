import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {
  CAMPUS_BRAND,
  CAMPUS_BUILDING_NAMES,
  CAMPUS_INSCRIPTION_NAMES,
  CAMPUS_ARCHITECTURAL_INSCRIPTIONS,
} from '@/src/data/brandConfig';
import { CAMPUS_AREAS, getCampusAreaById } from '@/src/data/campusAreas';
import { CampusGateView } from '@/src/features/entrance/CampusGateView';
import { CampusTopBar } from '@/src/components/CampusTopBar';
import { CampusProviders } from '@/src/app/CampusProviders';

describe('ONARIM 02 — Marka Kimliği ve Mimari Kitabeler Doğrulaması', () => {
  it('1. Merkezî marka yapılandırması (CAMPUS_BRAND) kurallarını harfiyen sağlar', () => {
    expect(CAMPUS_BRAND.name).toBe('Yeni Nesil Külliye');
    expect(CAMPUS_BRAND.subtitle).toBe('Dijital Öğrenme Kampüsü');
    expect(CAMPUS_BRAND.slogan).toBe('Geçmişin bilgeliği, geleceğin öğrenme dünyası');
    // Virgül kontrolü
    expect(CAMPUS_BRAND.slogan).toContain(',');
  });

  it('2. Kesinleşmiş bina isimleri (CAMPUS_BUILDING_NAMES) doğru tanımlanmıştır', () => {
    expect(CAMPUS_BUILDING_NAMES.english).toBe('İngilizce Öğreniyorum');
    expect(CAMPUS_BUILDING_NAMES.discovery).toBe('Hayalden Gerçeğe');
    expect(CAMPUS_BUILDING_NAMES.library).toBe('Hikâyeden Hayata');
  });

  it('3. Mimari kitabeler onaylı yazım biçimlerini korur', () => {
    expect(CAMPUS_INSCRIPTION_NAMES.brand).toBe('YENİ NESİL KÜLLİYE');
    expect(CAMPUS_INSCRIPTION_NAMES.english).toBe('İNGİLİZCE ÖĞRENİYORUM');
    expect(CAMPUS_INSCRIPTION_NAMES.discovery).toBe('HAYALDEN GERÇEĞE');
    expect(CAMPUS_INSCRIPTION_NAMES.library).toBe('Hikâyeden Hayata');
    expect(CAMPUS_ARCHITECTURAL_INSCRIPTIONS.library.join(' ')).toBe('Hikâyeden Hayata');
  });

  it('4. CAMPUS_AREAS veri modelinde teknik ID korunurken kullanıcı başlıkları yeni isimlerle güncellenmiştir', () => {
    expect(CAMPUS_AREAS.length).toBeGreaterThanOrEqual(5);

    const englishArea = getCampusAreaById('ingilizce-dunyasi');
    expect(englishArea).toBeDefined();
    expect(englishArea?.title).toBe('İngilizce Öğreniyorum');
    expect(englishArea?.shortTitle).toBe('İngilizce Öğreniyorum');
    expect(englishArea?.route).toBe('/alan/ingilizce-dunyasi');

    const discoveryArea = getCampusAreaById('gezi-ve-kesif');
    expect(discoveryArea).toBeDefined();
    expect(discoveryArea?.title).toBe('Hayalden Gerçeğe');
    expect(discoveryArea?.shortTitle).toBe('Hayalden Gerçeğe');
    expect(discoveryArea?.route).toBe('/alan/gezi-ve-kesif');

    const libraryArea = getCampusAreaById('kitap-ve-hikaye-dunyasi');
    expect(libraryArea).toBeDefined();
    expect(libraryArea?.title).toBe('Hikâyeden Hayata');
    expect(libraryArea?.shortTitle).toBe('Hikâyeden Hayata');
    expect(libraryArea?.route).toBe('/alan/kitap-ve-hikaye-dunyasi');
  });

  it('5. Ana giriş ekranı (CampusGateView) yeni marka adı, alt başlık, slogan ve mimari kitabeyi eksiksiz render eder', () => {
    render(<CampusGateView onEnterCourtyard={() => {}} />);

    // Ana başlık
    expect(screen.getByRole('heading', { level: 1, name: 'Yeni Nesil Külliye' })).toBeInTheDocument();

    // Alt başlık ve slogan metinleri
    expect(screen.getByText('Dijital Öğrenme Kampüsü', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Geçmişin bilgeliği, geleceğin öğrenme dünyası.')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: /Yeni Nesil Külliye kitabesi.*Taç Kapı/i }))
      .toHaveAttribute('src', '/assets/entrance/campus_portal_gate.jpg');
  });

  it('6. Üst menü (CampusTopBar) yeni ana marka adını tek satırlık başlık olarak gösterir', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <CampusTopBar />
        </CampusProviders>
      </MemoryRouter>,
    );

    const brandLink = screen.getByRole('link', { name: 'Yeni Nesil Külliye' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('7. Aktif kullanıcı arayüzlerinde eski "Dijital Eğitim Kampüsü" başlığı bulunmaz', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CampusProviders>
          <CampusTopBar />
        </CampusProviders>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Dijital Eğitim Kampüsü')).not.toBeInTheDocument();
  });
});
