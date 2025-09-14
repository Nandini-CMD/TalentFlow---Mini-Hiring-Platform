// API client functions for making requests to our mock API

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
  }
}

// Jobs API
export const jobsApi = {
  async getAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return request<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/jobs${query ? `?${query}` : ''}`);
  },

  async getById(id: number) {
    return request<any>(`/api/jobs/${id}`);
  },

  async create(data: any) {
    return request<any>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: any) {
    return request<any>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return request<void>(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Candidates API
export const candidatesApi = {
  async getAll(params: {
    page?: number;
    limit?: number;
    stage?: string;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return request<{
      data: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/candidates${query ? `?${query}` : ''}`);
  },

  async getById(id: number) {
    return request<any>(`/api/candidates/${id}`);
  },

  async create(data: any) {
    return request<any>('/api/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: any) {
    return request<any>(`/api/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateStage(id: number, stage: string) {
    return this.update(id, { stage });
  },
};

// Assessments API
export const assessmentsApi = {
  async getAll() {
    return request<{ data: any[] }>('/api/assessments');
  },

  async getById(id: number) {
    return request<any>(`/api/assessments/${id}`);
  },

  async create(data: any) {
    return request<any>('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: any) {
    return request<any>(`/api/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return request<void>(`/api/assessments/${id}`, {
      method: 'DELETE',
    });
  },
};