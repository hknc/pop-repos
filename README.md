# Popular Repos

A backend application for discovering popular repositories on GitHub.

## How does it work?

This highly scalable and performant application serves list of GitHub repos sorted by number of stars.

Response times: `~10ms` at any time.

- Service can return the most popular repositories created from specific time points onwards:

  - all time (default)
  - a day ago
  - a week ago
  - a month ago
  - a year ago

- [CronService](src/cron/CronService.ts) periodically makes Github API calls and refreshes list of popular repos.
  - [MasterElector](src/utils/MasterElector.ts) makes sure that only one instance of workers doing the cron jobs.
- [ReposCache](src/caches/ReposCache.ts) caches API responses to Redis (with persistence).
- `/repos` endpoint serves already cached results.
  - query paramaters:
    - created=day|week|month|year|allTime
    - limit=10|50|100
    - language="string"
  - example: `https://pop-repos.herokuapp.com/repos?language=python&created=year&limit=50`

### Online Demo

[Online Demo -> https://pop-repos.herokuapp.com/](https://pop-repos.herokuapp.com/repos)

## Development setup

### Firing up development environment

```sh
docker-compose -f local.yml build
docker-compose -f local.yml up
```

### Tests

```sh
yarn test
yarn test:watch
```

## Build

```sh
yarn build
```

## License

[MIT](LICENSE)
