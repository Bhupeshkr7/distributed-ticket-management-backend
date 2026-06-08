import fs from "fs";
import path from "path";
import readline from "readline";

const serviceName = process.argv[2];

if (!serviceName) {
  console.error("Provide service name");
  process.exit(1);
}

const basePath = path.join("src", "modules", serviceName);

if (!fs.existsSync(basePath)) {
  console.error("Service does not exist");
  process.exit(1);
}

// Confirm prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`Are you sure you want to delete '${serviceName}'? (y/n): `, (answer) => {
  if (answer.toLowerCase() !== "y") {
    console.log("Cancelled");
    rl.close();
    return;
  }

  try {
    // 1. Remove folder
    fs.rmSync(basePath, { recursive: true, force: true });

    // 2. Update app.ts
    const appPath = path.join("src", "app.ts");
    let appContent = fs.readFileSync(appPath, "utf-8");

    const importRegex = new RegExp(
      `import\\s+\\{\\s*${serviceName}Router\\s*\\}\\s+from\\s+"\\.\\/modules\\/${serviceName}\\/${serviceName}\\.routes";?\\n?`,
      "g"
    );

    const routeRegex = new RegExp(
      `app\\.use\\("\\/api\\/${serviceName}",\\s*${serviceName}Router\\);?\\n?`,
      "g"
    );

    appContent = appContent.replace(importRegex, "");
    appContent = appContent.replace(routeRegex, "");

    fs.writeFileSync(appPath, appContent);

    console.log(`Service '${serviceName}' removed successfully`);
  } catch (error) {
    console.error("Error removing service:", error);
  }

  rl.close();
});
