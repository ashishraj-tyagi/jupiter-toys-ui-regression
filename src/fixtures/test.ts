import { test as base } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';

type FrameworkFixtures = {
  home: HomePage;
  contact: ContactPage;
  shop: ShopPage;
  cart: CartPage;
};

export const test = base.extend<FrameworkFixtures>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  contact: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  shop: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
