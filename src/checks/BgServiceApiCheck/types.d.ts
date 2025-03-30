export interface Partial<MyUser> {
  id?: string;
  userHandle?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  source?: string;
  termsAndConditionsAcceptedAt?: string;
  adminNotes?: string;
}
