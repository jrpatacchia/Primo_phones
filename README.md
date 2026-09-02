# Apresentação comercial — Catálogo Digital + CMS

Apresentação vertical (9:16, 1080 × 1920) para prospecção pelo WhatsApp.
Cinco telas, cada uma funcionando como uma arte independente.

**Stack:** React · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons · Vite.

```bash
npm install
npm run dev
```

---

## Os quatro modos

| URL | Para quê |
| --- | --- |
| `/` | Apresentação. Scroll vertical, swipe no celular, setas do teclado, botões anterior/próximo e indicador `01 / 05`. |
| `/studio` | **Estúdio.** Troca as imagens e vídeos das áreas de mockup, com prévia ao vivo. Roda em `npm run dev` e, com Supabase configurado, também na apresentação publicada. |
| `/presentation` | Modo captura. As cinco telas empilhadas em 1080 × 1920 exatos, sem navegação e sem animação pendente — o que estiver na tela é o estado final. |
| `/presentation?slide=3` | Uma única tela em 1080 × 1920, pronta para screenshot. `?slide=1` … `?slide=5`. |
| `/demo` | Avanço automático a cada 5,2 s, sem interface. Serve para gravar a tela e gerar um vídeo. |

`?slide=N` também funciona em `/` e em `/demo` para começar numa tela específica.

### Como exportar as artes

1. Abra `/presentation?slide=1` numa janela de **1080 px de largura**.
2. Capture a página inteira (no Chrome: DevTools → `Ctrl+Shift+P` → *Capture full size screenshot*).
3. Repita para `?slide=2` … `?slide=5`.

O modo captura congela a demonstração do painel (Tela 03) no estado final, então
o screenshot sai igual todas as vezes.

---

## Estúdio

```bash
npm run dev
```

Abra **http://localhost:5199/studio**.

À esquerda ficam as áreas de mídia da apresentação; à direita, a apresentação de
verdade rodando dentro de um celular, tablet ou desktop.

Em cada área você pode:

- **Enviar** uma imagem (`.webp` `.png` `.jpg` `.jpeg` `.avif` `.gif` `.svg`) ou
  um **vídeo** (`.mp4` `.webm`). Vídeo entra mudo, em loop e começa sozinho —
  serve para mostrar a rolagem do catálogo ou uma edição acontecendo no painel.
- **Enquadrar** com os controles de zoom, horizontal e vertical.
- Marcar **"a mídia já vem com um aparelho desenhado dentro"** — para fotos em
  que o próprio celular aparece na imagem, para a apresentação não desenhar outro
  iPhone por cima.
- **Remover**, voltando ao placeholder identificado.

Tudo é salvo sozinho em `public/presentation/content.json`. Não existe botão
salvar, banco de dados nem login.

> Sem Supabase o estúdio grava arquivos no seu computador e só roda localmente
> — na apresentação publicada a rota `/studio` mostra um aviso e nada mais. Com
> Supabase, ele funciona publicado e pede login. Veja a seção Supabase abaixo.

Na primeira abertura, o estúdio adota sozinho os arquivos que já estiverem na
pasta de assets, para você abrir vendo o que a apresentação realmente exibe.

### Depois de trocar mídias

```bash
npm run optimize
```

Converte as imagens para `.webp` no tamanho em que aparecem, guarda os originais
em `assets-originais/` (fora do `public/`) e **atualiza o `content.json`** para
apontar para os novos arquivos. Vídeos não são tocados — comprima antes de
enviar.

As três capturas iniciais saíram de 10 MB para 436 KB. Vale rodar sempre: a
apresentação é aberta no celular, muitas vezes em rede móvel.

---

## Supabase

Sem Supabase o projeto funciona: a apresentação lê `public/presentation/` e o
estúdio só roda em `npm run dev`. Com Supabase, o estúdio passa a funcionar
**na apresentação publicada**, de qualquer computador, com login.

### Ligar

**1. Variáveis** — copie `.env.example` para `.env` e preencha com o que está
em Settings → API no painel do Supabase:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

A anon key é pública por natureza — ela vai dentro do JavaScript do site. Quem
protege os dados são as políticas de RLS, não o segredo da chave. O `.env` fica
fora do Git mesmo assim.

**2. Estrutura** — painel do Supabase → SQL Editor → New query → cole
`supabase/schema.sql` inteiro → Run. Isso cria a tabela `presentation_content`,
o bucket `presentation` e as políticas: **qualquer pessoa lê, só quem está
logado escreve.**

**3. Seu usuário** — Authentication → Users → Add user, com **Auto Confirm
User** marcado. É com esse e-mail e senha que você entra no `/studio`.

**4. Conferir**

```bash
npm run supabase:check
```

**5. Levar as mídias que já existem** (opcional)

```bash
SUPABASE_EMAIL=voce@exemplo.com SUPABASE_PASSWORD=suasenha npm run supabase:migrate
```

Sobe cada arquivo de `public/presentation/assets/` para o bucket e grava o
conteúdo na tabela. Depois disso o Supabase passa a mandar.

### Como fica

| | Sem Supabase | Com Supabase |
| --- | --- | --- |
| Onde a apresentação lê | `content.json` local | tabela, com o local de reserva |
| Onde as mídias ficam | `public/presentation/assets/` | bucket `presentation` |
| Onde o estúdio funciona | só em `npm run dev` | também na apresentação publicada |
| Quem pode editar | quem estiver no seu computador | quem tiver login |

A leitura tem sempre uma rede de proteção: se o Supabase não responder ou a
tabela estiver vazia, a apresentação cai nos arquivos locais em vez de aparecer
em branco.

---

## As cinco telas

