import { signAccessToken } from "@/lib/auth";
import type {
  Category,
  Client,
  Job,
  Notification,
  Offer,
  Payment,
  Provider,
  Review,
  ServiceRequest,
  ServiceRequestPhoto,
  UpdateReminder,
  User,
  VerificationDocument,
} from "@/lib/generated/prisma/client";

export const userIds = {
  client: "11111111-1111-1111-1111-111111111111",
  provider: "22222222-2222-2222-2222-222222222222",
};

export const clientUser: User = {
  id: userIds.client,
  email: "client@test.mg",
  phone: "+261340000001",
  passwordHash: "hashed:secret123",
  role: "CLIENT",
  onboardingComplete: true,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  lastLoginAt: null,
};

export const providerUser: User = {
  id: userIds.provider,
  email: "pro@test.mg",
  phone: "+261340000002",
  passwordHash: "hashed:secret123",
  role: "PROVIDER",
  onboardingComplete: true,
  active: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  lastLoginAt: null,
};

export const clientProfile: Client = {
  id: "c0000000-0000-0000-0000-000000000001",
  userId: userIds.client,
  firstName: "Hery",
  lastName: "Rakoto",
  district: "1er",
  city: "Antananarivo",
  neighborhood: "Analakely",
};

export const providerProfile: Provider = {
  id: "p0000000-0000-0000-0000-000000000001",
  userId: userIds.provider,
  fullName: "Naina Plomberie",
  companyName: "Naina SARL",
  bio: "Plombier expérimenté",
  district: "1er",
  city: "Antananarivo",
  neighborhood: "Analakely",
  averageRating: 4.5,
  completedJobsCount: 12,
  verified: true,
  contactUpdatedAt: new Date("2026-04-01T00:00:00Z"),
  nextContactReminderAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

export const category: Category = {
  id: "cat00000-0000-0000-0000-000000000001",
  parentId: null,
  name: "Plomberie",
  slug: "plomberie",
  icon: null,
};

export const serviceRequest: ServiceRequest = {
  id: "sr000000-0000-0000-0000-000000000001",
  clientId: clientProfile.id,
  categoryId: category.id,
  title: "Fuite robinet cuisine",
  description: "Le robinet fuit depuis hier",
  district: "1er",
  indicativeBudget: null,
  desiredDeadline: null,
  status: "OPEN",
  createdAt: new Date("2026-04-20T10:00:00Z"),
  expiresAt: null,
};

export const serviceRequestPhoto: ServiceRequestPhoto = {
  id: "ph000000-0000-0000-0000-000000000001",
  serviceRequestId: serviceRequest.id,
  fileUrl: "/uploads/photo.jpg",
  order: 0,
};

export const notification: Notification = {
  id: "n0000000-0000-0000-0000-000000000001",
  serviceRequestId: serviceRequest.id,
  providerId: providerProfile.id,
  status: "SENT",
  sentAt: new Date("2026-04-20T10:05:00Z"),
  viewedAt: null,
};

export const offer: Offer = {
  id: "of000000-0000-0000-0000-000000000001",
  notificationId: notification.id,
  serviceRequestId: serviceRequest.id,
  providerId: providerProfile.id,
  proposedPrice: { toString: () => "50000" } as unknown as Offer["proposedPrice"],
  message: "Je peux passer demain",
  status: "PENDING",
  createdAt: new Date("2026-04-20T11:00:00Z"),
};

export const job: Job = {
  id: "jb000000-0000-0000-0000-000000000001",
  serviceRequestId: serviceRequest.id,
  clientId: clientProfile.id,
  providerId: providerProfile.id,
  acceptedOfferId: offer.id,
  finalPrice: offer.proposedPrice,
  chosenSlotStart: new Date("2026-04-21T08:00:00Z"),
  chosenSlotEnd: new Date("2026-04-21T10:00:00Z"),
  status: "AWAITING_PAYMENT",
  createdAt: new Date("2026-04-20T12:00:00Z"),
  completedAt: null,
};

export const payment: Payment = {
  id: "pm000000-0000-0000-0000-000000000001",
  jobId: job.id,
  clientId: clientProfile.id,
  amount: offer.proposedPrice,
  method: "MVOLA",
  apiReference: "mvola-test-ref-1",
  status: "PENDING",
  rawPayload: null,
  paidAt: null,
};

export const verificationDocument: VerificationDocument = {
  id: "vd000000-0000-0000-0000-000000000001",
  providerId: providerProfile.id,
  type: "ID_CARD_FRONT",
  fileUrl: "/uploads/id-front.jpg",
  autoCheckPass: false,
  autoCheckLog: null,
  status: "PENDING",
  rejectionReason: null,
  reviewedById: null,
  submittedAt: new Date("2026-04-20T09:00:00Z"),
  reviewedAt: null,
};

export const updateReminder: UpdateReminder = {
  id: "rm000000-0000-0000-0000-000000000001",
  providerId: providerProfile.id,
  status: "SENT",
  sentAt: new Date("2026-04-15T00:00:00Z"),
  confirmedAt: null,
  expiresAt: null,
};

export const review: Review = {
  id: "rv000000-0000-0000-0000-000000000001",
  jobId: job.id,
  clientId: clientProfile.id,
  providerId: providerProfile.id,
  rating: 5,
  comment: "Excellent travail",
  published: true,
  createdAt: new Date("2026-04-22T15:00:00Z"),
};

// Auth helpers
export type AuthUser = User & {
  client: Client | null;
  provider: Provider | null;
};

export const authedClient: AuthUser = {
  ...clientUser,
  client: clientProfile,
  provider: null,
};

export const authedProvider: AuthUser = {
  ...providerUser,
  client: null,
  provider: providerProfile,
};

export function bearer(userId: string): Record<string, string> {
  return { Authorization: `Bearer ${signAccessToken(userId)}` };
}

export function jsonRequest(
  url: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Request {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  return new Request(url, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}
