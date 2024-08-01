import express from "express";
const router = express.Router();

router.use("*", (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();

});

export default router;