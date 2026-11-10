import { successMessage, validContact } from '../../src/data/contact';
import { expect, test } from '../../src/fixtures/test';

test('submitting the mandatory fields shows the thank-you message', async ({ home, contact }) => {
  test.setTimeout(60_000);

  await home.open();
  await contact.open();
  await contact.fillMandatory(validContact);
  await contact.submit();

  await expect(contact.successAlert).toContainText(successMessage(validContact.forename), {
    timeout: 30_000,
  });
});
