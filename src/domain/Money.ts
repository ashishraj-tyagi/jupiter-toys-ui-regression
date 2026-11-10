export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static fromDollars(dollars: number): Money {
    if (!Number.isFinite(dollars)) {
      throw new Error(`Cannot read an amount from "${dollars}".`);
    }
    return new Money(Math.round(dollars * 100));
  }

  static parse(text: string): Money {
    const match = text.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    if (!match) {
      throw new Error(`Cannot read an amount from "${text}".`);
    }

    const negative = match[0].startsWith('-');
    const [whole, fraction = ''] = (negative ? match[0].slice(1) : match[0]).split('.');
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
    return new Money(negative ? -cents : cents);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity)) {
      throw new Error(`Quantity must be a whole number, received ${quantity}.`);
    }
    return new Money(this.cents * quantity);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  format(): string {
    const negative = this.cents < 0;
    const absolute = Math.abs(this.cents);
    const dollars = Math.floor(absolute / 100);
    const cents = (absolute % 100).toString().padStart(2, '0');
    return `${negative ? '-' : ''}$${dollars}.${cents}`;
  }

  toString(): string {
    return this.format();
  }
}
