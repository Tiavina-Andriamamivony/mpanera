import type {
  Category,
  Client,
  Job,
  Notification,
  Offer,
  Payment,
  ProposedTimeSlot,
  Provider,
  Review,
  ServiceRequest,
  ServiceRequestPhoto,
  User,
  UserRole,
  VerificationDocument,
  VerificationDocumentType,
  PaymentMethod,
  ServiceRequestStatus,
  NotificationStatus,
  JobStatus,
} from "@/lib/generated/prisma/client";

// ---------- pagination ----------
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}

// ---------- errors ----------
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface ValidationErrorBody {
  error: {
    code: "VALIDATION_ERROR";
    message: string;
    fields: Record<string, string[]>;
  };
}

// ---------- auth ----------
export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

// ---------- onboarding ----------
export interface CompleteClientOnboardingRequest {
  firstName: string;
  lastName: string;
  district?: string;
  city?: string;
  neighborhood?: string;
}

export interface CompleteProviderOnboardingRequest {
  fullName: string;
  companyName?: string;
  bio?: string;
  district?: string;
  city?: string;
  neighborhood?: string;
  categoryIds: string[];
}

// ---------- me ----------
export type Me = User & {
  client: Client | null;
  provider: Provider | null;
};

// ---------- categories ----------
export interface CategoryListParams {
  parentId?: string;
  rootOnly?: boolean;
}

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

// ---------- providers ----------
export interface ProviderSearchParams extends PaginationParams {
  categoryId?: string;
  city?: string;
  district?: string;
  verified?: boolean;
  minRating?: number;
}

export type ProviderSearchItem = Provider & {
  categories: Category[];
};

export type ProviderProfile = Provider & {
  categories: Category[];
  reviews: Review[];
};

export interface UpdateProviderCategoriesRequest {
  categoryIds: string[];
}

// ---------- service requests ----------
export interface ServiceRequestListParams extends PaginationParams {
  status?: ServiceRequestStatus;
  categoryId?: string;
}

export type ServiceRequestListItem = ServiceRequest & {
  category: Category;
  _count: {
    notifications: number;
    offers: number;
    photos: number;
  };
};

export interface CreateServiceRequestBody {
  categoryId: string;
  title: string;
  description: string;
  district?: string;
  indicativeBudget?: number;
  desiredDeadline?: string;
}

export interface UpdateServiceRequestBody {
  title?: string;
  description?: string;
  district?: string;
  indicativeBudget?: number;
  desiredDeadline?: string;
}

export type ServiceRequestWithRelations = ServiceRequest & {
  client: Client;
  category: Category;
  photos: ServiceRequestPhoto[];
  offers: Offer[];
};

// ---------- notifications ----------
export interface NotificationListParams extends PaginationParams {
  status?: NotificationStatus;
}

export type NotificationWithRequest = Notification & {
  serviceRequest: ServiceRequest;
};

// ---------- offers ----------
export interface OfferSlotInput {
  start: string;
  end: string;
}

export interface CreateOfferBody {
  proposedPrice: number;
  message?: string;
  slots: OfferSlotInput[];
}

export interface UpdateOfferBody {
  proposedPrice?: number;
  message?: string;
  slots?: OfferSlotInput[];
}

export interface AcceptOfferBody {
  chosenSlotStart: string;
  chosenSlotEnd: string;
}

export type OfferWithProvider = Offer & {
  provider: Provider;
  proposedSlots: ProposedTimeSlot[];
};

// ---------- jobs ----------
export interface JobListParams extends PaginationParams {
  status?: JobStatus;
}

export interface UpdateJobStatusBody {
  status: JobStatus;
}

export type JobWithRelations = Job & {
  client: Client;
  provider: Provider;
  serviceRequest: ServiceRequest;
  acceptedOffer: Offer;
  payment: Payment | null;
  review: Review | null;
};

// ---------- payments ----------
export interface CreatePaymentBody {
  method: PaymentMethod;
}

export type PaymentInitiationResponse = Payment & {
  redirectUrl?: string | null;
  instructions?: string | null;
};

// ---------- verification ----------
export interface UploadVerificationDocumentBody {
  type: VerificationDocumentType;
  file: File;
}

export type VerificationDocumentResponse = VerificationDocument;

// ---------- reviews ----------
export interface CreateReviewBody {
  rating: number;
  comment?: string;
}

// ---------- service-request photos ----------
export interface UploadServiceRequestPhotoBody {
  file: File;
  order?: number;
}
