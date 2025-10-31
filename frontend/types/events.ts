export interface PostDataRequest {
  key: string;
}

export interface PostDataResponse {
  message: string;
  data: {
    key: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}
