import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { GRADE_3_STAGE_2, GRADE_3_STAGE_2_TASKS } from '@/src/data/grade3Stage2Content';
import { GRADE_3_STAGE_3, GRADE_3_STAGE_3_TASKS } from '@/src/data/grade3Stage3Content';
import { TableStationModal } from '@/src/features/walkable/components/TableStationModal';
import { getGrade3StageTwoKey } from '@/src/services/grade3Stage2Progress';
import { getGrade3StageThreeKey } from '@/src/services/grade3Stage3Progress';
import {
  createInitialStudentState,
  getProfileStateKey,
  LOCAL_STORAGE_ACTIVE_PROFILE_KEY,
  LOCAL_STORAGE_PROFILES_KEY,
} from '@/src/services/storage';
import type { MissionStageId } from '@/src/types/campus';

const profileId = 'table-content-test';
const secondKey = getGrade3StageTwoKey(profileId);
const thirdKey = getGrade3StageThreeKey(profileId);
const stages = [
  { label: GRADE_3_STAGE_2.secondStageLabel, tables: GRADE_3_STAGE_2.tables, common: GRADE_3_STAGE_2.common },
  { label: GRADE_3_STAGE_3.stageLabel, tables: GRADE_3_STAGE_3.tables, common: GRADE_3_STAGE_3.common },
] as const;
const firstStageTitles: Record<MissionStageId, RegExp> = {
  kesfet: /1\. KEŞFET MASASI: GREETINGS/i,
  ogren: /^Etkinlik A — Dinle ve Bul$/,
  uret: /^Etkinlik A — Cümlemi Oluştur$/,
  paylas: /^Etkinlik A — Arkadaşım Ne Söylüyor\?$/,
};

function renderDesk(table: MissionStageId, unlockAll = false) {
  const now = new Date().toISOString();
  window.localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify([
    { id: profileId, alias: 'Gezgin', avatarId: 'avatar_1', selectedGrade: 3, createdAt: now, lastUsedAt: now },
  ]));
  window.localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, profileId);
  window.localStorage.setItem(getProfileStateKey(profileId), JSON.stringify({
    ...createInitialStudentState(),
    selectedGrade: 3,
  }));
  if (unlockAll) {
    window.localStorage.setItem(secondKey, JSON.stringify({
      version: 1,
      completed: Object.fromEntries(Object.values(GRADE_3_STAGE_2_TASKS).flat().map((task) => [task, true])),
    }));
    window.localStorage.setItem(thirdKey, JSON.stringify({
      version: 1,
      completed: Object.fromEntries(Object.values(GRADE_3_STAGE_3_TASKS).flat().map((task) => [task, true])),
    }));
  }
  return render(
    <MemoryRouter>
      <CampusProviders>
        <TableStationModal isOpen stage={table} onClose={vi.fn()} enableGrade3StageTwo enableGrade3StageThree />
      </CampusProviders>
    </MemoryRouter>,
  );
}

function selectStage(label: string) {
  fireEvent.click(screen.getByRole('button', { name: label }));
}

describe('İngilizce sınıfında masa içerikleri', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it.each(GRADE_3_STAGE_2.tables)('$label masası her aşamada kendi içeriğini gösterir', ({ id }) => {
    renderDesk(id, true);
    const before = [window.localStorage.getItem(secondKey), window.localStorage.getItem(thirdKey)];
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(firstStageTitles[id]);

    for (const stage of stages) {
      selectStage(stage.label);
      const heading = stage.tables.find((table) => table.id === id)?.title;
      expect(screen.getByRole('heading', { level: 3, name: heading })).toBeVisible();
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
      for (const table of stages.flatMap(({ tables }) => [...tables])) {
        if (table.title !== heading) {
          expect(screen.queryByRole('heading', { name: table.title })).not.toBeInTheDocument();
        }
      }
      expect(screen.queryByRole('navigation', { name: stage.common.tableList })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: stage.common.nextTable })).not.toBeInTheDocument();
    }

    selectStage(GRADE_3_STAGE_2.firstStageLabel);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(firstStageTitles[id]);
    for (const { tables } of stages) {
      for (const table of tables) expect(screen.queryByRole('heading', { name: table.title })).not.toBeInTheDocument();
    }
    expect([window.localStorage.getItem(secondKey), window.localStorage.getItem(thirdKey)]).toEqual(before);
  });

  it('masa kimliği bulunamadığında mevcut boş görünümü kullanır', () => {
    renderDesk('unknown-table' as MissionStageId, true);
    for (const stage of stages) {
      selectStage(stage.label);
      expect(screen.getByRole('heading', { name: stage.common.tableMenu })).toBeVisible();
      for (const table of stage.tables) {
        expect(screen.queryByRole('heading', { name: table.title })).not.toBeInTheDocument();
      }
    }
  });

  it.each(['ogren', 'uret', 'paylas'] as const)('%s önkoşulu eksikse seçilen masa kilitli kalır', (id) => {
    renderDesk(id);
    for (const stage of stages) {
      selectStage(stage.label);
      expect(screen.getByRole('heading', { name: stage.tables.find((table) => table.id === id)?.title })).toBeVisible();
      expect(screen.getByText(stage.common.locked)).toBeVisible();
      expect(screen.queryByRole('heading', { name: stage.tables[0].title })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Dinle/ })).not.toBeInTheDocument();
    }
  });
});
