.PHONY: help test test-unit test-integration test-all clean install install-dev lint format

help:
	@echo "Available commands:"
	@echo "  install     Install production dependencies"
	@echo "  install-dev Install development dependencies"
	@echo "  test        Run all tests"
	@echo "  test-unit   Run unit tests only"
	@echo "  test-integration Run integration tests only"
	@echo "  lint        Run linting"
	@echo "  format      Format code"
	@echo "  clean       Clean up cache and coverage files"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements.txt
	pip install -r requirements-test.txt

test:
	pytest

test-unit:
	pytest -m "unit"

test-integration:
	pytest -m "integration"

test-all:
	pytest -v --cov=app --cov-report=html --cov-report=term-missing

lint:
	flake8 app tests
	mypy app

format:
	black app tests
	isort app tests

clean:
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .pytest_cache/
	rm -rf **/__pycache__/
	find . -name "*.pyc" -delete
