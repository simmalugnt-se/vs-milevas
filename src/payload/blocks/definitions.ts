import type { Block } from "payload";
import { createElement, type ReactNode } from "react";
import { CallToActionBlockComponent } from "./CallToAction/Component";
import { CallToActionBlock } from "./CallToAction/config";
import { CardSliderBlockComponent } from "./CardSlider/Component";
import { CardSliderBlock } from "./CardSlider/config";
import { CardsBlockComponent } from "./Cards/Component";
import { CardsBlock } from "./Cards/config";
import { ColumnsBlockComponent } from "./Columns/Component";
import { ColumnsBlock } from "./Columns/config";
import { ConfiguratorBlockComponent } from "./Configurator/Component";
import { ConfiguratorBlock } from "./Configurator/config";
import { ContactBlockComponent } from "./Contact/Component";
import { ContactBlock } from "./Contact/config";
import { FAQBlockComponent } from "./FAQ/Component";
import { FAQBlock } from "./FAQ/config";
import { GalleryBlockComponent } from "./Gallery/Component";
import { GalleryBlock } from "./Gallery/config";
import { HeroBlockComponent } from "./Hero/Component";
import { HeroBlock } from "./Hero/config";
import { ImageTextBlockComponent } from "./ImageText/Component";
import { ImageTextBlock } from "./ImageText/config";
import { MediaBlockComponent } from "./Media/Component";
import { MediaBlock } from "./Media/config";
import { MilevasHeroBlockComponent } from "./MilevasHero/Component";
import { MilevasHeroBlock } from "./MilevasHero/config";
import { ProductGridBlockComponent } from "./ProductGrid/Component";
import { ProductGridBlock } from "./ProductGrid/config";
import { RichTextBlockComponent } from "./RichText/Component";
import { RichTextBlock } from "./RichText/config";
import { TextBlockBlockComponent } from "./TextBlock/Component";
import { TextBlockBlock } from "./TextBlock/config";
import { TextBoxinfoBlockComponent } from "./TextBoxinfo/Component";
import { TextBoxinfoBlock } from "./TextBoxinfo/config";
import { TextColumnsBlockComponent } from "./TextColumns/Component";
import { TextColumnsBlock } from "./TextColumns/config";
import { TextGridBlockComponent } from "./TextGrid/Component";
import { TextGridBlock } from "./TextGrid/config";
import type { LayoutBlock, LayoutBlockComponentProps } from "./types";

export type { LayoutBlock } from "./types";

// sl-cli:block-component-imports (do not remove)
// sl-cli:block-config-imports (do not remove)

export type LayoutBlockRenderer = (props: LayoutBlockComponentProps) => ReactNode;

function isBlockType<TType extends LayoutBlock["blockType"]>(
  block: LayoutBlock,
  blockType: TType,
): block is Extract<LayoutBlock, { blockType: TType }> {
  return block.blockType === blockType;
}

function renderTypedBlock<TType extends LayoutBlock["blockType"]>(
  blockType: TType,
  render: (
    props: LayoutBlockComponentProps<Extract<LayoutBlock, { blockType: TType }>>,
  ) => ReactNode,
): LayoutBlockRenderer {
  return ({ block, ...props }) => {
    if (!isBlockType(block, blockType)) {
      return null;
    }

    return render({ block, ...props });
  };
}

export const layoutBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  MediaBlock,
  GalleryBlock,
  CardsBlock,
  FAQBlock,
  CallToActionBlock,
  ColumnsBlock,
  ConfiguratorBlock,
  MilevasHeroBlock,
  TextColumnsBlock,
  ImageTextBlock,
  ProductGridBlock,
  TextGridBlock,
  TextBoxinfoBlock,
  CardSliderBlock,
  TextBlockBlock,
  ContactBlock,

  // sl-cli:layout-blocks (do not remove)
];

export const blockComponents = {
  hero: renderTypedBlock("hero", (props) => HeroBlockComponent(props)),
  media: renderTypedBlock("media", (props) => MediaBlockComponent(props)),
  configurator: renderTypedBlock("configurator", (props) =>
    createElement(ConfiguratorBlockComponent, props),
  ),
  richText: renderTypedBlock("richText", (props) => RichTextBlockComponent(props)),
  gallery: renderTypedBlock("gallery", (props) => GalleryBlockComponent(props)),
  cards: renderTypedBlock("cards", (props) => CardsBlockComponent(props)),
  faq: renderTypedBlock("faq", (props) => FAQBlockComponent(props)),
  callToAction: renderTypedBlock("callToAction", (props) =>
    CallToActionBlockComponent(props),
  ),
  columns: renderTypedBlock("columns", (props) => ColumnsBlockComponent(props)),
  milevasHero: renderTypedBlock("milevasHero", (props) =>
    createElement(MilevasHeroBlockComponent, props),
  ),
  textColumns: renderTypedBlock("textColumns", (props) =>
    createElement(TextColumnsBlockComponent, props),
  ),
  imageText: renderTypedBlock("imageText", (props) =>
    createElement(ImageTextBlockComponent, props),
  ),
  productGrid: renderTypedBlock("productGrid", (props) =>
    createElement(ProductGridBlockComponent, props),
  ),
  textGrid: renderTypedBlock("textGrid", (props) =>
    createElement(TextGridBlockComponent, props),
  ),
  textBoxinfo: renderTypedBlock("textBoxinfo", (props) =>
    createElement(TextBoxinfoBlockComponent, props),
  ),
  cardSlider: renderTypedBlock("cardSlider", (props) =>
    createElement(CardSliderBlockComponent, props),
  ),
  textBlock: renderTypedBlock("textBlock", (props) =>
    createElement(TextBlockBlockComponent, props),
  ),
  contact: renderTypedBlock("contact", (props) =>
    createElement(ContactBlockComponent, props),
  ),
  // sl-cli:block-components-map (do not remove)
} satisfies Record<string, LayoutBlockRenderer>;