| # | Tela | Arquivo |
| --- | --- | --- |
| 01 | Apresentação do produto | `src/slides/Slide01Product.tsx` |
| 02 | Experiência do cliente | `src/slides/Slide02Experience.tsx` |
| 03 | Você controla seu catálogo (demonstração animada) | `src/slides/Slide03Control.tsx` |
| 04 | O caminho até o WhatsApp | `src/slides/Slide04Journey.tsx` |
| 05 | Fechamento e CTA | `src/slides/Slide05Close.tsx` |

O link do botão final fica em `CTA_HREF`, no topo de `src/App.tsx`.

---

## Áreas de mídia

As áreas são declaradas em **`src/lib/assets.ts`** — um lugar só. O estúdio lê
essa lista para montar o painel; a apresentação lê para saber o que renderizar.

| Área | Onde aparece | Proporção |
| --- | --- | --- |
| Catálogo — página inicial | Telas 01, 02, 03, 04 e 05 | 19,5:9 — só a tela |
| Catálogo — lista de produtos | Tela 02, recorte esquerdo | 9:19 |
| Produto — detalhe e preço | Tela 02, recorte direito | 9:19 |
| Catálogo — contato e WhatsApp | reserva | 9:19 |
| Painel — desktop | Telas 03 e 05 | 16:10 |
| Painel — celular | Tela 03 | 19,5:9 — só a tela |
| Painel — edição de preço | reserva | 16:10 |
| Outra loja | Tela 05 | 9:16 — formato de story |
| Logo da loja | Tela 05 | quadrada |

Uma área pode ser preenchida de duas formas:

1. **Pelo estúdio** — o arquivo vai para `public/presentation/assets/` e o
   caminho fica registrado no `content.json`.
2. **Na mão** — solte o arquivo com o nome de `src` da área, em qualquer
   extensão aceita. Isso continua funcionando e é o que o estúdio adota na
   primeira abertura.

Enquanto uma área estiver vazia, a apresentação mostra um placeholder
identificado (`[SCREENSHOT CMS]`) com o caminho e a proporção esperados — nunca
uma interface inventada.

### O aparelho é desenhado, não é imagem

O celular das telas 01, 02, 03 e 05 é um **iPhone 15 Pro Max desenhado em
código** (`src/components/PhoneMockup.tsx`): corpo em titânio, ilha dinâmica,
botão de ação, volume, botão lateral e indicador de início. A mídia ocupa **só a
área da tela**.

As proporções vêm das medidas reais do aparelho — 76,7 × 159,9 mm de corpo — com
uma borda uniforme de 3,58% da largura. Isso faz a tela cair exatamente em
19,5:9, a mesma proporção de um print de iPhone 15 Pro Max (1290 × 2796). Um
print tirado do aparelho encaixa sem esticar nem sobrar.

Por isso a captura ideal para essas áreas é **só a tela**, sem moldura. As duas
capturas da Empório Phone vinham dentro de um iPhone renderizado; a moldura foi
recortada fora e o que ficou é o conteúdo da tela.

Se você usar uma **foto de um celular** (o aparelho aparecendo na imagem), marque
"a mídia já vem com um aparelho desenhado dentro" no estúdio — aí a apresentação
não desenha outro iPhone por cima.

---

## Componentes

```
src/components/
  Stage.tsx                 Palco fixo de 1080 × 1920, escalado para caber na tela
  PresentationSlide.tsx     Casca de uma tela + SlideHeading
  Backdrop.tsx              Fundo: preto, halo sutil, grade e grão
  PhoneMockup.tsx           iPhone 15 Pro Max desenhado; a mídia ocupa só a tela
  DesktopMockup.tsx         Janela de navegador em notebook
  ScreenshotFrame.tsx       Imagem, vídeo ou placeholder identificado
  FeatureTag.tsx            Detalhe ao redor do mockup (Tela 01)
  FlowStep.tsx              Etapa do caminho até o WhatsApp (Tela 04)
  AnimatedConnection.tsx    Linha de sincronização com pulso
  CMSDemo.tsx               Demonstração automática painel → catálogo (Tela 03)
  CTA.tsx                   Botão de fechamento
  SlideNavigation.tsx       Barra anterior/próximo
  ProgressIndicator.tsx     Contador 01 / 05

src/studio/                 O estúdio: painel, login e as duas formas de gravar
src/lib/supabase.ts         Cliente do Supabase (null quando não configurado)
plugins/studio-server.ts    Gravação em disco, usada quando não há Supabase
supabase/schema.sql         Tabela, bucket e políticas de acesso
```

### Por que um palco fixo

Toda a composição é desenhada num sistema de coordenadas de 1080 × 1920 e depois
apenas escalada (`transform: scale`) para caber na tela. Consequências:

- O que se vê no celular é exatamente o que sai na captura em 1080 × 1920.
- No desktop a apresentação fica centralizada e vertical, sem esticar.
- Não existe layout responsivo para manter — existe um layout só.

---

## Publicar

```bash
npm run build
```

O `dist/` é estático: sobe em qualquer hospedagem. O `.htaccess` já vai junto e
faz `/presentation` e `/demo` caírem no `index.html` (necessário em Apache /
HostGator).

O `content.json` e as mídias vão junto no build — o que você montou no estúdio é
o que o cliente vê.

---

## Desempenho

- Só a Tela 01 carrega a imagem em `eager`; o resto é `lazy`.
- Vídeos entram com `preload="metadata"` e só sobem inteiros quando aparecem.
- As animações usam apenas `transform` e `opacity`.
- `prefers-reduced-motion` desliga as transições.
- No modo captura as animações nascem no estado final (`src/lib/motion.ts`),
  então nada depende de esperar um quadro.
