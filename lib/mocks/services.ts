import { MOCK_CATEGORIES } from "@/lib/mock-categories";
import type {
  Client,
  Job,
  Notification,
  Offer,
  Payment,
  Provider,
  Prisma,
  Review,
  ServiceRequest,
  ServiceRequestPhoto,
  UpdateReminder,
  User,
  VerificationDocument,
} from "@/lib/generated/prisma/client";
import type {
  AcceptOfferBody,
  AuthResponse,
  CategoryListParams,
  CategoryWithChildren,
  CompleteClientOnboardingRequest,
  CompleteProviderOnboardingRequest,
  CreateOfferBody,
  CreatePaymentBody,
  CreateReviewBody,
  CreateServiceRequestBody,
  JobListParams,
  JobWithRelations,
  LoginRequest,
  Me,
  NotificationListParams,
  NotificationWithRequest,
  OfferWithProvider,
  Paginated,
  PaginationParams,
  PaymentInitiationResponse,
  ProviderProfile,
  ProviderSearchItem,
  ProviderSearchParams,
  RefreshRequest,
  RegisterRequest,
  ServiceRequestListItem,
  ServiceRequestListParams,
  ServiceRequestWithRelations,
  UpdateJobStatusBody,
  UpdateOfferBody,
  UpdateProviderCategoriesRequest,
  UpdateServiceRequestBody,
  UpdateUserRequest,
  UploadServiceRequestPhotoBody,
  UploadVerificationDocumentBody,
  VerificationDocumentResponse,
} from "@/types/api";

type MockState = {
  me: Me;
  users: User[];
  clients: Client[];
  providers: ProviderSearchItem[];
  reviews: Review[];
  requests: ServiceRequestListItem[];
  notifications: NotificationWithRequest[];
  offers: OfferWithProvider[];
  jobs: JobWithRelations[];
  payments: Payment[];
  verificationDocuments: VerificationDocument[];
  reminders: UpdateReminder[];
};

const categoryTree: CategoryWithChildren[] = MOCK_CATEGORIES.map((category) => ({
  ...category,
  children: [],
}));

