import express from "express";
import fs from "fs";
import { join } from "path";

import staticRoute from "./routes/300.static.js";

const port = process.env.port || 8000;

const app = express();


const server = app.listen(port, "0.0.0.0", () => {
    console.log(`server is running on port ${port}`);
});

const stop = () => {
    server.close();
    process.exit();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

const loadRoutes = async (path = process.env.routes || "src/routes") => {
    if(!fs.existsSync(path)) return;

    const contents = fs.readdirSync(path).sort();
    for(const aFile of contents)  {
        const fullPath = join(process.cwd(), path, aFile);
        const {default: route} = await import(fullPath);
        app.use(route);
    }
}

loadRoutes();
