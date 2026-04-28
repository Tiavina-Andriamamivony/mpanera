import { api } from "@/lib/api";
import type {
  CreateServiceRequestBody,
  Paginated,
  ServiceRequestListItem,
  ServiceRequestListParams,
  ServiceRequestWithRelations,
  UpdateServiceRequestBody,
  UploadServiceRequestPhotoBody,
} from "@/types/api";
import type { ServiceRequest, ServiceRequestPhoto } from "@/lib/generated/prisma/client";

export const serviceRequestsService = {
  list: (params?: ServiceRequestListParams) =>
    api.get<Paginated<ServiceRequestListItem>>("/service-requests", { params }),
  create: (body: CreateServiceRequestBody) =>
    api.post<ServiceRequest>("/service-requests", body),
  get: (id: string) => api.get<ServiceRequestWithRelations>(`/service-requests/${id}`),
  update: (id: string, body: UpdateServiceRequestBody) =>
    api.patch<ServiceRequest>(`/service-requests/${id}`, body),
  close: (id: string) => api.delete<void>(`/service-requests/${id}`),
  addPhoto: (id: string, body: UploadServiceRequestPhotoBody) => {
    const fd = new FormData();
    fd.append("file", body.file);
    if (body.order !== undefined) fd.append("order", String(body.order));
    return api.upload<ServiceRequestPhoto>(`/service-requests/${id}/photos`, fd);
  },
  removePhoto: (id: string, photoId: string) =>
    api.delete<void>(`/service-requests/${id}/photos/${photoId}`),
};
