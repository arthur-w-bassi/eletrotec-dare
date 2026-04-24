export function createMockUser(overrides?: Record<string, unknown>) {
  return {
    id: "user-id-1",
    username: "testuser",
    email: "test@example.com",
    emailVerifiedAt: null,
    passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$mock",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    roles: [{ role: { name: "user" } }],
    ...overrides,
  };
}

export function createMockUserDTO(overrides?: Record<string, unknown>) {
  return {
    id: "user-id-1",
    username: "testuser",
    email: "test@example.com",
    emailVerifiedAt: null,
    roles: ["user"],
    ...overrides,
  };
}
