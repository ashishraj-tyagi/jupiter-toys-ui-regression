import { expect, type Locator, type Page } from '@playwright/test';
import type { ContactDetails } from '../data/contact';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  readonly forenameError: Locator;
  readonly emailError: Locator;
  readonly messageError: Locator;
  readonly errorBanner: Locator;
  readonly infoBanner: Locator;
  readonly successAlert: Locator;

  private readonly forename: Locator;
  private readonly email: Locator;
  private readonly message: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.forename = page.locator('#forename');
    this.email = page.locator('#email');
    this.message = page.locator('#message');
    this.submitButton = page.locator('a.btn-contact');
    this.forenameError = page.locator('#forename-err');
    this.emailError = page.locator('#email-err');
    this.messageError = page.locator('#message-err');
    this.errorBanner = page.locator('#header-message .alert-error');
    this.infoBanner = page.locator('#header-message .alert-info');
    this.successAlert = page.locator('.alert-success');
  }

  async open(): Promise<void> {
    await this.header.goToContact();
    await expect(this.forename).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
    // Each mandatory field turns its required flag on when focused, and renders its error on blur.
    for (const field of [this.forename, this.email, this.message]) {
      await field.focus();
      await field.press('Tab');
    }
  }

  async fillMandatory(details: ContactDetails): Promise<void> {
    await this.forename.fill(details.forename);
    await this.email.fill(details.email);
    await this.message.fill(details.message);
  }
}
