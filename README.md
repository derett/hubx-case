# Hubx Backend Developer Case

[About Assignment](AboutAssignment.md)

## Installation

```bash
npm install
```

## Configuration

Two configuration files are available as `.env` for running on local setups and `.docker.env` file to be used for Docker setup.

Because there is no secret information yet I didn't include these files into `.gitignore`

## Running the Application

### Local Environment

```bash
npm run start
```

### Docker

If not build yet

```bash
npm run build
```

```bash
docker compose up
```

## Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage unit tests
$ npm run test:cov

# test coverage e2e tests
$ npm run test:e2e:cov
```

## Swagger Documentation

Swagger Documentation is available. You can access it after application initialized from `/doc` endpoint.

## Postman Collection

A testable Postman collection is available. [Collection](HubxCase.postman_collection.json)
