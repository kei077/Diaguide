import axios from "axios";
import { Notification } from "@/types";

const BASE = "http://localhost:8000/api/notifications/";

export async function fetchNotifications(token: string): Promise<Notification[]> {
  const { data } = await axios.get<Notification[]>(BASE, {
    headers: { Authorization: `Token ${token}` },
  });
  return data;
}

export async function markNotificationAsRead(token: string, id: number): Promise<void> {
  await axios.patch(
    `${BASE}${id}/mark-read/`,
    {},
    { headers: { Authorization: `Token ${token}` } }
  );
}
