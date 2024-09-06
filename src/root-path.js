import path from "path";
import { fileURLToPath } from "url";

// Convierte import.meta.url a una ruta de archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define la ruta raíz del proyecto
export const rootPath = path.resolve(__dirname, "..");

console.log("ROOT PATH", rootPath);