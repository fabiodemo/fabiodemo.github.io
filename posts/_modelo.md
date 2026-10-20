---
title: Modelo de post (copie este arquivo)
date: 2026-10-20
tags: [modelo, markdown]
lang: pt
summary: Exemplo com tudo que o blog renderiza. Como está com draft true, só aparece no npm run dev.
draft: true
---

Este arquivo é o modelo. Para publicar um post de verdade:

1. Copie para `posts/AAAA-MM-DD-nome-do-post.md` (o nome do arquivo vira a URL).
2. Preencha o frontmatter lá em cima e troque `draft: true` por `draft: false` (ou apague a linha).
3. Rode `npm run build` e faça o deploy.

Quando existir pelo menos um post publicado, a plaquinha grande de "em obras" sai da página inicial e vira uma plaquinha pequena na lateral. Para tirar de vez, mude `UNDER_CONSTRUCTION` para `false` em `src/blog.js`.

## Campos do frontmatter

| Campo | Para quê |
|---|---|
| `title` | título do post |
| `date` | data no formato `AAAA-MM-DD`, define a ordem |
| `tags` | lista entre colchetes, vira os marcadores |
| `lang` | `pt` ou `en`, aparece como etiqueta |
| `summary` | resumo que aparece na listagem |
| `cover` | opcional, imagem de capa (ex.: `posts/capa.webp`) |
| `draft` | `true` esconde o post no site publicado |

## Código

Blocos de código ganham um botão de copiar:

```python
from pyspark.sql import functions as F

df = (spark.read.table("bronze.events")
      .where(F.col("event_date") >= "2026-01-01")
      .groupBy("user_id")
      .agg(F.count("*").alias("events")))
```

```hcl
resource "databricks_grants" "silver" {
  schema = "main.silver"
  grant {
    principal  = "data-engineers"
    privileges = ["USE_SCHEMA", "SELECT"]
  }
}
```

E `código inline` também.

## Imagens

Coloque as imagens em `public/posts/` e use o caminho relativo:

`![descrição](posts/minha-imagem.webp)`

### Citações

> Dica: use títulos `##` e `###`. Eles montam o índice "Neste post" na lateral.

---

Fim do modelo.
