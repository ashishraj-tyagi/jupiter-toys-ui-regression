import { expect, type Locator, type Page } from '@playwright/test';
import { Money } from '../domain/Money';
import { BasePage } from './BasePage';

export type CartLine = {
  name: string;
  price: Money;
  quantity: number;
  subtotal: Money;
};

export class CartPage extends BasePage {
  private readonly items: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('tr.cart-item');
  }

  async open(): Promise<void> {
    await this.header.goToCart();
    await expect(this.page).toHaveURL(/#\/cart/);
    await expect(this.page.locator('table.cart-items, .alert')).toBeVisible();
  }

  async lines(): Promise<CartLine[]> {
    const count = await this.items.count();
    const lines: CartLine[] = [];

    for (let index = 0; index < count; index += 1) {
      const row = this.items.nth(index);
      const cells = row.locator('td');
      lines.push({
        name: (await cells.nth(0).innerText()).replace(/\s+/g, ' ').trim(),
        price: Money.parse(await cells.nth(1).innerText()),
        quantity: await this.readQuantity(cells.nth(2)),
        subtotal: Money.parse(await cells.nth(3).innerText()),
      });
    }

    return lines;
  }

  async total(): Promise<Money> {
    return Money.parse(await this.page.locator('strong.total').innerText());
  }

  private async readQuantity(cell: Locator): Promise<number> {
    const input = cell.locator('input');
    const raw = (await input.inputValue()) || (await input.getAttribute('value')) || '';
    const quantity = Number(raw);
    if (!Number.isInteger(quantity)) {
      throw new Error(`Cannot read a quantity from "${raw}".`);
    }
    return quantity;
  }
}
