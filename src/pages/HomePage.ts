import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/#/home');
    await expect(this.page.getByRole('heading', { name: 'Jupiter Toys', level: 1 })).toBeVisible();
  }
}
