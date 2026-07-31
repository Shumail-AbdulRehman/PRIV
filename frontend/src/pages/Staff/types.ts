export type CreateStaffInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  locationId?: number;
  shiftStart?: Date;
  shiftEnd?: Date;
};
