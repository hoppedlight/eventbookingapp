const API_URL = 'http://localhost:5000/api';

export const api = {
  events: {
    list: async () => {
      const res = await fetch(`${API_URL}/events`);
      return res.json();
    },
    filter: async (filters, sort = '-created_date') => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      if (sort) params.append('sort', sort);
      const res = await fetch(`${API_URL}/events?${params}`);
      return res.json();
    },
    create: async (data) => {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    }
  },

  bookings: {
    create: async (data) => {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },

  auth: {
    me: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      return data;
    },
    register: async (email, password, full_name) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name })
      });
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
    updateMe: async (data) => {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    redirectToLogin: (nextUrl) => {
      window.location.href = '/login' + (nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : '');
    },
    isAuthenticated: async () => {
      try {
        await api.auth.me();
        return true;
      } catch {
        return false;
      }
    }
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        const data = await res.json();
        return { file_url: data.url };
      }
    }
  }
};
