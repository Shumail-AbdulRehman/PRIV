export type CreateLocationInput = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
};


export type LocationFormValues = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
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
  status?: string;
  id: number; 
}