import { expect, test } from '@playwright/test'

function uniqueSuffix() {
  return Date.now().toString()
}

test('user can register, persist session, and create a community', async ({ page }) => {
  const suffix = uniqueSuffix()
  const email = `owner-${suffix}@example.com`
  const displayName = `Owner ${suffix}`
  const password = 'StrongPass123'
  const communityName = `Guild ${suffix}`

  await page.goto('/register')

  const registerForm = page.locator('form').first()
  await registerForm.getByLabel('Display name').fill(displayName)
  await registerForm.getByLabel('Email').fill(email)
  await registerForm.getByLabel('Password').fill(password)
  await registerForm.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByText('Account created.')).toBeVisible()
  await expect(page.getByRole('link', { name: displayName })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('link', { name: displayName })).toBeVisible()

  await page.goto('/communities')

  const communityForm = page.locator('form').first()
  await communityForm.getByLabel('Name').fill(communityName)
  await communityForm.getByLabel('Description').fill('A space to coordinate goals and progress.')
  await communityForm.getByRole('button', { name: 'Create community' }).click()

  const communityLink = page.getByRole('link', { name: communityName })
  await expect(communityLink).toBeVisible()
  await communityLink.click()

  await expect(page.getByRole('heading', { name: communityName })).toBeVisible()
})

test('owner can complete the discussion and moderation flow', async ({ page }) => {
  const newPassword = 'StrongerPass456'
  const postTitle = `Weekly planning ${uniqueSuffix()}`
  const postBody = 'Initial plan for the week with goals and blockers.'

  await page.goto('/login')

  const loginForm = page.locator('form').first()
  await loginForm.getByLabel('Email').fill('owner@pulseboard.dev')
  await loginForm.getByLabel('Password').fill('StrongPass123')
  await loginForm.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByRole('link', { name: 'Pulse Owner' })).toBeVisible()

  await page.goto('/communities/pulseboard-demo/boards/general')
  await expect(page.getByRole('heading', { name: 'general' })).toBeVisible()

  const postForm = page.locator('form').first()
  const postTitleInput = postForm.getByLabel('Title')
  const postBodyInput = postForm.getByLabel('Body')
  await postTitleInput.fill(postTitle)
  await expect(postTitleInput).toHaveValue(postTitle)
  await postBodyInput.fill(postBody)
  await expect(postBodyInput).toHaveValue(postBody)
  await postForm.getByRole('button', { name: 'Publish post' }).click()

  const postLink = page.getByRole('link', { name: postTitle })
  await expect(postLink).toBeVisible()
  await postLink.click()

  const updateForm = page.locator('form').first()
  await updateForm.getByLabel('Edit body').fill('Updated plan with clearer milestones and ownership.')
  await updateForm.getByRole('button', { name: 'Save updates' }).click()
  await expect(page.getByText('Post updated.')).toBeVisible()

  const commentForm = page.locator('form').nth(1)
  await commentForm.getByLabel('Add a comment').fill('First comment on the new discussion.')
  await commentForm.getByRole('button', { name: 'Post comment' }).click()

  await expect(page.getByText('First comment on the new discussion.')).toBeVisible()

  await page.getByRole('button', { name: /^Pin post$/ }).click()
  await expect(page.getByText('Moderation applied.')).toBeVisible()
  await expect(page.getByText('Pinned')).toBeVisible()

  await page.getByRole('button', { name: /^Lock post$/ }).click()
  await expect(page.getByText('Comments are disabled while this post is locked.')).toBeVisible()

  await page.getByRole('link', { name: 'Pulse Owner' }).click()

  const accountForm = page.locator('form').first()
  await accountForm.getByLabel('Current password').fill('StrongPass123')
  await accountForm.getByLabel('New password').fill(newPassword)
  await accountForm.getByRole('button', { name: 'Update password' }).click()
  await expect(page.getByText('Password updated.')).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible()

  await page.goto('/login')
  const reloginForm = page.locator('form').first()
  await reloginForm.getByLabel('Email').fill('owner@pulseboard.dev')
  await reloginForm.getByLabel('Password').fill(newPassword)
  await reloginForm.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByRole('link', { name: 'Pulse Owner' })).toBeVisible()
})
