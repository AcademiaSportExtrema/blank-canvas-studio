

## Diagnóstico

O erro **"Bucket not found"** ocorre porque o código tenta fazer upload para o bucket de Storage `uploads` no Supabase, mas esse bucket não existe. Não há nenhum bucket configurado no projeto.

## Plano

### 1. Criar o bucket de Storage `uploads`

Criar uma migration SQL que:
- Cria o bucket `uploads` (privado, pois contém dados de empresas)
- Configura políticas RLS no `storage.objects` para que:
  - Usuários autenticados possam fazer upload dentro da pasta da sua empresa (`empresa_id/`)
  - Admins e super_admins possam ler/gerenciar arquivos da sua empresa
  - O service role (usado pela Edge Function) já tem acesso total por padrão

### 2. Verificar a Edge Function `upload-importar-xls`

A função já está correta -- faz download do arquivo do bucket `uploads` via service role e processa o Excel com mapeamento de colunas. Nenhuma alteração necessária.

### Arquivos alterados
- Nova migration SQL: criar bucket `uploads` + políticas RLS de storage

