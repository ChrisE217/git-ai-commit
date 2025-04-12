import { ILanguageModelService, IConsoleService } from "../interfaces";
import { GenerationOptions, OllamaApiResponse } from "../models/types";
import { exec } from "child_process";
import { promisify } from "util";
import http from "http";
import fs from "fs";
import path from "path";
import os from "os";

export class OllamaService implements ILanguageModelService {
  private readonly API_HOST = "localhost";
  private readonly API_PORT = 11434;
  private readonly execAsync = promisify(exec);

  constructor(private readonly consoleService: IConsoleService) {}

  public async isInstalled(): Promise<boolean> {
    try {
      await this.execAsync("which ollama");
      return true;
    } catch (error) {
      return false;
    }
  }

  public async isRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: this.API_HOST,
          port: this.API_PORT,
          path: "/api/version",
          method: "GET",
          timeout: 2000,
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );

      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  public async generateText(
    prompt: string,
    options: GenerationOptions
  ): Promise<string> {
    // Use CLI
    try {
      this.consoleService.debug("Attempting CLI generation");
      const cliResult = await this.generateWithCli(prompt, options);
      if (cliResult) {
        return cliResult;
      }
    } catch (error) {
      this.consoleService.debug("CLI generation failed:", error);
    }

    // Fallback to API
    try {
      this.consoleService.debug("Attempting API generation");
      if (!(await this.isRunning())) {
        throw new Error(
          "Ollama is not running. Please start it with 'ollama serve'"
        );
      }
      return await this.generateWithApi(prompt, options);
    } catch (error) {
      throw this.enhanceError(error, "Failed to generate text with Ollama");
    }
  }

  public async listAvailableModels(): Promise<string[]> {
    try {
      return await this.fetchModelsFromApi();
    } catch (error) {
      throw this.enhanceError(error, "Failed to list available models");
    }
  }

  private async generateWithCli(
    prompt: string,
    options: GenerationOptions
  ): Promise<string> {
    const { stdout: modelList } = await this.execAsync("ollama list", {
      timeout: 5000,
    });
    this.consoleService.debug("Available models:", modelList);

    const tempFile = this.createTempPromptFile(prompt);

    try {
      const command = `ollama run ${options.model} < "${tempFile}"`;
      this.consoleService.debug("CLI command:", command);

      const { stdout } = await this.execAsync(command, {
        timeout: options.timeout,
        maxBuffer: 1024 * 1024,
      });

      return stdout.trim();
    } finally {
      this.deleteTempFile(tempFile);
    }
  }

  private createTempPromptFile(prompt: string): string {
    const tempDir = os.tmpdir();
    const tempFile = path.join(
      tempDir,
      `git-ai-commit-prompt-${Date.now()}.txt`
    );
    fs.writeFileSync(tempFile, prompt);
    this.consoleService.debug("Created temp file:", tempFile);
    return tempFile;
  }

  private deleteTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.consoleService.debug("Deleted temp file:", filePath);
      }
    } catch (error) {
      this.consoleService.debug("Failed to delete temp file:", error);
    }
  }

  private async generateWithApi(
    prompt: string,
    options: GenerationOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reqData = JSON.stringify({
        model: options.model,
        prompt: prompt,
        stream: false,
      });

      const req = http.request(
        {
          hostname: this.API_HOST,
          port: this.API_PORT,
          path: "/api/generate",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(reqData),
          },
          timeout: options.timeout,
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              if (res.statusCode !== 200) {
                reject(new Error(`HTTP error: ${res.statusCode} ${data}`));
                return;
              }

              const response = JSON.parse(data) as OllamaApiResponse;
              if (response.error) {
                reject(new Error(`Ollama API error: ${response.error}`));
                return;
              }

              resolve(response.response);
            } catch (e) {
              reject(new Error(`Error parsing response: ${e}`));
            }
          });
        }
      );

      req.on("error", (e) => {
        reject(new Error(`Request error: ${e.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timed out after ${options.timeout}ms`));
      });

      req.write(reqData);
      req.end();
    });
  }

  private async fetchModelsFromApi(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: this.API_HOST,
          port: this.API_PORT,
          path: "/api/tags",
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              if (res.statusCode !== 200) {
                reject(new Error(`HTTP error: ${res.statusCode} ${data}`));
                return;
              }

              const response = JSON.parse(data);
              if (response.error) {
                reject(new Error(`Ollama API error: ${response.error}`));
                return;
              }

              if (!response.models || !Array.isArray(response.models)) {
                resolve([]);
                return;
              }

              const modelNames = response.models.map(
                (model: any) => model.name as string
              );
              resolve(modelNames);
            } catch (e) {
              reject(new Error(`Error parsing models response: ${e}`));
            }
          });
        }
      );

      req.on("error", (e) => {
        reject(new Error(`Request error listing models: ${e.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out listing models"));
      });

      req.end();
    });
  }

  private enhanceError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      error.message = `${context}: ${error.message}`;
      return error;
    }
    return new Error(`${context}: ${String(error)}`);
  }
}
