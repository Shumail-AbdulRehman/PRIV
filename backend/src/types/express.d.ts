declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                name: string;
                email: string;
                companyId: number;
                role: "MANAGER" | "STAFF";
                locationId?: number;
            };
        }
    }
}

export { };
