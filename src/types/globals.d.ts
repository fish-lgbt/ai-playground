export {};

declare global {
  interface UserPublicMetadata {
    role?: 'admin';
    plan?: 'pro' | 'unlimited';
  }
  interface CustomJwtSessionClaims {
    metadata: UserPublicMetadata;
  }
}
