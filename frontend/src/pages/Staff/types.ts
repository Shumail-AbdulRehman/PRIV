export type CreateStaffInput = {
  name: string;
  email: string;
  password: string;
  locationId?: number;
  shiftStart?: Date;
  shiftEnd?: Date;
};