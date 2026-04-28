import { z } from "zod";

export const uuid = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid UUID",
  );

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

// auth
export const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(8),
  role: z.enum(["CLIENT", "PROVIDER"]),
});

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(1),
  })
  .refine((d) => !!d.email || !!d.phone, { message: "email ou telephone obligatoire" });

export const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

// onboarding
export const completeClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  district: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
});

export const completeProviderSchema = z.object({
  fullName: z.string().min(1),
  companyName: z.string().optional(),
  bio: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  categoryIds: z.array(uuid).min(1),
});

// providers
export const providerSearchSchema = pagination.extend({
  categoryId: uuid.optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

export const updateProviderCategoriesSchema = z.object({
  categoryIds: z.array(uuid).min(1),
});

// service-requests
export const serviceRequestStatusSchema = z.enum([
  "OPEN",
  "NEGOTIATING",
  "ASSIGNED",
  "CLOSED",
  "EXPIRED",
]);

export const serviceRequestListSchema = pagination.extend({
  status: serviceRequestStatusSchema.optional(),
  categoryId: uuid.optional(),
});

export const createServiceRequestSchema = z.object({
  categoryId: uuid,
  title: z.string().min(1).max(120),
  description: z.string().min(1),
  district: z.string().optional(),
  indicativeBudget: z.number().min(0).optional(),
  desiredDeadline: z.coerce.date().optional(),
});

export const updateServiceRequestSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).optional(),
  district: z.string().optional(),
  indicativeBudget: z.number().min(0).optional(),
  desiredDeadline: z.coerce.date().optional(),
});

// notifications
export const notificationStatusSchema = z.enum([
  "SENT",
  "VIEWED",
  "RESPONDED",
  "IGNORED",
]);
export const notificationListSchema = pagination.extend({
  status: notificationStatusSchema.optional(),
});

// offers
export const slotSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export const createOfferSchema = z.object({
  proposedPrice: z.number().min(0),
  message: z.string().optional(),
  slots: z.array(slotSchema).min(1),
});

export const updateOfferSchema = z.object({
  proposedPrice: z.number().min(0).optional(),
  message: z.string().optional(),
  slots: z.array(slotSchema).optional(),
});

export const acceptOfferSchema = z
  .object({
    chosenSlotStart: z.coerce.date(),
    chosenSlotEnd: z.coerce.date(),
  })
  .refine((d) => d.chosenSlotEnd > d.chosenSlotStart, {
    message: "chosenSlotEnd doit etre posterieur a chosenSlotStart",
  });

// jobs
export const jobStatusSchema = z.enum([
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
]);
export const jobListSchema = pagination.extend({
  status: jobStatusSchema.optional(),
});
export const updateJobStatusSchema = z.object({ status: jobStatusSchema });

// payments
export const paymentMethodSchema = z.enum([
  "MVOLA",
  "ORANGE_MONEY",
  "AIRTEL_MONEY",
  "CARD",
]);
export const createPaymentSchema = z.object({ method: paymentMethodSchema });

// verification
export const verificationDocTypeSchema = z.enum([
  "ID_CARD_FRONT",
  "ID_CARD_BACK",
  "FACE_PHOTO",
  "OTHER",
]);

// reviews
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// categories
export const categoryListSchema = z.object({
  parentId: uuid.optional(),
  rootOnly: z.coerce.boolean().optional(),
});
