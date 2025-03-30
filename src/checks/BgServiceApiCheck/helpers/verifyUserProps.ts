import { MyUser } from '@baragaun/bg-node-client';

export interface VerifyUserPropsResult {
  errors?: string[];
}

export const verifyUserProps = (
  user: Partial<MyUser>,
  target: Partial<MyUser>,
): VerifyUserPropsResult => {
  const errors: string[] = [];
  for (const key in target) {
    if (target[key as keyof Partial<MyUser>] !== user[key as keyof Partial<MyUser>]) {
      errors.push(`${key} does not match`);
    }
  }

  return errors.length > 0 ? { errors } : {};
};
