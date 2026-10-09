import type {
  FormDetail,
  FormSummary,
  NewQuestion,
  PublicForm,
  Question,
  QuestionChanges,
  ResponseDetail,
  ResponseList,
  ResultsSummary,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the backend running?", 0);
  }

  if (!response.ok) {
    let message = "Something went wrong";
    let errors: Record<string, string> | undefined;

    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (Array.isArray(data.detail)) message = data.detail[0]?.msg ?? message;
      errors = data.errors;
    } catch {
      message = "Something went wrong";
    }

    throw new ApiError(message, response.status, errors);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

const toJson = (body: unknown) => JSON.stringify(body);

export const api = {
  exportUrl: (formId: number) => `${BASE_URL}/api/forms/${formId}/responses/export`,

  listForms: () => request<FormSummary[]>("/api/forms"),

  getForm: (id: number) => request<FormDetail>(`/api/forms/${id}`),

  createForm: (title: string) =>
    request<FormDetail>("/api/forms", { method: "POST", body: toJson({ title }) }),

  updateForm: (id: number, data: { title?: string; thank_you_message?: string }) =>
    request<FormDetail>(`/api/forms/${id}`, { method: "PATCH", body: toJson(data) }),

  deleteForm: (id: number) => request<void>(`/api/forms/${id}`, { method: "DELETE" }),

  duplicateForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/duplicate`, { method: "POST" }),

  publishForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/publish`, { method: "POST" }),

  unpublishForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/unpublish`, { method: "POST" }),

  createQuestion: (formId: number, question: NewQuestion) =>
    request<Question>(`/api/forms/${formId}/questions`, {
      method: "POST",
      body: toJson(question),
    }),

  updateQuestion: (id: number, changes: QuestionChanges) =>
    request<Question>(`/api/questions/${id}`, { method: "PATCH", body: toJson(changes) }),

  deleteQuestion: (id: number) => request<void>(`/api/questions/${id}`, { method: "DELETE" }),

  reorderQuestions: (formId: number, questionIds: number[]) =>
    request<Question[]>(`/api/forms/${formId}/questions/order`, {
      method: "PUT",
      body: toJson({ question_ids: questionIds }),
    }),

  getPublicForm: (slug: string) => request<PublicForm>(`/api/public/forms/${slug}`),

  submitResponse: (slug: string, answers: { question_id: number; value: string }[]) =>
    request<{ id: number; thank_you_message: string }>(`/api/public/forms/${slug}/responses`, {
      method: "POST",
      body: toJson({ answers }),
    }),

  listResponses: (formId: number) => request<ResponseList>(`/api/forms/${formId}/responses`),

  getResponse: (id: number) => request<ResponseDetail>(`/api/responses/${id}`),

  deleteResponse: (id: number) => request<void>(`/api/responses/${id}`, { method: "DELETE" }),

  getSummary: (formId: number) => request<ResultsSummary>(`/api/forms/${formId}/summary`),
};
