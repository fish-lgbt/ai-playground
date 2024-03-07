export {};

declare global {
  type Feature = 'beta';

  interface UserPublicMetadata {
    role?: 'admin';
    plan?: 'free' | 'pro' | 'unlimited';
    features?: Feature[];
  }
  interface CustomJwtSessionClaims {
    metadata: UserPublicMetadata;
  }
}
