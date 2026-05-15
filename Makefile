COVERAGE_DIR := coverage
NODE_MODULES := node_modules
TEST_GLOB := tests/**/*.test.mjs

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)

.PHONY: clean
clean:
	rm -rf $(COVERAGE_DIR)

.PHONY: coverage
coverage: $(NODE_MODULES)
	node scripts/check-coverage.mjs '$(TEST_GLOB)'

.PHONY: format
format: $(NODE_MODULES)
	npx prettier --write .

.PHONY: test
test: $(NODE_MODULES)
	timeout 10 node --test --test-timeout=1000 '$(TEST_GLOB)'

.PHONY: type-coverage
type-coverage: $(NODE_MODULES)
	npx type-coverage --at-least 100 --strict --detail

.PHONY: typecheck
typecheck: $(NODE_MODULES)
	npx tsc
