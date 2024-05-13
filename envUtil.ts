import * as fs from "fs";

export function updateEnvFile(filePath, newData) {
  try {
    let existingData = "";
    if (fs.existsSync(filePath)) {
      existingData = fs.readFileSync(filePath, "utf8");
    }

    const mergedData = mergeEnvData(existingData, newData);

    fs.writeFileSync(filePath, mergedData);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

function mergeEnvData(existingData, newData) {
  const existingEnv = parseEnvData(existingData);
  const newEnv = parseEnvData(newData);

  const mergedEnv = { ...existingEnv, ...newEnv };
  const mergedData = Object.entries(mergedEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return mergedData;
}

function parseEnvData(data) {
  return data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && line.includes("="))
    .reduce((env, line) => {
      const [key, value] = line.split("=");
      env[key] = value;
      return env;
    }, {});
}
