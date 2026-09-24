export type CreateLocationInput = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  timezone?: string;
};


export type LocationFormValues = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  timezone: string;
};

export type AssignShiftInput = {
  shiftStart: Date;
  shiftEnd: Date;
};



export type LocationWithCounts = {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  timezone: string;
  radiusMeters: number;
  isActive: boolean;
  status: string; 
  _count: {
    staff: number;
    taskTemplates: number;
  };
};


export interface LocationCardProps {
  name?: string;
  address?: string;
  staff?: number;
  taskTemplate?: number;
  lat?: string;
  lng?: string;
  geofence?: string;
  timezone?: string;
  status?: string;
  id: number; 
}

export interface LocationStaff {
  id: number;
  name: string;
  email: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  isActive: boolean;
}

export interface ReferenceImage {
  id: number;
  name: string;
  imageUrl: string;
  sortOrder: number;
}

export interface TaskTemplate {
  id: number;
  title: string;
  description?: string | null;
  staffId?: number | null;
  staff?: { name: string } | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  recurringType?: "DAILY" | "ONCE";
  effectiveDate?: string | null;
  isActive?: boolean;
  qrToken?: string | null;
  referenceImageUrl?: string | null;
  referenceImages?: ReferenceImage[];
}
