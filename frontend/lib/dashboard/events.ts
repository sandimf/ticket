import { PostDataRequest, PostDataResponse } from '@/types/events';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiService = {
  async postData(data: PostDataRequest): Promise<PostDataResponse> {
    const response = await fetch(`${API_BASE_URL}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
