import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { NextApiRequest, NextApiResponse } from "next";

// Swagger definition
const swaggerDefinition = {
     openapi: "3.0.0",
     info: {
     title: "Civic Signal API Documentation",
     version: "1.0.0",
     description: "API documentation for Civic Signal backend",
     },
     servers: [
     {
          url: "http://localhost:3000/api",
          description: "Local server",
     },
     ],
};

// Options for swagger-jsdoc
const options = {
     swaggerDefinition,
     apis: ["./**/*.ts"], // Adjust the path to include all API route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// API handler for Swagger UI
export default function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "GET") {
     swaggerUi.setup(swaggerSpec)(req, res);
     } else {
     res.status(405).json({ message: "Method not allowed" });
     }
}
