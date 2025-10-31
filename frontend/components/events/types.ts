export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type CategoriesResponse = {
  status: string;
  message: string;
  data: Category[];
};

export type EventResponse = {
  status: string;
  message: string;
  data: any;
};

export type EventFormData = {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  categoryId: string;
};

export type EventFormProps = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};
