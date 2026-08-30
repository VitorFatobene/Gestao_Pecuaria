## Primeiro administrador

O cadastro publico `POST /usuarios` sempre cria usuarios com role `USER`.
Para criar o primeiro administrador em ambiente de desenvolvimento, promova um usuario diretamente no banco:

```sql
UPDATE usuario
SET role = 'ADMIN'
WHERE email = 'admin@email.com';
```

Nao existe endpoint publico para promover usuarios.
