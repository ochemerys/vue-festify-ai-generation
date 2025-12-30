# Run PostgreSQL Server in Docker Container

```bash
 docker run --name postgres-container \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=mySecretpa$$w0rd \
  -e POSTGRES_DB=org_inventory \
  -p 5432:5432 \
  -d postgres
```