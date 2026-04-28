import { api } from "@/lib/api";
import type {
  Paginated,
  ProviderProfile,
  ProviderSearchItem,
  ProviderSearchParams,
  UpdateProviderCategoriesRequest,
} from "@/types/api";
import type { Provider } from "@/lib/generated/prisma/client";

export const providersService = {
  search: (params?: ProviderSearchParams) =>
    api.get<Paginated<ProviderSearchItem>>("/providers", { params }),
  get: (id: string) => api.get<ProviderProfile>(`/providers/${id}`),
  setMyCategories: (body: UpdateProviderCategoriesRequest) =>
    api.put<Provider>("/providers/me/categories", body),
};
