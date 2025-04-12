import { IConfigService } from "../interfaces";
import { Config } from "../models/types";
import fs from "fs";
import path from "path";
import os from "os";

export class ConfigService implements IConfigService {
  private readonly CONFIG_DIR: string;
  private readonly CONFIG_FILE: string;
  private readonly DEFAULT_CONFIG: Config;
  private configCache: Config | null = null;

  constructor() {
    this.CONFIG_DIR = path.join(os.homedir(), ".git-ai-commit");
    this.CONFIG_FILE = path.join(this.CONFIG_DIR, "config.json");
    this.DEFAULT_CONFIG = {
      alwaysAccept: false,
      model: "mistral",
      timeoutSeconds: 30,
    };
  }

  public getConfig(): Config {
    // Return cached config if available
    if (this.configCache) {
      return { ...this.configCache };
    }

    try {
      this.ensureConfigDirectoryExists();

      if (!fs.existsSync(this.CONFIG_FILE)) {
        this.writeConfig(this.DEFAULT_CONFIG);
        this.configCache = { ...this.DEFAULT_CONFIG };
        return { ...this.DEFAULT_CONFIG };
      }

      const configData = fs.readFileSync(this.CONFIG_FILE, "utf-8");

      if (!configData || configData.trim() === "") {
        this.configCache = { ...this.DEFAULT_CONFIG };
        return { ...this.DEFAULT_CONFIG };
      }

      try {
        const config = JSON.parse(configData);
        const mergedConfig = { ...this.DEFAULT_CONFIG, ...config };
        this.configCache = mergedConfig;
        return { ...mergedConfig };
      } catch (error) {
        console.error(
          "Error parsing configuration file. Using default configuration."
        );
        this.configCache = { ...this.DEFAULT_CONFIG };
        return { ...this.DEFAULT_CONFIG };
      }
    } catch (error) {
      console.error("Error reading configuration:", error);
      return { ...this.DEFAULT_CONFIG };
    }
  }

  public updateConfig(newConfig: Partial<Config>): Config {
    try {
      const currentConfig = this.getConfig();
      const updatedConfig = { ...currentConfig, ...newConfig };

      this.writeConfig(updatedConfig);
      this.configCache = { ...updatedConfig };

      return { ...updatedConfig };
    } catch (error) {
      console.error("Error updating configuration:", error);
      return this.getConfig();
    }
  }

  private ensureConfigDirectoryExists(): void {
    if (!fs.existsSync(this.CONFIG_DIR)) {
      fs.mkdirSync(this.CONFIG_DIR, { recursive: true });
    }
  }

  private writeConfig(config: Config): void {
    this.ensureConfigDirectoryExists();
    fs.writeFileSync(this.CONFIG_FILE, JSON.stringify(config, null, 2));
  }
}
