export {};

declare global {
  interface UserPublicMetadata {
    role?: 'admin';
    plan?: 'free' | 'pro' | 'unlimited';
  }
  interface CustomJwtSessionClaims {
    metadata: UserPublicMetadata;
  }
}
