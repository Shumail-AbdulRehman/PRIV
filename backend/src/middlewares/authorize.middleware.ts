import {Response,Request,NextFunction} from "express";
import { ApiError } from "../utils/ApiError.js";

const authorize=(req:Request,res:Response,next:NextFunction)=>{

    if((req as any).user.role !== "MANAGER")
    {
        throw new ApiError(403,"Not authorized only Manager can access this resource");
    }
    else
    {
        next();
    }
}

export default authorize;