// multer is used to handle images we send from frontend 

import multer from "multer";

export const upload=multer({storage:multer.diskStorage({})})