import express from "express";

const wwwPath = process.env.www || "www";
export default express.static(wwwPath);