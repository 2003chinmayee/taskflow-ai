import apiClient from '../lib/axios';
import type { Attachment } from '../types/attachment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskAttachmentApi = {

  list: (taskId: string) =>
    apiClient.get<ApiResponse<Attachment[]>>(
      `/api/v1/tasks/${taskId}/attachments`
    ),

 upload: (
    taskId: string,
    file: File,
    onUploadProgress: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ApiResponse<Attachment>>(
      `/api/v1/tasks/${taskId}/attachments`,
      formData,
      {
        // apiClient sets a default 'application/json' header at the
        // instance level, which can override Axios's automatic
        // multipart detection. Explicitly clear it here so the browser
        // sets the correct 'multipart/form-data; boundary=...' header.
        headers: {
          'Content-Type': undefined,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            onUploadProgress(percent);
          }
        },
      }
    );
  },

  delete: (taskId: string, attachmentId: string) =>
    apiClient.delete<ApiResponse<null>>(
      `/api/v1/tasks/${taskId}/attachments/${attachmentId}`
    ),

  // Downloads the file as a blob using the authenticated Axios instance
  // (JWT is injected by the request interceptor). A plain <a href> would
  // not carry the Authorization header, so this is required.
  download: (taskId: string, attachmentId: string) =>
    apiClient.get(
      `/api/v1/tasks/${taskId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    ),
};