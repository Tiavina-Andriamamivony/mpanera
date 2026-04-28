import type { Category } from "@/lib/generated/prisma/client"

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    parentId: null,
    name: "Plomberie",
    slug: "plomberie",
    icon: "wrench",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    parentId: null,
    name: "Electricite",
    slug: "electricite",
    icon: "zap",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    parentId: null,
    name: "Peinture",
    slug: "peinture",
    icon: "paintbrush",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    parentId: null,
    name: "Menage",
    slug: "menage",
    icon: "sparkles",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    parentId: null,
    name: "Reparation telephone",
    slug: "reparation-telephone",
    icon: "smartphone",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    parentId: null,
    name: "Demenagement",
    slug: "demenagement",
    icon: "truck",
  },
]
