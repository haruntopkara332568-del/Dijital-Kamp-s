import { expect, type Page } from '@playwright/test';

export async function finishWalkableEntry(page: Page, character = 'Ece') {
  const canvas = page.getByTestId('walkable-canvas');
  const profileStart = page.getByTestId('start-learning-btn');
  const confirm = page.getByRole('button', { name: 'Bu karakterle devam et' });

  await expect(canvas.or(profileStart).or(confirm).first()).toBeVisible({ timeout: 10000 });
  if (await profileStart.isVisible()) {
    await page.getByTestId('alias-chip-Gezgin').click();
    await page.getByTestId('grade-btn-3').click();
    await profileStart.click();
  }

  await expect(canvas.or(confirm).first()).toBeVisible({ timeout: 10000 });
  if (await confirm.isVisible()) {
    await page.getByRole('group', { name: 'Yürüyüş karakteri' }).getByText(character, { exact: true }).click();
    await expect(page.getByRole('radio', { name: character, exact: true })).toBeChecked();
    await confirm.click();
  }

  await expect(canvas).toBeVisible({ timeout: 10000 });
}
