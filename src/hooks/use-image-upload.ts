'use client';

import { useState, useCallback, useRef } from 'react';
import { getSession } from 'next-auth/react';

import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  validateImage,
  compressImage,
  type ImageValidationOptions,
  type ImageCompressionOptions,
} from '@/lib/upload-utils';
import type { UploadStatus } from '@/components/upload/upload-progress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface UploadResponse {
  url: string;
  key: string;
  width?: number;
  height?: number;
  size?: number;
}

interface UseImageUploadOptions {
  validation?: ImageValidationOptions;
  compression?: ImageCompressionOptions;
  endpoint?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: string) => void;
}

interface UploadState {
  status: UploadStatus;
  progress: number;
  error: string | null;
  url: string | null;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    validation,
    compression = { maxSizeMB: 1, maxWidthOrHeight: 1920 },
    endpoint = API_ENDPOINTS.UPLOAD.IMAGE,
    onProgress,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    url: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      url: null,
    });
  }, []);

  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    reset();
  }, [reset]);

  const upload = useCallback(
    async (file: File | Blob, fileName?: string): Promise<UploadResponse | null> => {
      // Convert Blob to File if needed
      const fileToUpload = file instanceof File
        ? file
        : new File([file], fileName || 'image.jpg', { type: file.type });

      // Validate the image
      if (validation) {
        const validationResult = await validateImage(fileToUpload, validation);
        if (!validationResult.valid) {
          const errorMsg = validationResult.error || 'Validation failed';
          setState({
            status: 'error',
            progress: 0,
            error: errorMsg,
            url: null,
          });
          onError?.(errorMsg);
          return null;
        }
      }

      setState({
        status: 'uploading',
        progress: 0,
        error: null,
        url: null,
      });

      try {
        // Compress the image
        let compressedFile = fileToUpload;
        if (compression) {
          try {
            compressedFile = await compressImage(fileToUpload, compression);
          } catch {
            // Continue with original file if compression fails
            console.warn('Image compression failed, using original file');
          }
        }

        // Get auth token
        const session = await getSession();
        const token = session?.accessToken;

        // Create FormData
        const formData = new FormData();
        formData.append('file', compressedFile, fileName || compressedFile.name);

        // Upload with progress tracking using XMLHttpRequest
        const response = await new Promise<UploadResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setState((prev) => ({ ...prev, progress }));
              onProgress?.(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.success && response.data) {
                  resolve(response.data);
                } else {
                  reject(new Error(response.error?.message || 'Upload failed'));
                }
              } catch {
                reject(new Error('Invalid response from server'));
              }
            } else {
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                reject(new Error(errorResponse.error?.message || 'Upload failed'));
              } catch {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
              }
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', `${API_BASE_URL}${endpoint}`);

          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.send(formData);
        });

        setState({
          status: 'success',
          progress: 100,
          error: null,
          url: response.url,
        });

        onSuccess?.(response);
        return response;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        setState({
          status: 'error',
          progress: 0,
          error: errorMsg,
          url: null,
        });
        onError?.(errorMsg);
        return null;
      } finally {
        xhrRef.current = null;
      }
    },
    [validation, compression, endpoint, onProgress, onSuccess, onError]
  );

  return {
    upload,
    cancel,
    reset,
    ...state,
    isUploading: state.status === 'uploading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
}

// Batch upload hook for multiple images
interface BatchUploadItem {
  id: string;
  file: File;
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  url?: string;
}

interface UseBatchImageUploadOptions extends Omit<UseImageUploadOptions, 'onProgress' | 'onSuccess' | 'onError'> {
  maxConcurrent?: number;
  onItemProgress?: (id: string, progress: number) => void;
  onItemSuccess?: (id: string, response: UploadResponse) => void;
  onItemError?: (id: string, error: string) => void;
  onAllComplete?: (results: BatchUploadItem[]) => void;
}

