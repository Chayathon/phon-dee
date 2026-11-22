// Types for LINE Flex Messages.
// Reference: https://developers.line.biz/en/reference/messaging-api/#flex-message

type Size =
    | "none"
    | "xxs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "xxl"
    | "3xl"
    | "4xl"
    | "5xl"
    | (string & {}); // px / % values

type Spacing =
    | "none"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "xxl"
    | (string & {});
type Gravity = "top" | "bottom" | "center";
type Align = "start" | "end" | "center";

// ---------- Actions ----------

export type LineAction =
    | {
          type: "postback";
          label?: string;
          data: string;
          displayText?: string;
          text?: string;
          inputOption?:
              | "closeRichMenu"
              | "openRichMenu"
              | "openKeyboard"
              | "openVoice";
          fillInText?: string;
      }
    | { type: "message"; label?: string; text: string }
    | { type: "uri"; label?: string; uri: string; altUri?: { desktop: string } }
    | {
          type: "datetimepicker";
          label?: string;
          data: string;
          mode: "date" | "time" | "datetime";
          initial?: string;
          max?: string;
          min?: string;
      }
    | { type: "clipboard"; label?: string; clipboardText: string };

// ---------- Components ----------

type Offsets = {
    position?: "relative" | "absolute";
    offsetTop?: string;
    offsetBottom?: string;
    offsetStart?: string;
    offsetEnd?: string;
};

export type FlexBox = Offsets & {
    type: "box";
    layout: "horizontal" | "vertical" | "baseline";
    contents: FlexComponent[];
    flex?: number;
    spacing?: Spacing;
    margin?: Spacing;
    paddingAll?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingStart?: string;
    paddingEnd?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    cornerRadius?: string;
    width?: string;
    maxWidth?: string;
    height?: string;
    maxHeight?: string;
    justifyContent?:
        | "flex-start"
        | "center"
        | "flex-end"
        | "space-between"
        | "space-around"
        | "space-evenly";
    alignItems?: "flex-start" | "center" | "flex-end";
    action?: LineAction;
};

export type FlexText = Offsets & {
    type: "text";
    text?: string;
    contents?: FlexSpan[];
    flex?: number;
    margin?: Spacing;
    size?: Size;
    align?: Align;
    gravity?: Gravity;
    wrap?: boolean;
    lineSpacing?: string;
    maxLines?: number;
    weight?: "regular" | "bold";
    color?: string;
    style?: "normal" | "italic";
    decoration?: "none" | "underline" | "line-through";
    adjustMode?: "shrink-to-fit";
    action?: LineAction;
};

export type FlexSpan = {
    type: "span";
    text: string;
    size?: Size;
    color?: string;
    weight?: "regular" | "bold";
    style?: "normal" | "italic";
    decoration?: "none" | "underline" | "line-through";
};

export type FlexButton = Offsets & {
    type: "button";
    action: LineAction;
    flex?: number;
    margin?: Spacing;
    height?: "sm" | "md";
    style?: "primary" | "secondary" | "link";
    color?: string;
    gravity?: Gravity;
    adjustMode?: "shrink-to-fit";
};

export type FlexImage = Offsets & {
    type: "image";
    url: string;
    flex?: number;
    margin?: Spacing;
    align?: Align;
    gravity?: Gravity;
    size?: Size | "full";
    aspectRatio?: string;
    aspectMode?: "fit" | "cover";
    backgroundColor?: string;
    animated?: boolean;
    action?: LineAction;
};

export type FlexIcon = Offsets & {
    type: "icon";
    url: string;
    margin?: Spacing;
    size?: Size;
    aspectRatio?: string;
};

export type FlexSeparator = {
    type: "separator";
    margin?: Spacing;
    color?: string;
};

export type FlexFiller = { type: "filler"; flex?: number };

export type FlexComponent =
    | FlexBox
    | FlexText
    | FlexButton
    | FlexImage
    | FlexIcon
    | FlexSeparator
    | FlexFiller;

// ---------- Containers ----------

type BlockStyle = {
    backgroundColor?: string;
    separator?: boolean;
    separatorColor?: string;
};

export type FlexBubble = {
    type: "bubble";
    size?: "nano" | "micro" | "deca" | "hecto" | "kilo" | "mega" | "giga";
    direction?: "ltr" | "rtl";
    header?: FlexBox;
    hero?: FlexBox | FlexImage;
    body?: FlexBox;
    footer?: FlexBox;
    styles?: {
        header?: BlockStyle;
        hero?: BlockStyle;
        body?: BlockStyle;
        footer?: BlockStyle;
    };
    action?: LineAction;
};

export type FlexCarousel = { type: "carousel"; contents: FlexBubble[] };

export type FlexContainer = FlexBubble | FlexCarousel;

export type LineFlexMessage = {
    type: "flex";
    altText: string;
    contents: FlexContainer;
};

export function flexMessage(
    altText: string,
    contents: FlexContainer,
): LineFlexMessage {
    return { type: "flex", altText: altText.slice(0, 1500), contents };
}
