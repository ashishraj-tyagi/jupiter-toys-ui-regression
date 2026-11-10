import { Money } from '../domain/Money';

export type CatalogProduct = {
  name: string;
  price: Money;
};

export const stuffedFrog: CatalogProduct = {
  name: 'Stuffed Frog',
  price: Money.fromDollars(10.99),
};

export const fluffyBunny: CatalogProduct = {
  name: 'Fluffy Bunny',
  price: Money.fromDollars(9.99),
};

export const valentineBear: CatalogProduct = {
  name: 'Valentine Bear',
  price: Money.fromDollars(14.99),
};

export const products: readonly CatalogProduct[] = [stuffedFrog, fluffyBunny, valentineBear];
