/**
 * Registro central das áreas de mídia da apresentação.
 *
 * Cada entrada é um "encaixe": um lugar da apresentação onde entra uma captura
 * de tela, uma imagem ou um vídeo. O estúdio (`/studio`) lê esta lista para
 * montar o painel de edição.
 *
 * Duas formas de preencher um encaixe:
 *
 * 1. Pelo estúdio — o arquivo é gravado em `public/presentation/assets/` e o
 *    caminho fica registrado em `public/presentation/content.json`.
 * 2. Na mão — solte o arquivo com o nome de `src` em qualquer extensão
 *    (`.webp`, `.png`, `.jpg`, `.jpeg`, `.mp4`, `.webm`).
 *
 * Enquanto nenhuma das duas existir, a tela mostra um placeholder identificado.
 */

export type Asset = {
  /** Identificador do encaixe. Igual à chave em `assets`. */
  id: AssetKey;
  /** Caminho público SEM extensão, usado quando não há nada em `content.json`. */
  src: string;
  /** Pasta onde o estúdio grava os envios. */
  folder: string;
  /** Nome curto no painel do estúdio. */
  title: string;
  /** Onde essa mídia aparece na apresentação. */
  where: string;
  /** Rótulo do placeholder enquanto o encaixe está vazio. */
  label: string;
  /** Proporção sugerida para a captura. */
  ratio: string;
/**
   * true quando a mídia JÁ traz um aparelho desenhado dentro dela. Nesse caso o
   * mockup não desenha o iPhone por cima — senão ficariam dois.
   */
  prewrapped?: boolean;
};

const base = "/presentation/assets";

const definitions = {
  catalogHome: {
    src: `${base}/catalog/catalog-home`,
    folder: "catalog",
    title: "Catálogo — página inicial",
    where: "Telas 01, 02, 03, 04 e 05",
    label: "[SCREENSHOT CATÁLOGO]",
    ratio: "19.5:9 — só a tela, ex.: 1290 × 2796",
  },
  catalogProducts: {
    src: `${base}/catalog/catalog-products`,
    folder: "catalog",
    title: "Catálogo — lista de produtos",
    where: "Tela 02, recorte da esquerda",
    label: "[SCREENSHOT PRODUTOS]",
    ratio: "9:19",
  },
  catalogDetail: {
    src: `${base}/products/product-detail`,
    folder: "products",
    title: "Produto — detalhe e preço",
    where: "Tela 02, recorte da direita",
    label: "[SCREENSHOT DETALHE]",
    ratio: "9:19",
  },
  catalogWhatsapp: {
    src: `${base}/catalog/catalog-whatsapp`,
    folder: "catalog",
    title: "Catálogo — contato e WhatsApp",
    where: "Reserva (nenhuma tela usa hoje)",
    label: "[SCREENSHOT WHATSAPP]",
    ratio: "9:19",
  },
  cmsDesktop: {
    src: `${base}/cms/cms-desktop`,
    folder: "cms",
    title: "Painel — desktop",
    where: "Telas 03 e 05",
    label: "[SCREENSHOT CMS — DESKTOP]",
    ratio: "16:10 — ex.: 1600 × 1000",
  },
  cmsPriceEdit: {
    src: `${base}/cms/cms-edicao-preco`,
    folder: "cms",
    title: "Painel — edição de preço",
    where: "Reserva (nenhuma tela usa hoje)",
    label: "[SCREENSHOT CMS — EDIÇÃO]",
    ratio: "16:10",
  },
  cmsMobile: {
    src: `${base}/cms/cms-mobile`,
    folder: "cms",
    title: "Painel — celular",
    where: "Tela 03, ao lado do notebook",
    label: "[SCREENSHOT CMS]",
    ratio: "19.5:9 — só a tela",
  },
  otherBrand: {
    src: `${base}/branding/other-brand-page`,
    folder: "branding",
    title: "Outra loja",
    where: "Tela 05, cartão da direita",
    label: "[SCREENSHOT OUTRA LOJA]",
    ratio: "9:16 — formato de story, ex.: 1080 × 1920",
  },
  brandLogo: {
    src: `${base}/branding/logo`,
    folder: "branding",
    title: "Logo da loja",
    where: "Tela 05, acima do celular",
    label: "[LOGO DA LOJA]",
    ratio: "quadrada, fundo transparente",
  },
} satisfies Record<string, Omit<Asset, "id">>;

export type AssetKey = keyof typeof definitions;

export const assets = Object.fromEntries(
  Object.entries(definitions).map(([id, value]) => [id, { ...value, id }]),
) as { [K in AssetKey]: Asset };

/** Todos os encaixes, na ordem em que aparecem na apresentação. */
export const assetList: Asset[] = Object.values(assets);
