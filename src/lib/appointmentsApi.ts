import { apiRequest } from '@/lib/apiClient';
import type { AppointmentStatus, ConsultationType, ReminderPreferences } from '@/stores/counselorChatStore';

export interface RemoteAppointment {
  id: string;
  userId: string;
  userName: string;
  clientId: string;
  clientName: string;
  counselorId: string;
  counselorName: string;
  appointmentDate: string;
  slot: string;
  consultationType: ConsultationType;
  reminders: ReminderPreferences;
  status: AppointmentStatus;
  notes?: string;
  persistence: 'remote';
  createdAt: string;
  updatedAt?: string;
}

export const listAppointments = (role: 'user' | 'counselor', participantId: string) =>
  apiRequest<{ appointments: RemoteAppointment[] }>(
    `/api/appointments?role=${encodeURIComponent(role)}&participantId=${encodeURIComponent(participantId)}`,
  );

export const createAppointment = (input: {
  userId: string;
  userName: string;
  counselorId: string;
  appointmentDate: string;
  slot: string;
  consultationType: ConsultationType;
  reminders: ReminderPreferences;
  notes?: string;
}) =>
  apiRequest<{ appointment: RemoteAppointment }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) =>
  apiRequest<{ appointment: RemoteAppointment }>(`/api/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
