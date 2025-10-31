import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { apiService } from '@/lib';
import { PostDataRequest, PostDataResponse, ApiError } from '@/types/events';

export const usePostData = (): UseMutationResult<
  PostDataResponse,
  ApiError,
  PostDataRequest
> => {
  return useMutation<PostDataResponse, ApiError, PostDataRequest>({
    mutationFn: (data: PostDataRequest) => apiService.postData(data),
    onSuccess: (data) => {
      console.log('Data berhasil dikirim:', data);
    },
    onError: (error) => {
      console.error('Gagal mengirim data:', error);
    },
  });
};
