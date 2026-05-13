import { expect, test } from '@playwright/test'

test('app shell renders communities entry points', async ({ page }) => {
  await page.goto('/communities')

  await expect(page.getByRole('heading', { name: 'Find the right space' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible()
})

test('auth entry routes render expected headings', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()

  await page.goto('/register')
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

  await page.goto('/forgot-password')
  await expect(page.getByRole('heading', { name: 'Request a reset' })).toBeVisible()
})
