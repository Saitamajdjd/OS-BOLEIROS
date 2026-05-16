# Os Boleiro - Site de Vendas

## Atualizações Recentes

### Segurança Implementada
- **Timeout de sessão**: Admin faz logout automático após 30 minutos de inatividade
- **Modal de confirmação**: Substituído `window.confirm()` por modal visual personalizada
- **Proteção de rotas**: Painel admin protegido com verificação de autenticação
- **Validação de uploads**: Verificação de tipo (JPG, JPEG, PNG) e tamanho (5MB máx)
- **Limpeza de dados**: Telefone e número personalizado validados antes do envio

### Arquivos Criados
- `src/hooks/useAdminSessionTimeout.js` - Hook para timeout de sessão
- `src/components/ConfirmModal.jsx` - Modal de confirmação reutilizável

---

## Como rodar o projeto

```bash
npm install
npm run dev
```

O site estará disponível em `http://localhost:5173`

## Configuração do Supabase

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote as credenciais:
   - **Project URL**: Encontrado em Project Settings > API
   - **anon public key**: Encontrado em Project Settings > API > Project API keys

### 2. Criar tabelas

No painel do Supabase, vá em **SQL Editor** e execute:

```sql
-- ============================================
-- TABELA DE PEDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL DEFAULT '00000000000',
  tamanho_camisa TEXT NOT NULL,
  deseja_short BOOLEAN DEFAULT false,
  tamanho_short TEXT,
  sexo_short TEXT,
  nome_personalizado TEXT,
  numero_personalizado TEXT,
  observacao TEXT,
  valor_total NUMERIC DEFAULT 50,
  pago BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE CONFIGURAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY,
  preco_camisa NUMERIC DEFAULT 50,
  preco_short NUMERIC DEFAULT 35,
  preco_combo NUMERIC DEFAULT 85,
  imagem_camisa TEXT,
  imagem_short TEXT,
  numero_whatsapp TEXT
);

-- Inserir configurações padrão (apenas se não existir)
INSERT INTO configuracoes (id, preco_camisa, preco_short, preco_combo, numero_whatsapp)
VALUES (1, 50, 35, 85, '')
ON CONFLICT (id) DO NOTHING;

-- Se a tabela já existe, adicione o campo:
-- ALTER TABLE configuracoes ADD COLUMN numero_whatsapp TEXT;

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES DE SEGURANÇA - PEDIDOS
-- ============================================

-- Permitir leitura pública de pedidos
CREATE POLICY "pedidos_selecionar" ON pedidos
FOR SELECT USING (true);

-- Permitir insert público (clientes podem fazer pedidos)
CREATE POLICY "pedidos_inserir" ON pedidos
FOR INSERT WITH CHECK (true);

-- Permitir update apenas para usuários autenticados
CREATE POLICY "pedidos_atualizar" ON pedidos
FOR UPDATE USING (
  auth.role() = 'authenticated'
);

-- Permitir delete apenas para usuários autenticados
CREATE POLICY "pedidos_deletar" ON pedidos
FOR DELETE USING (
  auth.role() = 'authenticated'
);

-- ============================================
-- POLICIES DE SEGURANÇA - CONFIGURAÇÕES
-- ============================================

-- Permitir leitura pública das configurações
CREATE POLICY "config_selecionar" ON configuracoes
FOR SELECT USING (true);

-- Permitir update apenas para usuários autenticados
CREATE POLICY "config_atualizar" ON configuracoes
FOR UPDATE USING (
  auth.role() = 'authenticated'
);
```

### 3. Configurar Storage (Imagens)

1. Vá em **Storage** > **New bucket**
2. Configure:
   - **Name**: `imagens-produtos`
   - **Public bucket**: Ative (marcado)
   - **File size limit**: 5MB (recomendado)
   - **Allowed file types**: Images only

3. Após criar o bucket, vá na aba **Policies** e adicione:

```sql
-- Policy para qualquer um ler imagens
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'imagens-produtos' );

-- Policy para usuários autenticados fazerem upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated'
);

-- Policy para usuários autenticados deletarem
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated'
);
```

### 4. Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Ative **Email** (Password provider)
3. Configure:
   - **Enable email confirmations**: Desativado (ou ative se quiser confirmação por email)
   - **Enable secure password**: Ativado
   - **Minimum password length**: 6

4. Vá em **Authentication** > **Users**
5. Crie seu usuário admin manualmente ou use o formulário de signup na página `/admin`

### 5. Conectar ao projeto

Crie um arquivo `.env` no diretório raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

Substitua pelos valores do seu projeto Supabase.

## Estrutura de Segurança

### Tabela `pedidos`
- **Leitura**: Qualquer pessoa pode ver (para relatórios)
- **Insert**: Qualquer pessoa pode criar pedidos (clientes)
- **Update/Delete**: Apenas usuários autenticados (admin)

### Tabela `configurações`
- **Leitura**: Qualquer pessoa pode ler (para exibir preços/imagens)
- **Update**: Apenas usuários autenticados (admin)

### Storage `imagens-produtos`
- **Leitura**: Qualquer pessoa pode ver as imagens
- **Upload/Delete**: Apenas usuários autenticados (admin)

## Como usar

### Cliente
1. Acesse a página inicial
2. Preencha os dados do pedido
3. Escolha tamanho, se quer short, personalização
4. O valor total é calculado automaticamente
5. Clique em "Comprar pelo WhatsApp" para enviar ao vendedor

