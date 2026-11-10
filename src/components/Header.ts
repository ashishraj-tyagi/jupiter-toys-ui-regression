import type { Locator, Page } from '@playwright/test';

export class Header {
  readonly cartCount: Locator;

  constructor(private readonly page: Page) {
    this.cartCount = page.locator('#nav-cart .cart-count');
  }

  async goToHome(): Promise<void> {
    await this.page.locator('#nav-home a').click();
  }

  async goToShop(): Promise<void> {
    await this.page.locator('#nav-shop a').click();
  }

  async goToContact(): Promise<void> {
    await this.page.locator('#nav-contact a').click();
  }

  async goToCart(): Promise<void> {
    await this.page.locator('#nav-cart a').click();
  }
}
