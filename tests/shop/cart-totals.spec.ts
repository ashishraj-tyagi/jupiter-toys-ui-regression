import { fluffyBunny, stuffedFrog, valentineBear, type CatalogProduct } from '../../src/data/catalog';
import { expect, test } from '../../src/fixtures/test';
import type { CartLine } from '../../src/pages/CartPage';

const order: ReadonlyArray<{ product: CatalogProduct; quantity: number }> = [
  { product: stuffedFrog, quantity: 2 },
  { product: fluffyBunny, quantity: 5 },
  { product: valentineBear, quantity: 3 },
];

test('each cart line price and subtotal add up to the total', async ({ home, shop, cart }) => {
  await home.open();
  await shop.open();

  for (const item of order) {
    await shop.buy(item.product.name, item.quantity);
  }

  await cart.open();
  const lines = await cart.lines();
  expect(lines).toHaveLength(order.length);

  for (const item of order) {
    const line = lineFor(lines, item.product.name);
    expect(line.quantity).toBe(item.quantity);
    expect(line.price.format()).toBe(item.product.price.format());
    expect(line.subtotal.format()).toBe(item.product.price.multiply(item.quantity).format());
  }

  const subtotalSum = lines.map((line) => line.subtotal).reduce((sum, subtotal) => sum.add(subtotal));
  expect((await cart.total()).format()).toBe(subtotalSum.format());
});

function lineFor(lines: readonly CartLine[], productName: string): CartLine {
  const line = lines.find((entry) => entry.name.includes(productName));
  expect(line, productName).toBeDefined();
  return line as CartLine;
}
