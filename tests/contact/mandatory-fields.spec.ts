import { validContact } from '../../src/data/contact';
import { expect, test } from '../../src/fixtures/test';

test('mandatory field errors appear and then clear', async ({ home, contact }) => {
  await home.open();
  await contact.open();
  await contact.submit();

  await expect(contact.forenameError).toHaveText('Forename is required');
  await expect(contact.emailError).toHaveText('Email is required');
  await expect(contact.messageError).toHaveText('Message is required');
  await expect(contact.errorBanner).toContainText(
    "but we won't get it unless you complete the form correctly",
  );

  await contact.fillMandatory(validContact);

  await expect(contact.forenameError).toBeHidden();
  await expect(contact.emailError).toBeHidden();
  await expect(contact.messageError).toBeHidden();
  await expect(contact.errorBanner).toBeHidden();
  await expect(contact.infoBanner).toContainText('tell it how it is');
});
