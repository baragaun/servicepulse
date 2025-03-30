import { UserProps } from '../types.js';

export interface VerifyUserPropsResult {
  errors?: string[];
}

export const verifyUserProps = (
  user: Partial<UserProps>,
  target: Partial<UserProps>,
): VerifyUserPropsResult => {
  const errors: string[] = [];
  for (const key in target) {
    if (target[key as keyof UserProps] !== user[key as keyof UserProps]) {
      errors.push(`${key} does not match`);
    }
  }

  return errors.length > 0 ? { errors } : {};
};
