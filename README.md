# Git AI Commit

[![npm version](https://badge.fury.io/js/git-ai-commit.svg)](https://badge.fury.io/js/git-ai-commit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Generate concise Git commit messages using the power of local AI models with Ollama.**

`git-ai-commit` analyzes your staged changes and uses a local large language model (LLM) via [Ollama](https://ollama.com/) to suggest a relevant and brief commit message. Streamline your workflow and let AI handle the first draft of your commit messages!

## Installation

Install the package globally using npm:

```bash
npm install -g git-ai-commit
```

The installation process automatically runs a setup script that:

1.  Checks if Git is installed.
2.  Sets up a global Git alias: `git aic` which executes `git-ai-commit`.

You can now use `git aic` in any Git repository on your system.

## Features

- ✨ **AI-Powered Commits**: Leverages local LLMs through Ollama for message generation.
- 🏡 **Local First**: Keep your code private. No data is sent to external servers (besides your local Ollama instance).
- 🚀 **Simple Workflow**: Integrates seamlessly with your Git process via a handy alias (`git aic`).
- ⚙️ **Configurable**: Choose your preferred Ollama model, set timeouts, customize prompts, and decide whether to auto-accept suggestions.
- 🤖 **Automatic Setup**: Installs a convenient `git aic` alias during setup.
- ✅ **Interactive Confirmation**: Review and confirm the generated message before committing (configurable).

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Git**: [Download Git](https://git-scm.com/downloads)
2.  **Node.js**: (Version 16 or higher recommended) [Download Node.js](https://nodejs.org/)
3.  **Ollama**: Needs to be installed and running.
    - [Download Ollama](https://ollama.com/download)
    - **Important:** Make sure the Ollama server is running before using `git-ai-commit`. You can typically start it by running `ollama serve` in your terminal.
    - Ensure you have pulled at least one model (e.g., `ollama pull llama3:8b`).

## Usage

Using `git-ai-commit` is straightforward:

1.  **Stage your changes**: Make your code changes and stage them using `git add`.

    ```bash
    # Example: Stage all changes
    git add .
    ```

    ```bash
    # Example: Stage specific files
    git add src/feature.js src/utils.js
    ```

2.  **Generate the commit message**: Run the `git aic` command.

    ```bash
    git aic
    ```

3.  **Review and Confirm**:

    - The tool will connect to your running Ollama instance, analyze the staged diff, and generate a commit message.
    - It will display the suggested message and ask for your confirmation.
    - Press `Enter` (or `y` then `Enter`) to accept and commit.
    - Press `n` then `Enter` to abort the commit.

    _(You can disable the confirmation step via configuration - see below)_

**Alternative Commands:**

You can also invoke the tool directly:

```bash
# Equivalent to 'git aic'
git-ai-commit

# Explicitly use the 'commit' command (same as default)
git-ai-commit commit
```

## Configuration

You can customize `git-ai-commit`'s behavior using the `config` command:

```bash
git aic config
# or directly via
git-ai-commit config
```

This will launch an interactive prompt allowing you to configure:

- **Model Selection**: Choose which Ollama model to use (e.g., `llama3:8b`, `mistral`). It attempts to list models available locally if Ollama is running. Ideally choosing a model that will run comfortably on your machine.
- **Always Accept**: Set to `true` to skip the confirmation step and automatically use the generated commit message. Defaults to `false`.
- **Timeout**: Set the timeout (in seconds) for requests to the Ollama API. Increase this if you use larger models or have slower hardware. Defaults to 30 seconds.
- **Custom Prompt**: Allows you to provide your own prompt template for generating commit messages. You can edit the prompt directly in your default text editor.

Your configuration is saved in `~/.git-ai-commit/config.json`.

## Troubleshooting

- **Error: Ollama is not installed**: Make sure you have installed Ollama correctly. See [Prerequisites](#prerequisites).
- **Error: Ollama is not running**: Start the Ollama server, usually by running `ollama serve` in your terminal.
- **Error: Request timed out / Ollama is taking too long**:
  - Your selected model might be too large for your system or the changes are too complex.
  - Try configuring a smaller model (e.g., `llama3:8b` instead of `llama3:70b`) using `git-ai-commit config`.
  - Increase the timeout using `git-ai-commit config`.
- **Error: Failed to fetch available models**: This might happen if Ollama isn't running or accessible when you run `git-ai-commit config`. You can still manually type the name of a model you know you have installed.

## Clone and run locally

If you want to clone and run the tool locally:

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Build the TypeScript code: `npm run build`
4.  Link the tool for using `npm link`
5.  Run the CLI: `git aic <command>`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if applicable, otherwise state MIT License).