export function useBatchImageUpload(options: UseBatchImageUploadOptions = {}) {
  const {
    maxConcurrent = 3,
    validation,
    compression,
    endpoint,
    onItemProgress,
    onItemSuccess,
    onItemError,
    onAllComplete,
  } = options;

  const [items, setItems] = useState<BatchUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const activeUploadsRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const addFiles = useCallback((files: File[]) => {
    const newItems: BatchUploadItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      fileName: file.name,
      progress: 0,
      status: 'idle' as UploadStatus,
    }));

    setItems((prev) => [...prev, ...newItems]);
    return newItems.map((item) => item.id);
  }, []);

  const removeItem = useCallback((id: string) => {
    // Cancel if uploading
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(id);
    }
    activeUploadsRef.current.delete(id);

    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((item) => item.status !== 'success'));
  }, []);

  const clearAll = useCallback(() => {
    // Cancel all active uploads
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
    activeUploadsRef.current.clear();
    setItems([]);
    setIsUploading(false);
  }, []);

  const uploadItem = useCallback(
    async (item: BatchUploadItem): Promise<void> => {
      const controller = new AbortController();
      abortControllersRef.current.set(item.id, controller);
      activeUploadsRef.current.add(item.id);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'uploading' as UploadStatus, progress: 0 } : i
        )
      );

      try {
        // Validate
        if (validation) {
          const validationResult = await validateImage(item.file, validation);
          if (!validationResult.valid) {
            throw new Error(validationResult.error);
          }
        }

        // Compress
        let compressedFile = item.file;
        if (compression) {
          try {
            compressedFile = await compressImage(item.file, compression);
          } catch {
            console.warn('Image compression failed, using original file');
          }
        }

        // Get auth token
        const session = await getSession();
        const token = session?.accessToken;

        // Create FormData
        const formData = new FormData();
        formData.append('file', compressedFile, item.fileName);

        // Upload with progress
        const response = await new Promise<UploadResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          controller.signal.addEventListener('abort', () => {
            xhr.abort();
          });

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
              );
              onItemProgress?.(item.id, progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response.success && response.data) {
                  resolve(response.data);
                } else {
                  reject(new Error(response.error?.message || 'Upload failed'));
                }
              } catch {
                reject(new Error('Invalid response from server'));
              }
            } else {
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                reject(new Error(errorResponse.error?.message || 'Upload failed'));
              } catch {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
              }
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', `${API_BASE_URL}${endpoint || API_ENDPOINTS.UPLOAD.IMAGE}`);

          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.send(formData);
        });

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'success' as UploadStatus, progress: 100, url: response.url }
              : i
          )
        );
        onItemSuccess?.(item.id, response);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error' as UploadStatus, error: errorMsg }
              : i
          )
        );
        onItemError?.(item.id, errorMsg);
      } finally {
        abortControllersRef.current.delete(item.id);
        activeUploadsRef.current.delete(item.id);
      }
    },
    [validation, compression, endpoint, onItemProgress, onItemSuccess, onItemError]
  );

  const startUpload = useCallback(async () => {
    const pendingItems = items.filter(
      (item) => item.status === 'idle' || item.status === 'error'
    );

    if (pendingItems.length === 0) return;

    setIsUploading(true);

    // Upload with concurrency limit
    const uploadQueue = [...pendingItems];
    const results: BatchUploadItem[] = [];

    const uploadNext = async (): Promise<void> => {
      if (uploadQueue.length === 0) return;

      const item = uploadQueue.shift();
      if (!item) return;

      await uploadItem(item);

      // Get updated item state
      const updatedItem = items.find((i) => i.id === item.id);
      if (updatedItem) {
        results.push(updatedItem);
      }

      // Start next upload
      await uploadNext();
    };

    // Start concurrent uploads
    const workers = Array(Math.min(maxConcurrent, pendingItems.length))
      .fill(null)
      .map(() => uploadNext());

    await Promise.all(workers);

    setIsUploading(false);
    onAllComplete?.(results);
  }, [items, maxConcurrent, uploadItem, onAllComplete]);

  const retryItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item && item.status === 'error') {
        await uploadItem(item);
      }
    },
    [items, uploadItem]
  );

  const cancelItem = useCallback((id: string) => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
    }
  }, []);

  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    setIsUploading(false);
  }, []);

  return {
    items,
    isUploading,
    addFiles,
    removeItem,
    clearCompleted,
    clearAll,
    startUpload,
    retryItem,
    cancelItem,
    cancelAll,
    pendingCount: items.filter((i) => i.status === 'idle').length,
    uploadingCount: items.filter((i) => i.status === 'uploading').length,
    successCount: items.filter((i) => i.status === 'success').length,
    errorCount: items.filter((i) => i.status === 'error').length,
    urls: items.filter((i) => i.url).map((i) => i.url!),
  };
}
