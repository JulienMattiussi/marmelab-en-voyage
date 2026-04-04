.PHONY: help install dev build preview lint typecheck test test-unit test-watch test-e2e test-e2e-ui

help: ## Display available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies (yarn + Playwright browsers)
	yarn install
	yarn playwright install --with-deps

dev: ## Start the development server
	yarn dev

build: ## Build for production
	yarn build

preview: ## Preview the production build (requires build first)
	yarn preview

lint: ## Run ESLint
	yarn eslint .

typecheck: ## Run TypeScript type checking
	yarn vue-tsc --noEmit

test: test-unit test-e2e ## Run all tests (unit + e2e)

test-unit: ## Run unit tests once
	yarn vitest run

test-watch: ## Run unit tests in watch mode
	yarn vitest

test-e2e: ## Run end-to-end tests (starts dev server automatically)
	yarn playwright test

test-e2e-ui: ## Run end-to-end tests with Playwright UI
	yarn playwright test --ui
