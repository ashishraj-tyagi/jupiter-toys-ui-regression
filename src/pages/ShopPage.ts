import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ShopPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.header.goToShop();
    await expect(this.page.locator('li.product').first()).toBeVisible();
  }

  async buy(productName: string, quantity: number): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Quantity for ${productName} must be a positive whole number.`);
    }

    const buyButton = this.productCard(productName).getByRole('link', { name: 'Buy', exact: true });
    await expect(buyButton).toBeVisible();

    const startingCount = Number(await this.header.cartCount.innerText());
    for (let bought = 0; bought < quantity; bought += 1) {
      await buyButton.click();
      await expect(this.header.cartCount).toHaveText(String(startingCount + bought + 1));
    }
  }

  private productCard(productName: string): Locator {
    return this.page.locator('li.product').filter({
      has: this.page.getByRole('heading', { name: productName, exact: true }),
    });
  }
}
