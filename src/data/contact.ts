export type ContactDetails = {
  forename: string;
  email: string;
  message: string;
};

export const validContact: ContactDetails = {
  forename: 'Alex',
  email: 'alex.rivera@example.com',
  message: 'Please confirm the delivery window for the stuffed toys.',
};

export function successMessage(forename: string): string {
  return `Thanks ${forename}, we appreciate your feedback.`;
}
