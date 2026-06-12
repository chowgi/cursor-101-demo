import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('mongodb backend smoke: login and view seeded discussions', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.getByLabel('Email Address').fill('admin@demo.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('/app');

  await page.getByRole('link', { name: 'Discussions', exact: true }).click();
  await page.waitForURL('/app/discussions');

  await expect(
    page.getByText('Improving new member onboarding'),
  ).toBeVisible();
  await expect(page.getByText('Sprint retrospective notes')).toBeVisible();
});