const baseNow = new Date("2026-04-28T09:00:00.000Z");

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function makeId(prefix: string, index: number) {
  return `${prefix}-${index}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function decimal(value: number): Prisma.Decimal {
  return value as unknown as Prisma.Decimal;
}

const providerItems: ProviderSearchItem[] = [
  {
    id: "provider-1",
    userId: "user-provider-1",
    fullName: "Felana Rakoto",
    companyName: "Rakoto Services",
    bio: "Plombier de quartier pour fuites, chauffe-eau et depannages rapides.",
    district: "Analakely",
    city: "Antananarivo",
    neighborhood: "Isoraka",
    averageRating: 4.8,
    completedJobsCount: 48,
    verified: true,
    contactUpdatedAt: addDays(baseNow, -8),
    nextContactReminderAt: addDays(baseNow, 21),
    createdAt: addDays(baseNow, -120),
    categories: [MOCK_CATEGORIES[0]],
  },
  {
    id: "provider-2",
    userId: "user-provider-2",
    fullName: "Tovo Care",
    companyName: "Tovo Clean",
    bio: "Equipe de menage pour appartements, bureaux et remises en etat.",
    district: "Analakely",
    city: "Antananarivo",
    neighborhood: "Antaninarenina",
    averageRating: 4.5,
    completedJobsCount: 33,
    verified: true,
    contactUpdatedAt: addDays(baseNow, -10),
    nextContactReminderAt: addDays(baseNow, 20),
    createdAt: addDays(baseNow, -140),
    categories: [MOCK_CATEGORIES[3]],
  },
  {
    id: "provider-3",
    userId: "user-provider-3",
    fullName: "Mamy Tech",
    companyName: "Mamy Mobile",
    bio: "Diagnostic et reparation de smartphones, batteries et ecrans.",
    district: "Antsirabe I",
    city: "Antsirabe",
    neighborhood: "Vatofotsy",
    averageRating: 4.2,
    completedJobsCount: 21,
    verified: false,
    contactUpdatedAt: addDays(baseNow, -15),
    nextContactReminderAt: addDays(baseNow, 15),
    createdAt: addDays(baseNow, -90),
    categories: [MOCK_CATEGORIES[4]],
  },
  {
    id: "provider-4",
    userId: "user-provider-4",
    fullName: "Hery Volt",
    companyName: "Volt Express",
    bio: "Electricien pour diagnostics, prises, eclairages et tableaux.",
    district: "Analamanga",
    city: "Antananarivo",
    neighborhood: "Ankorondrano",
    averageRating: 4.9,
    completedJobsCount: 57,
    verified: true,
    contactUpdatedAt: addDays(baseNow, -5),
    nextContactReminderAt: addDays(baseNow, 25),
    createdAt: addDays(baseNow, -160),
    categories: [MOCK_CATEGORIES[1]],
  },
];

const providerReviews: Review[] = [
  {
    id: "review-1",
    jobId: "job-1",
    clientId: "client-1",
    providerId: "provider-1",
    rating: 5,
    comment: "Intervention rapide et propre, fuite resolue dans la journee.",
    published: true,
    createdAt: addDays(baseNow, -18),
  },
  {
    id: "review-2",
    jobId: "job-2",
    clientId: "client-2",
    providerId: "provider-1",
    rating: 4,
    comment: "Bon suivi, devis clair et travail serieux.",
    published: true,
    createdAt: addDays(baseNow, -42),
  },
  {
    id: "review-3",
    jobId: "job-3",
    clientId: "client-3",
    providerId: "provider-4",
    rating: 5,
    comment: "Tres professionnel, panne electrique corrigee rapidement.",
    published: true,
    createdAt: addDays(baseNow, -12),
  },
];

const defaultClientUser: User = {
  id: "user-client-1",
  email: "client@mpanera.test",
  phone: "0340011223",
  passwordHash: "mock-hash",
  role: "CLIENT",
  onboardingComplete: false,
  active: true,
  createdAt: addDays(baseNow, -200),
  lastLoginAt: addDays(baseNow, -1),
};

const defaultClientProfile: Client = {
  id: "client-1",
  userId: defaultClientUser.id,
  firstName: "Aina",
  lastName: "Rakotoniaina",
  district: "Analakely",
  city: "Antananarivo",
  neighborhood: "Isotry",
};

const requestItems: ServiceRequestListItem[] = [
  {
    id: "sr-1",
    clientId: defaultClientProfile.id,
    categoryId: MOCK_CATEGORIES[0].id,
    title: "Fuite sous l'evier",
    description: "Besoin d'un plombier pour une fuite persistante sous l'evier de la cuisine.",
    district: "Analakely",
    indicativeBudget: decimal(50000),
    desiredDeadline: addDays(baseNow, 2),
    status: "OPEN",
    createdAt: addDays(baseNow, -1),
    expiresAt: addDays(baseNow, 6),
    category: MOCK_CATEGORIES[0],
    _count: {
      notifications: 1,
      offers: 0,
      photos: 0,
    },
  },
  {
    id: "sr-2",
    clientId: defaultClientProfile.id,
    categoryId: MOCK_CATEGORIES[3].id,
    title: "Grand menage appartement",
    description: "Nettoyage complet apres travaux sur un T3.",
    district: "Analakely",
    indicativeBudget: decimal(80000),
    desiredDeadline: addDays(baseNow, 4),
    status: "NEGOTIATING",
    createdAt: addDays(baseNow, -3),
    expiresAt: addDays(baseNow, 4),
    category: MOCK_CATEGORIES[3],
    _count: {
      notifications: 1,
      offers: 2,
      photos: 1,
    },
  },
  {
    id: "sr-3",
    clientId: defaultClientProfile.id,
    categoryId: MOCK_CATEGORIES[1].id,
    title: "Prise electrique a remplacer",
    description: "Une prise murale chauffe, remplacement souhaite rapidement.",
    district: "Analamanga",
    indicativeBudget: decimal(30000),
    desiredDeadline: addDays(baseNow, 1),
    status: "ASSIGNED",
    createdAt: addDays(baseNow, -5),
    expiresAt: addDays(baseNow, 2),
    category: MOCK_CATEGORIES[1],
    _count: {
      notifications: 1,
      offers: 1,
      photos: 0,
    },
  },
];

const notificationItems: NotificationWithRequest[] = [
  {
    id: "notification-1",
    serviceRequestId: "sr-1",
    providerId: "provider-1",
    status: "SENT",
    sentAt: addDays(baseNow, -1),
    viewedAt: null,
    serviceRequest: {
      ...requestItems[0],
      category: undefined,
      _count: undefined,
    } as unknown as ServiceRequest,
  },
];

const offerItems: OfferWithProvider[] = [
  {
    id: "offer-1",
    notificationId: "notification-1",
    serviceRequestId: "sr-2",
    providerId: "provider-2",
    proposedPrice: decimal(75000),
    message: "Disponible demain matin avec equipe de deux personnes.",
    status: "PENDING",
    createdAt: addDays(baseNow, -2),
    provider: providerItems[1],
    proposedSlots: [
      {
        id: "slot-1",
        offerId: "offer-1",
        start: addDays(baseNow, 1),
        end: addDays(baseNow, 1),
      },
    ],
  },
];

const jobItems: JobWithRelations[] = [
  {
    id: "job-10",
    serviceRequestId: "sr-3",
    clientId: defaultClientProfile.id,
    providerId: "provider-4",
    acceptedOfferId: "offer-accepted-1",
    finalPrice: decimal(30000),
    chosenSlotStart: addDays(baseNow, 1),
    chosenSlotEnd: addDays(baseNow, 1),
    status: "IN_PROGRESS",
    createdAt: addDays(baseNow, -4),
    completedAt: null,
    client: defaultClientProfile,
    provider: providerItems[3],
    serviceRequest: {
      ...requestItems[2],
      category: undefined,
      _count: undefined,
    } as unknown as ServiceRequest,
    acceptedOffer: {
      id: "offer-accepted-1",
      notificationId: "notification-accepted-1",
      serviceRequestId: "sr-3",
      providerId: "provider-4",
      proposedPrice: decimal(30000),
      message: "Je peux intervenir demain.",
      status: "ACCEPTED",
      createdAt: addDays(baseNow, -4),
    },
    payment: null,
    review: null,
  },
];

const paymentItems: Payment[] = [
  {
    id: "payment-1",
    jobId: "job-10",
    clientId: defaultClientProfile.id,
    amount: decimal(30000),
    method: "MVOLA",
    apiReference: "mvola-mock-1",
    status: "PENDING",
    rawPayload: null,
    paidAt: null,
  },
];

const verificationDocs: VerificationDocument[] = [
  {
    id: "verification-1",
    providerId: "provider-1",
    type: "ID_CARD_FRONT",
    fileUrl: "/uploads/mock/id-front.jpg",
    autoCheckPass: true,
    autoCheckLog: "Mock auto-check ok",
    status: "VALIDATED",
    rejectionReason: null,
    reviewedById: null,
    submittedAt: addDays(baseNow, -20),
    reviewedAt: addDays(baseNow, -19),
  },
];

const reminderItems: UpdateReminder[] = [
  {
    id: "reminder-1",
    providerId: "provider-1",
    status: "SENT",
    sentAt: addDays(baseNow, -2),
    confirmedAt: null,
    expiresAt: addDays(baseNow, 5),
  },
];

const mockState: MockState = {
  me: {
    ...defaultClientUser,
    client: defaultClientProfile,
    provider: null,
  },
  users: [defaultClientUser],
  clients: [defaultClientProfile],
  providers: providerItems,
  reviews: providerReviews,
  requests: requestItems,
  notifications: notificationItems,
  offers: offerItems,
  jobs: jobItems,
  payments: paymentItems,
  verificationDocuments: verificationDocs,
  reminders: reminderItems,
};

function paginate<T>(items: T[], page = 1, perPage = 20): Paginated<T> {
  const start = (page - 1) * perPage;
  return {
    data: clone(items.slice(start, start + perPage)),
    page,
    perPage,
    total: items.length,
  };
}

function getCategoryById(categoryId: string) {
  return MOCK_CATEGORIES.find((category) => category.id === categoryId) ?? MOCK_CATEGORIES[0];
}

function getMe(): Me {
  return clone(mockState.me);
}

function setMe(next: Me) {
  mockState.me = clone(next);
}

function buildAuthResponse(user: User): AuthResponse {
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: clone(user),
  };
}

function currentProviderProfile() {
  if (!mockState.me.provider) return null;
  return mockState.providers.find((provider) => provider.id === mockState.me.provider?.id) ?? null;
}

export const categoriesService = {
  list: async (params?: CategoryListParams) => {
    void params;
    return clone(categoryTree);
  },
  getBySlug: async (slug: string) => {
    const category = MOCK_CATEGORIES.find((item) => item.slug === slug);
    if (!category) throw new Error("Categorie introuvable.");
    return clone(category);
  },
};

export const providersService = {
  search: async (params?: ProviderSearchParams) => {
    let items = [...mockState.providers];
    if (params?.categoryId) {
      items = items.filter((provider) =>
        provider.categories.some((category) => category.id === params.categoryId),
      );
    }
    if (params?.city) {
      const city = params.city.toLowerCase();
      items = items.filter((provider) => provider.city?.toLowerCase().includes(city));
    }
    if (params?.district) {
      const district = params.district.toLowerCase();
      items = items.filter((provider) => provider.district?.toLowerCase().includes(district));
    }
    if (params?.verified !== undefined) {
      items = items.filter((provider) => provider.verified === params.verified);
    }
    if (params?.minRating !== undefined) {
      const minRating = params.minRating;
      items = items.filter((provider) => provider.averageRating >= minRating);
    }
    return paginate(items, params?.page ?? 1, params?.perPage ?? 20);
  },
  get: async (id: string) => {
    const provider = mockState.providers.find((item) => item.id === id);
    if (!provider) throw new Error("Prestataire introuvable.");
    const reviews = mockState.reviews.filter((review) => review.providerId === id && review.published);
    return {
      ...clone(provider),
      reviews: clone(reviews),
    } satisfies ProviderProfile;
  },
  setMyCategories: async (body: UpdateProviderCategoriesRequest) => {
    const current = currentProviderProfile();
    if (!current || !mockState.me.provider) throw new Error("Aucun profil prestataire actif.");
    current.categories = body.categoryIds.map((categoryId) => getCategoryById(categoryId));
    const provider = {
      ...mockState.me.provider,
    };
    setMe({
      ...mockState.me,
      provider,
    });
    return clone(provider);
  },
};

export const reviewsService = {
  createForJob: async (jobId: string, body: CreateReviewBody) => {
    const job = mockState.jobs.find((item) => item.id === jobId);
    if (!job) throw new Error("Mission introuvable.");
    const review: Review = {
      id: makeId("review", mockState.reviews.length + 10),
      jobId,
      clientId: job.clientId,
      providerId: job.providerId,
      rating: body.rating,
      comment: body.comment ?? null,
      published: true,
      createdAt: new Date(),
    };
    mockState.reviews.unshift(review);
    return clone(review);
  },
  listForProvider: async (providerId: string, params?: PaginationParams) =>
    paginate(
      mockState.reviews.filter((review) => review.providerId === providerId && review.published),
      params?.page ?? 1,
      params?.perPage ?? 20,
    ),
};

export const usersService = {
  me: async () => getMe(),
  update: async (body: UpdateUserRequest) => {
    const updated: Me = {
      ...mockState.me,
      ...(body.email ? { email: body.email } : {}),
      ...(body.phone ? { phone: body.phone } : {}),
    };
    setMe(updated);
    return clone(updated);
  },
};

export const onboardingService = {
  completeClient: async (body: CompleteClientOnboardingRequest) => {
    const client: Client = {
      id: mockState.me.client?.id ?? makeId("client", mockState.clients.length + 2),
      userId: mockState.me.id,
      firstName: body.firstName,
      lastName: body.lastName,
      district: body.district ?? null,
      city: body.city ?? null,
      neighborhood: body.neighborhood ?? null,
    };
    setMe({
      ...mockState.me,
      role: "CLIENT",
      onboardingComplete: true,
      client,
      provider: null,
    });
    return clone(client);
  },
  completeProvider: async (body: CompleteProviderOnboardingRequest) => {
    const provider: Provider = {
      id: mockState.me.provider?.id ?? makeId("provider", mockState.providers.length + 10),
      userId: mockState.me.id,
      fullName: body.fullName,
      companyName: body.companyName ?? null,
      bio: body.bio ?? null,
      district: body.district ?? null,
      city: body.city ?? null,
      neighborhood: body.neighborhood ?? null,
      averageRating: 0,
      completedJobsCount: 0,
      verified: false,
      contactUpdatedAt: null,
      nextContactReminderAt: null,
      createdAt: new Date(),
    };
    const providerItem: ProviderSearchItem = {
      ...provider,
      categories: body.categoryIds.map((categoryId) => getCategoryById(categoryId)),
    };
    mockState.providers.unshift(providerItem);
    setMe({
      ...mockState.me,
      role: "PROVIDER",
      onboardingComplete: true,
      client: null,
      provider,
    });
    return clone(provider);
  },
};

export const serviceRequestsService = {
  list: async (params?: ServiceRequestListParams) => {
    let items = [...mockState.requests];
    if (params?.status) {
      items = items.filter((request) => request.status === params.status);
    }
    if (params?.categoryId) {
      items = items.filter((request) => request.categoryId === params.categoryId);
    }
    return paginate(items, params?.page ?? 1, params?.perPage ?? 20);
  },
  create: async (body: CreateServiceRequestBody) => {
    const category = getCategoryById(body.categoryId);
    const matchingProviders = mockState.providers.filter(
      (provider) =>
        provider.verified &&
        provider.categories.some((item) => item.id === body.categoryId) &&
        (!body.district || provider.district === body.district),
    );
    const request: ServiceRequestListItem = {
      id: makeId("sr", mockState.requests.length + 10),
      clientId: mockState.me.client?.id ?? defaultClientProfile.id,
      categoryId: body.categoryId,
      title: body.title,
      description: body.description,
      district: body.district ?? null,
      indicativeBudget:
        body.indicativeBudget !== undefined ? decimal(body.indicativeBudget) : null,
      desiredDeadline: body.desiredDeadline ? new Date(body.desiredDeadline) : null,
      status: "OPEN",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      category,
      _count: {
        notifications: matchingProviders.length,
        offers: 0,
        photos: 0,
      },
    };
    mockState.requests.unshift(request);
    return clone({
      id: request.id,
      clientId: request.clientId,
      categoryId: request.categoryId,
      title: request.title,
      description: request.description,
      district: request.district,
      indicativeBudget: request.indicativeBudget,
      desiredDeadline: request.desiredDeadline,
      status: request.status,
      createdAt: request.createdAt,
      expiresAt: request.expiresAt,
    } as ServiceRequest);
  },
  get: async (id: string) => {
    const request = mockState.requests.find((item) => item.id === id);
    if (!request) throw new Error("Demande introuvable.");
    return {
      ...clone(request),
      client: clone(mockState.me.client ?? defaultClientProfile),
      photos: [],
      offers: mockState.offers
        .filter((offer) => offer.serviceRequestId === id)
        .map((offer) => ({
          id: offer.id,
          notificationId: offer.notificationId,
          serviceRequestId: offer.serviceRequestId,
          providerId: offer.providerId,
          proposedPrice: offer.proposedPrice,
          message: offer.message,
          status: offer.status,
          createdAt: offer.createdAt,
        })) as Offer[],
    } satisfies ServiceRequestWithRelations;
  },
  update: async (id: string, body: UpdateServiceRequestBody) => {
    const request = mockState.requests.find((item) => item.id === id);
    if (!request) throw new Error("Demande introuvable.");
    Object.assign(request, {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.district !== undefined ? { district: body.district } : {}),
      ...(body.indicativeBudget !== undefined
        ? { indicativeBudget: decimal(body.indicativeBudget) }
        : {}),
      ...(body.desiredDeadline !== undefined
        ? { desiredDeadline: body.desiredDeadline ? new Date(body.desiredDeadline) : null }
        : {}),
    });
    return clone(request as unknown as ServiceRequest);
  },
  close: async (id: string) => {
    const request = mockState.requests.find((item) => item.id === id);
    if (request) request.status = "CLOSED";
  },
  addPhoto: async (id: string, body: UploadServiceRequestPhotoBody) => {
    void body;
    const request = mockState.requests.find((item) => item.id === id);
    if (!request) throw new Error("Demande introuvable.");
    request._count.photos += 1;
    const photo: ServiceRequestPhoto = {
      id: makeId("photo", request._count.photos),
      serviceRequestId: id,
      fileUrl: `/uploads/mock/${id}/photo-${request._count.photos}.jpg`,
      order: request._count.photos - 1,
    };
    return clone(photo);
  },
  removePhoto: async (id: string, photoId: string) => {
    void id;
    void photoId;
    return undefined;
  },
};

export const notificationsService = {
  list: async (params?: NotificationListParams) => {
    let items = [...mockState.notifications];
    if (params?.status) {
      items = items.filter((notification) => notification.status === params.status);
    }
    return paginate(items, params?.page ?? 1, params?.perPage ?? 20);
  },
  markViewed: async (id: string) => {
    const notification = mockState.notifications.find((item) => item.id === id);
    if (!notification) throw new Error("Notification introuvable.");
    notification.status = "VIEWED";
    notification.viewedAt = new Date();
    return clone({
      id: notification.id,
      serviceRequestId: notification.serviceRequestId,
      providerId: notification.providerId,
      status: notification.status,
      sentAt: notification.sentAt,
      viewedAt: notification.viewedAt,
    } as Notification);
  },
};

export const offersService = {
  listForServiceRequest: async (serviceRequestId: string) =>
    clone(mockState.offers.filter((offer) => offer.serviceRequestId === serviceRequestId)),
  create: async (serviceRequestId: string, body: CreateOfferBody) => {
    const offer: Offer = {
      id: makeId("offer", mockState.offers.length + 10),
      notificationId: makeId("notification", mockState.offers.length + 10),
      serviceRequestId,
      providerId: mockState.me.provider?.id ?? "provider-1",
      proposedPrice: decimal(body.proposedPrice),
      message: body.message ?? null,
      status: "PENDING",
      createdAt: new Date(),
    };
    return clone(offer);
  },
  get: async (id: string) => {
    const offer = mockState.offers.find((item) => item.id === id);
    if (!offer) throw new Error("Offre introuvable.");
    return clone(offer);
  },
  update: async (id: string, body: UpdateOfferBody) => {
    const offer = mockState.offers.find((item) => item.id === id);
    if (!offer) throw new Error("Offre introuvable.");
    if (body.proposedPrice !== undefined) {
      offer.proposedPrice = decimal(body.proposedPrice);
    }
    if (body.message !== undefined) offer.message = body.message;
    if (body.slots) {
      offer.proposedSlots = body.slots.map((slot, index) => ({
        id: makeId("slot", index + 10),
        offerId: id,
        start: new Date(slot.start),
        end: new Date(slot.end),
      }));
    }
    return clone({
      id: offer.id,
      notificationId: offer.notificationId,
      serviceRequestId: offer.serviceRequestId,
      providerId: offer.providerId,
      proposedPrice: offer.proposedPrice,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
    } as Offer);
  },
  accept: async (id: string, body: AcceptOfferBody) => {
    const offer = mockState.offers.find((item) => item.id === id);
    if (!offer) throw new Error("Offre introuvable.");
    const job: Job = {
      id: makeId("job", mockState.jobs.length + 10),
      serviceRequestId: offer.serviceRequestId,
      clientId: mockState.me.client?.id ?? defaultClientProfile.id,
      providerId: offer.providerId,
      acceptedOfferId: offer.id,
      finalPrice: offer.proposedPrice,
      chosenSlotStart: new Date(body.chosenSlotStart),
      chosenSlotEnd: new Date(body.chosenSlotEnd),
      status: "AWAITING_PAYMENT",
      createdAt: new Date(),
      completedAt: null,
    };
    return clone(job);
  },
  refuse: async (id: string) => {
    const offer = mockState.offers.find((item) => item.id === id);
    if (!offer) throw new Error("Offre introuvable.");
    offer.status = "REFUSED";
    return clone({
      id: offer.id,
      notificationId: offer.notificationId,
      serviceRequestId: offer.serviceRequestId,
      providerId: offer.providerId,
      proposedPrice: offer.proposedPrice,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
    } as Offer);
  },
  withdraw: async (id: string) => {
    const offer = mockState.offers.find((item) => item.id === id);
    if (!offer) throw new Error("Offre introuvable.");
    offer.status = "WITHDRAWN";
    return clone({
      id: offer.id,
      notificationId: offer.notificationId,
      serviceRequestId: offer.serviceRequestId,
      providerId: offer.providerId,
      proposedPrice: offer.proposedPrice,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
    } as Offer);
  },
};

export const jobsService = {
  list: async (params?: JobListParams) => {
    let items = [...mockState.jobs];
    if (params?.status) {
      items = items.filter((job) => job.status === params.status);
    }
    return paginate(
      items.map((job) => ({
        id: job.id,
        serviceRequestId: job.serviceRequestId,
        clientId: job.clientId,
        providerId: job.providerId,
        acceptedOfferId: job.acceptedOfferId,
        finalPrice: job.finalPrice,
        chosenSlotStart: job.chosenSlotStart,
        chosenSlotEnd: job.chosenSlotEnd,
        status: job.status,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
      params?.page ?? 1,
      params?.perPage ?? 20,
    );
  },
  get: async (id: string) => {
    const job = mockState.jobs.find((item) => item.id === id);
    if (!job) throw new Error("Mission introuvable.");
    return clone(job);
  },
  updateStatus: async (id: string, body: UpdateJobStatusBody) => {
    const job = mockState.jobs.find((item) => item.id === id);
    if (!job) throw new Error("Mission introuvable.");
    job.status = body.status;
    return clone({
      id: job.id,
      serviceRequestId: job.serviceRequestId,
      clientId: job.clientId,
      providerId: job.providerId,
      acceptedOfferId: job.acceptedOfferId,
      finalPrice: job.finalPrice,
      chosenSlotStart: job.chosenSlotStart,
      chosenSlotEnd: job.chosenSlotEnd,
      status: job.status,
      createdAt: job.createdAt,
      completedAt: body.status === "COMPLETED" ? new Date() : job.completedAt,
    } as Job);
  },
};

export const paymentsService = {
  initiate: async (jobId: string, body: CreatePaymentBody) => {
    const payment: PaymentInitiationResponse = {
      id: makeId("payment", mockState.payments.length + 10),
      jobId,
      clientId: mockState.me.client?.id ?? defaultClientProfile.id,
      amount: decimal(50000),
      method: body.method,
      apiReference: `mock-${body.method.toLowerCase()}-${mockState.payments.length + 10}`,
      status: "PENDING",
      rawPayload: null,
      paidAt: null,
      instructions:
        body.method === "CARD"
          ? null
          : `Confirmez le paiement mock dans votre application ${body.method.toLowerCase()}.`,
      redirectUrl: body.method === "CARD" ? "/checkout/mock" : null,
    };
    return clone(payment);
  },
  get: async (id: string) => {
    const payment = mockState.payments.find((item) => item.id === id);
    if (!payment) throw new Error("Paiement introuvable.");
    return clone(payment);
  },
  webhook: async (payload: unknown) => {
    void payload;
    return undefined;
  },
};

export const verificationService = {
  list: async () => clone(mockState.verificationDocuments),
  upload: async (body: UploadVerificationDocumentBody) => {
    const doc: VerificationDocumentResponse = {
      id: makeId("verification", mockState.verificationDocuments.length + 10),
      providerId: mockState.me.provider?.id ?? "provider-1",
      type: body.type,
      fileUrl: `/uploads/mock/verification/${body.file.name}`,
      autoCheckPass: false,
      autoCheckLog: null,
      status: "PENDING",
      rejectionReason: null,
      reviewedById: null,
      submittedAt: new Date(),
      reviewedAt: null,
    };
    mockState.verificationDocuments.unshift(doc);
    return clone(doc);
  },
};

export const remindersService = {
  confirm: async (id: string) => {
    const reminder = mockState.reminders.find((item) => item.id === id);
    if (!reminder) throw new Error("Rappel introuvable.");
    reminder.status = "CONFIRMED";
    reminder.confirmedAt = new Date();
    return clone(reminder);
  },
};

export const authService = {
  register: async (body: RegisterRequest) => {
    const user: User = {
      id: makeId("user", mockState.users.length + 10),
      email: body.email,
      phone: body.phone,
      passwordHash: "mock-password-hash",
      role: body.role,
      onboardingComplete: false,
      active: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
    mockState.users.push(user);
    setMe({
      ...user,
      client: null,
      provider: null,
    });
    return buildAuthResponse(user);
  },
  login: async (body: LoginRequest) => {
    void body;
    return buildAuthResponse(mockState.me);
  },
  refresh: async (body: RefreshRequest) => {
    void body;
    return buildAuthResponse(mockState.me);
  },
  logout: async () => undefined,
};
