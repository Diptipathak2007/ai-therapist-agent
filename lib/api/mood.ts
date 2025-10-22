interface MoodEntry {
  score: number;
  note?: string;
}

interface MoodStats {
  average: number;
  count: number;
  highest: number;
  lowest: number;
  history: Array<{
    _id: string;
    score: number;
    note?: string;
    timestamp: string;
  }>;
}

async function safeFetch(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  const contentType = response.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
    console.warn(`Non-JSON response from ${url}:`, data);
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && data.message
        ? data.message
        : `HTTP error ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function trackMood(data: MoodEntry): Promise<{ success: boolean; data: any }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return safeFetch("/api/mood", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getMoodHistory(params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<{ success: boolean; data: any[] }> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  return safeFetch(`/api/mood/history?${queryParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMoodStats(period: "week" | "month" | "year" = "week"): Promise<{
  success: boolean;
  data: MoodStats;
}> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");

  return safeFetch(`/api/mood/stats?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
