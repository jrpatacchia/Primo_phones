# Capturas da apresentação

Solte os arquivos aqui com os nomes abaixo. **A extensão não importa** — a
apresentação procura `.webp`, depois `.png`, `.jpg` e `.jpeg`.

Enquanto um arquivo não existir, a tela mostra um placeholder identificado com o
caminho esperado. Nada de interface inventada.

O celular é desenhado em código (iPhone 15 Pro Max), então as capturas de tela de
celular devem ser **só a tela**, sem moldura — a proporção 19,5:9 é a de um print
tirado do próprio aparelho.

| Arquivo | Onde aparece | Proporção |
| --- | --- | --- |
| `catalog/catalog-home` | Telas 01, 02, 03, 04, 05 | 19,5:9 — só a tela, ex.: 1290 × 2796 |
| `catalog/catalog-products` | Tela 02, recorte esquerdo | 9:19 |
| `catalog/catalog-whatsapp` | reserva | 9:19 |
| `products/product-detail` | Tela 02, recorte direito | 9:19 |
| `cms/cms-desktop` | Telas 03 e 05 | 16:10 — ex.: 1600 × 1000 |
| `cms/cms-mobile` | Tela 03 | 19,5:9 — só a tela |
| `cms/cms-edicao-preco` | reserva | 16:10 |
| `branding/other-brand-page` | Tela 05 | 9:16 — formato de story, 1080 × 1920 |
| `branding/logo` | Tela 05 | quadrada, fundo transparente |

`mockups/` está reservado para molduras ou artes prontas, caso você queira usar
uma imagem já montada no lugar de um mockup desenhado em código.

Depois de adicionar qualquer arquivo:

```bash
npm run optimize
```

Isso converte para `.webp` no tamanho certo e guarda o original em
`assets-originais/`. Sem isso, um print de 7 MB vai junto para o celular do
cliente.

Não inclua senhas, e-mails ou tokens visíveis nos prints do painel.
