import fs from "fs";
import path from "path";

const serviceName = process.argv[2];

if (!serviceName) {
  console.error("Provide service name");
  process.exit(1);
}

const basePath = path.join("src", "modules", serviceName);

if (fs.existsSync(basePath)) {
  console.error("Service already exists");
  process.exit(1);
}

fs.mkdirSync(basePath, { recursive: true });

const cap = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

// ---------------- FILE TEMPLATES ----------------

// MODEL
const model = `
import mongoose, { Schema } from "mongoose";

const ${serviceName}Schema = new Schema({}, { timestamps: true });

export const ${cap}Model = mongoose.model("${cap}", ${serviceName}Schema);
`;

// SERVICE
const service = `
import { ${cap}Model } from "./${serviceName}.model";

export const create${cap} = async (data: any) => {
  return ${cap}Model.create(data);
};

export const getAll${cap} = async () => {
  return ${cap}Model.find();
};

export const get${cap}ById = async (id: string) => {
  return ${cap}Model.findById(id);
};

export const update${cap} = async (id: string, data: any) => {
  return ${cap}Model.findByIdAndUpdate(id, data, { new: true });
};

export const delete${cap} = async (id: string) => {
  return ${cap}Model.findByIdAndDelete(id);
};
`;

// CONTROLLER
const controller = `
import { Request, Response, NextFunction } from "express";
import * as service from "./${serviceName}.service";

export const create${cap}Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.create${cap}(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAll${cap}Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getAll${cap}();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const get${cap}ByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.get${cap}ById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const update${cap}Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.update${cap}(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const delete${cap}Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.delete${cap}(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
`;

// ROUTES (Named Export)
const routes = `
import { Router } from "express";
import {
  create${cap}Controller,
  getAll${cap}Controller,
  get${cap}ByIdController,
  update${cap}Controller,
  delete${cap}Controller
} from "./${serviceName}.controller";

export const ${serviceName}Router = Router();

${serviceName}Router.post("/", create${cap}Controller);
${serviceName}Router.get("/", getAll${cap}Controller);
${serviceName}Router.get("/:id", get${cap}ByIdController);
${serviceName}Router.patch("/:id", update${cap}Controller);
${serviceName}Router.delete("/:id", delete${cap}Controller);
`;

// DTO
const dto = `
import { z } from "zod";

export const create${cap}DTO = z.object({});
`;

// ENUM
const enumFile = `
export enum ${cap}Status {
  ACTIVE = "active",
  INACTIVE = "inactive"
}
`;

// INTERFACE
const interfaceFile = `
export interface I${cap} {}
`;

// ---------------- WRITE FILES ----------------

fs.writeFileSync(path.join(basePath, `${serviceName}.model.ts`), model);
fs.writeFileSync(path.join(basePath, `${serviceName}.service.ts`), service);
fs.writeFileSync(path.join(basePath, `${serviceName}.controller.ts`), controller);
fs.writeFileSync(path.join(basePath, `${serviceName}.routes.ts`), routes);
fs.writeFileSync(path.join(basePath, `${serviceName}.dto.ts`), dto);
fs.writeFileSync(path.join(basePath, `${serviceName}.enum.ts`), enumFile);
fs.writeFileSync(path.join(basePath, `${serviceName}.interface.ts`), interfaceFile);

// ---------------- MODIFY app.ts ----------------

const appPath = path.join("src", "app.ts");
let appContent = fs.readFileSync(appPath, "utf-8");

const importLine = `import { ${serviceName}Router } from "./modules/${serviceName}/${serviceName}.routes";`;
const routeLine = `app.use("/api/${serviceName}", ${serviceName}Router);`;

if (!appContent.includes(importLine)) {
  appContent = appContent.replace("// AUTO-IMPORTS", `// AUTO-IMPORTS\n${importLine}`);
}

if (!appContent.includes(routeLine)) {
  appContent = appContent.replace("// AUTO-ROUTES", `// AUTO-ROUTES\n${routeLine}`);
}

fs.writeFileSync(appPath, appContent);

console.log(`Service '${serviceName}' created successfully`);
