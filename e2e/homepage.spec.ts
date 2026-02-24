import { test, expect } from '@playwright/test'

test.describe('Juntapp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up the page before each test
    await page.goto('http://localhost:3000')
  })

  test('homepage loads correctly', async ({ page }) => {
    // Check that the homepage loads
    await expect(page).toHaveTitle(/Juntapp/)

    // Check for main elements
    await expect(page.locator('text=Explora lo que pasa')).toBeVisible()
    await expect(page.locator('text=Crear Evento')).toBeVisible()
    await expect(page.locator('text=Explorar Mapa')).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    // Test navigation to map page
    await page.click('text=Explorar Mapa')
    await expect(page).toHaveURL(/.*mapa/)

    // Check that map elements are present
    await expect(page.locator('text=Filtros Avanzados')).toBeVisible()
  })

  test('search functionality works', async ({ page }) => {
    // Navigate to map page
    await page.goto('http://localhost:3000/mapa')

    // Find search input and type
    const searchInput = page.locator('input[placeholder*="Buscar eventos"]').first()
    await searchInput.fill('concierto')

    // Check that search results update (this will depend on having events in the database)
    // For now, just check that the input accepts the value
    await expect(searchInput).toHaveValue('concierto')
  })

  test('category filtering works', async ({ page }) => {
    // Navigate to map page
    await page.goto('http://localhost:3000/mapa')

    // Click on a category button
    await page.click('text=Música')

    // Check that the category is selected (button becomes default variant)
    const musicButton = page.locator('button:has-text("Música")')
    await expect(musicButton).toHaveClass(/bg-primary/)
  })

  test('event creation flow', async ({ page }) => {
    // Navigate to create event page
    await page.click('text=Crear Evento')
    await expect(page).toHaveURL(/.*crear/)

    // Check that the create form is present
    await expect(page.locator('text=Crear Nuevo Evento')).toBeVisible()
  })

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile navigation works
    await expect(page.locator('text=Explora lo que pasa')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=Explora lo que pasa')).toBeVisible()
  })

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('error handling - invalid route', async ({ page }) => {
    // Navigate to invalid route
    await page.goto('http://localhost:3000/invalid-route')

    // Should show 404 or redirect to home
    await expect(page.locator('text=Juntapp')).toBeVisible()
  })
})