### Administrador
1. Acesse `/admin`
2. Faça login com email e senha
3. No painel você pode:
   - Ver todos os pedidos
   - Filtrar por pago/pendente, tamanho, sexo
   - Criar novos pedidos
   - Editar/excluir pedidos
   - Marcar como pago/pendente
   - Editar os preços (botão "Editar Preços" no topo)
   - Editar imagens dos produtos
   - Importar lista de Excel
   - Baixar relatórios em Excel

## Deploy no GitHub

1. Crie um repositório no GitHub
2. No terminal, execute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

## Deploy (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório GitHub
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático!

## WhatsApp

O número do WhatsApp é armazenado no banco de dados (tabela `configuracoes`, campo `numero_whatsapp`).

Para configurar:
1. Acesse o painel Admin
2. Clique em "Editar Número" no topo
3. Insira o número com DDI (ex: 5575983026381)
4. Clique em Salvar

O sistema buscará o número automaticamente em tempo real.

## Boas Práticas de Segurança

1. **Não exponha a service role key** - Apenas a anon key deve ser usada no frontend
2. **RLS sempre habilitado** - Nunca desabilite Row Level Security
3. **Policies restritivas** - Dê apenas as permissões mínimas necessárias
4. **Validação no frontend** - Além das policies, valide dados antes de enviar
5. **Senhas fortes** - Exija senhas com no mínimo 6 caracteres
6. **Limite de upload** - Restrinja o tamanho e tipos de arquivos no storage

---

# Configurações de Segurança no Supabase

Esta seção contém políticas e configurações adicionais que você precisa configurar manualmente no Supabase para garantir a segurança completa do sistema.

## 1. Tabela Galeria (galeria_home)

Crie a tabela para armazenar imagens da galeria inicial:

```sql
-- Criar tabela galeria_home
CREATE TABLE IF NOT EXISTS galeria_home (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  imagem_url TEXT NOT NULL,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE galeria_home ENABLE ROW LEVEL SECURITY;

-- Policy: qualquer um pode ver a galeria
CREATE POLICY "galeria_selecionar" ON galeria_home
FOR SELECT USING (true);

-- Policy: apenas admins autenticados podem inserir
CREATE POLICY "galeria_inserir" ON galeria_home
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: apenas admins autenticados podem atualizar
CREATE POLICY "galeria_atualizar" ON galeria_home
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: apenas admins autenticados podem deletar
CREATE POLICY "galeria_deletar" ON galeria_home
FOR DELETE USING (auth.role() = 'authenticated');
```

## 2. Políticas Restritivas para Storage

Atualize as políticas do bucket `imagens-produtos` para ser mais restritivo:

```sql
-- ============================================
-- POLICIES RESTRITIVAS PARA STORAGE
-- ============================================

-- 1. Ler imagens (público)
CREATE POLICY "Public read imagens-produtos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'imagens-produtos'
);

-- 2. Inserir apenas usuários autenticados + tipos específicos
CREATE POLICY "Authenticated insert imagens-produtos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN ('galeria-home') AND
  mime_type IN ('image/jpeg', 'image/jpg', 'image/png')
);

-- 3. Atualizar apenas usuários autenticados
CREATE POLICY "Authenticated update imagens-produtos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated'
);

-- 4. Deletar apenas usuários autenticados
CREATE POLICY "Authenticated delete imagens-produtos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated'
);
```

**Nota:** Se você quiser permitir uploads na raiz do bucket (para imagens de produtos), use esta policy alternativa:

```sql
-- Para uploads na raiz (imagens-produtos)
CREATE POLICY "Authenticated insert raiz"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagens-produtos' AND
  auth.role() = 'authenticated' AND
  (
    (storage.foldername(name))[1] IN ('galeria-home', 'camisa', 'short')
    OR array_length(storage.foldername(name), 1) IS NULL
  ) AND
  mime_type IN ('image/jpeg', 'image/jpg', 'image/png')
);
```

## 3. Configurações de Autenticação Recomendadas

Vá em **Authentication** > **Settings** e configure:

```sql
-- Via SQL Editor:
ALTER AUTHICATION CONFIGURATION (
  security_email_confirm_enable = false,
  minimum_password_length = 8
);
```

## 4. Verificação de Política de Uso

Verifique se todas as tabelas têm RLS habilitado:

```sql
-- Verificar status do RLS em todas as tabelas
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pedidos', 'configuracoes', 'galeria_home');
```

Se alguma tabela retornar `false` (RLS desabilitado), habilite com:
```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

---

# Correções Aplicadas no Código

As seguintes melhorias de segurança foram implementadas no código fonte:

1. **Proteção de rotas**: Adicionado componente `ProtectedRoute` para proteger todas as rotas do painel admin

2. **Validação de upload**: Adicionada verificação de tipo (JPG, JPEG, PNG) e tamanho (máx 5MB) nas imagens

3. **Validação de formulários**:
   - Telefone validado e limpo antes de enviar
   - Número personalizado aceita apenas dígitos
   - Campos obrigatórios verificados

4. **Proteção de componentes**: Todos os componentes admin verificam autenticação

5. **Remoção de logs**: Console.logs potencialmente sensíveis foram removidos

6. **Validação de tipo no frontend**: Arquivos de imagem aceitos apenas em formatos específicos

---

## Checklist de Segurança

Antes de colocar em produção, verifique:

- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de storage configuradas
- [ ] Arquivo `.env` não está no repositório (já está no .gitignore)
- [ ] Apenas a chave `anon` está no frontend
- [ ] Taille máximo de upload configurado (5MB)
- [ ] Tipos de arquivo restritos (apenas imagens)
- [ ] Usuários admin criados corretamente
- [ ] Autenticação configurada com senha segura