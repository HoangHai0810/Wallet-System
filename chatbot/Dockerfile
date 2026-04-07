FROM python:3.12-slim

WORKDIR /app

# Install dependencies first for caching
COPY pyproject.toml .
RUN pip install .

# Copy source code
COPY . .

# Run the FastAPI server
CMD ["python", "src/server.py"]
