"use client";

import { Icon } from "@/components/Icons";
import MainHeader from "@/components/MainHeader";
import ColorPicker from "@/components/editor/color-picker";
import EmojiPicker from "@/components/editor/emoji-picker";
import NoiseTexture from "@/components/editor/noise-texture";
import {
  BackgroundFillPresets,
  FillType,
  IconInfo,
} from "@/components/editor/styles";
import CopyIcon from "@/components/icons/copy";
import ExportIcon from "@/components/icons/export";
import ImageIcon from "@/components/icons/image";
import LinkIcon from "@/components/icons/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IconButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "@/components/ui/modal";
import {
  copySvgAsPngToClipboard,
  copySvgToClipboard,
  downloadSvg,
  downloadSvgAsPng,
  generateURL,
  toCamelCase,
} from "@/lib/utils";

import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderUp,
  LayoutDashboard,
  Palette,
  Search,
  X,
} from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function SvgEditor() {
  const sp = useSearchParams();
  const ref = useRef<SVGSVGElement>(null);
  const [openExportMenu, setOpenExportMenu] = useState(false);
  const [openEmojiPicker, setEmojiPicker] = useState(false);
  const [showBottomLeftPanel, setShowBottomLeftPanel] =
    useState<boolean>(false);
  const [showBottomRightPanel, setShowBottomRightPanel] =
    useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [isExportSVG, setIsExportSVG] = useState(true);
  const [isExportPNG, setIsExportPNG] = useState(false);

  const [iconInfo, setIconInfo] = useState<IconInfo>({
    filename: sp.get("filename") || "icon",
    type:
      sp.get("type") === "gif"
        ? "gif"
        : sp.get("type") === "svg"
        ? "svg"
        : sp.get("type") === "text"
        ? "text"
        : "gif",
    value: sp.get("value") || `https://iconce.com/icon/gif/party-face.gif`,
    totalSize: Number(sp.get("totalSize") || "256"),
    animate: Boolean(sp.get("animate") === "true"),
    fillStyle: {
      fillType:
        (sp.get("fillType") === "Linear"
          ? "Linear"
          : sp.get("fillType") === "Solid"
          ? "Solid"
          : "Linear") || "Linear",
      primaryColor: sp.get("primaryColor") || "#00B4DB",
      secondaryColor: sp.get("secondaryColor") || "#003357",
      angle: sp.get("angle") || "45",
    },
    background: {
      radialGlare: Boolean(sp.get("radialGlare") === "true"),
      noiseTexture: Boolean(sp.get("noiseTexture") === "true"),
      noiseOpacity: Number(sp.get("noiseOpacity") || "25"),
      radius: sp.get("radius") || "64",
      strokeSize: Number(sp.get("strokeSize") || "0"),
      strokeColor: sp.get("strokeColor") || "#FFFFFF",
      strokeOpacity: sp.get("strokeOpacity") || "100",
    },
    icon: {
      color: sp.get("color") || "#FFFFFF",
      size: Number(sp.get("size") || "128"),
    },
  });

  const [seachNameResult, setseachNameResult] = useState<string[]>([]);
  const [suppotIcons, setSuppotIcons] = useState<string[]>([]);

  const [iconPage, setIconPage] = useState(1);
  const [perPage] = useState(100);
  const startIndex = (iconPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  useEffect(() => {
    if (Object.keys(dynamicIconImports).length > 0) {
      setSuppotIcons(Object.keys(dynamicIconImports));
    }
  }, [dynamicIconImports]);

  const isDisabled = (disable: boolean) => (disable ? "text-gray-400" : "");

  const handleSearchIcon = (key: string) => {
    setseachNameResult(suppotIcons.filter((item) => item.includes(key)));
  };

  const handleExportPng = async () => {
    if (ref.current) {
      isExportSVG && downloadSvg(ref.current, iconInfo.filename);
      isExportPNG && downloadSvgAsPng(ref.current, iconInfo.filename);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = generateURL(iconInfo);
      await navigator.clipboard.writeText(link);
      toast("Copied link to clipboard", {
        style: { backgroundColor: "#3b3b3b", color: "white" },
      });
    } catch (err) {
      console.error("Error in copying", err);
    }
  };

  const IconItem = (item: string) => {
    return (
      <div
        className="flex items-center justify-center cursor-pointer max-h-[64px] p-6 rounded bg-[#ffffff0d] hover:bg-[#ececec36] transition-all duration-300"
        data-id={item}
        key={item}
        onClick={() => {
          setIconInfo({ ...iconInfo, type: "svg", value: item });
        }}>
        <Icon
          className="text-[#ffffffce] w-4 h-4"
          name={toCamelCase(item) as any}
        />
      </div>
    );
  };

  const renderLeftPanel = () => (
    <div className="">
      <div className="flex items-center gap-2 justify-between">
        <label className="relative inline-flex">
          <Search className="w-4 h-4 absolute top-3 left-4 z-10 text-[#ffffff99]" />
          <input
            onChange={(e) => handleSearchIcon(e.target.value)}
            type="text"
            className="w-full md:w-[190px] h-10 text-sm text-white pl-10 pr-11 bg-[#3d3d3d] focus:border-gray-500 caret-slate-100 transition-all duration-300 outline-none rounded-md shadow-inner border border-[#ffffff0d]"
            placeholder="Search Icons…"
          />
        </label>

        <DropdownMenu open={openEmojiPicker} onOpenChange={setEmojiPicker}>
          <DropdownMenuTrigger className="hidden md:block">
            <div className="w-10 h-10 inline-flex items-center justify-center transition-all duration-300 bg-[#ffffff1a] outline-none rounded-md border border-[#ffffff0d] hover:bg-[#ececec36]">
              {iconInfo.type === "text" && !iconInfo.value.endsWith(".gif")
                ? iconInfo.value
                : "😎"}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#2e3031] border border-[#ffffff0d] text-sm text-[#fff6]"
            onMouseLeave={() => setEmojiPicker(false)}>
            <EmojiPicker
              onEmojiSelect={(e, src) => {
                if (src && src.endsWith(".gif")) {
                  setIconInfo({ ...iconInfo, type: "gif", value: src });
                } else {
                  setIconInfo({ ...iconInfo, type: "text", value: e });
                }
                setEmojiPicker(false);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton>
          <FolderUp className="w-4 h-4 text-[#ffffff99]" />
        </IconButton>
      </div>

      <motion.div
        className="grid grid-cols-4 gap-2 mt-4 mb-4 overflow-auto"
        style={{ height: "calc(100vh - 250px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}>
        {seachNameResult.length > 0
          ? seachNameResult.map((item) => IconItem(item))
          : suppotIcons
              .slice(startIndex, endIndex)
              .map((item) => IconItem(item))}
      </motion.div>
      <div className="flex items-center justify-end gap-3">
        <span className="text-[#ffffffce] text-sm">
          {iconPage} / {Math.ceil(suppotIcons.length / perPage)}
        </span>
        <IconButton
          name="chevron-left"
          onClick={() => {
            if (iconPage > 1) {
              setIconPage(iconPage - 1);
            }
          }}>
          <ChevronLeft className="w-4 h-4 text-[#ffffff99]" />
        </IconButton>
        <IconButton
          onClick={() => {
            if (iconPage < Math.ceil(suppotIcons.length / perPage)) {
              setIconPage(iconPage + 1);
            }
          }}>
          <ChevronRight className="w-4 h-4 text-[#ffffff99]" />
        </IconButton>
      </div>
    </div>
  );

  const renderRightPanel = () => (
    <div className="flex flex-col gap-3">
      <Accordion
        className="w-full"
        type="single"
        defaultValue="item-1"
        collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-slate-300 bg-gradient-1 shadow-md hover:bg-[#4b4b4b] rounded-md font-bold text-xs px-3">
            Fill Styles
          </AccordionTrigger>
          <AccordionContent className="p-2">
            <div className="flex items-center justify-between text-white mt-2">
              <span className="text-xs">Fill Type</span>
              <Select.Root
                defaultValue={iconInfo.fillStyle.fillType}
                onValueChange={(val) =>
                  setIconInfo({
                    ...iconInfo,
                    fillStyle: {
                      ...iconInfo.fillStyle,
                      fillType: val as FillType,
                    },
                  })
                }>
                <Select.Trigger className="SelectTrigger">
                  {iconInfo.fillStyle.fillType}
                  <Select.Icon>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Content className="SelectContent" position="popper">
                  <Select.Item className="SelectItem" value="Linear">
                    Linear
                  </Select.Item>
                  <Select.Item className="SelectItem" value="Solid">
                    Solid
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className="text-xs">Primary Color</span>
              <ColorPicker
                defaultColor={iconInfo.fillStyle.primaryColor}
                onChoose={(color) =>
                  setIconInfo({
                    ...iconInfo,
                    fillStyle: {
                      ...iconInfo.fillStyle,
                      primaryColor: color,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span
                className={
                  "text-xs " +
                  `${isDisabled(iconInfo.fillStyle.fillType === "Solid")}`
                }>
                Secondary Color
              </span>
              <ColorPicker
                defaultColor={iconInfo.fillStyle.secondaryColor}
                onChoose={(color) =>
                  setIconInfo({
                    ...iconInfo,
                    fillStyle: {
                      ...iconInfo.fillStyle,
                      secondaryColor: color,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span
                className={
                  "text-xs " +
                  `${isDisabled(iconInfo.fillStyle.fillType === "Solid")}`
                }>
                Angle
              </span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.fillStyle.angle}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      fillStyle: {
                        ...iconInfo.fillStyle,
                        angle: e.target.value || "45",
                      },
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  °
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-white mt-3">
              <span
                className={
                  "text-xs " +
                  `${isDisabled(iconInfo.fillStyle.fillType === "Solid")}`
                }>
                Animate (svg)
              </span>
              <Switch.Root
                className="SwitchRoot"
                id="airplane-mode"
                defaultChecked={iconInfo.animate}
                onCheckedChange={(e) =>
                  setIconInfo({
                    ...iconInfo,
                    animate: e,
                  })
                }>
                <Switch.Thumb className="SwitchThumb" />
              </Switch.Root>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        className="w-full"
        type="single"
        defaultValue="item-1"
        collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-slate-300 bg-gradient-1 shadow-md hover:bg-[#4b4b4b] rounded-md font-bold text-xs px-3">
            Fill Presets
          </AccordionTrigger>
          <AccordionContent className="p-2 grid grid-cols-7 gap-4 items-start justify-start pt-3">
            {BackgroundFillPresets.map((item, index) => (
              <svg
                className="rounded cursor-pointer w-5 h-5 flex-shrink-0 overflow-hidden"
                key={index}
                onClick={() =>
                  setIconInfo({
                    ...iconInfo,
                    fillStyle: { ...iconInfo.fillStyle, ...item },
                  })
                }
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect
                  id={`ra${index}`}
                  width="20"
                  height="20"
                  x="0"
                  y="0"
                  rx="0"
                  fill={`url(#rt${index})`}
                  stroke="#FFFFFF"
                  strokeWidth="0"
                  strokeOpacity="100%"
                  paintOrder="stroke"></rect>
                <clipPath id="clip">
                  <use xlinkHref={`ra${index}`}></use>
                </clipPath>
                <defs>
                  <linearGradient
                    id={`rt${index}`}
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="rotate(45)"
                    style={{ transformOrigin: "center center" }}>
                    <stop stopColor={item.primaryColor}></stop>
                    <stop offset="1" stopColor={item.secondaryColor}></stop>
                  </linearGradient>
                  <radialGradient
                    id="r9"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(10) rotate(90) scale(20)">
                    <stop stopColor="white"></stop>
                    <stop offset="1" stopColor="white" stopOpacity="0"></stop>
                  </radialGradient>
                </defs>
              </svg>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion className="w-full" type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-slate-300 bg-gradient-1 shadow-md hover:bg-[#4b4b4b] rounded-md font-bold text-xs px-3">
            Background
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2">
            <div className="flex items-center justify-between text-white mt-2">
              <span className="text-xs">Radial glare</span>
              <Switch.Root
                className="SwitchRoot"
                id="airplane-mode"
                defaultChecked={iconInfo.background.radialGlare}
                onCheckedChange={(e) =>
                  setIconInfo({
                    ...iconInfo,
                    background: {
                      ...iconInfo.background,
                      radialGlare: e,
                    },
                  })
                }>
                <Switch.Thumb className="SwitchThumb" />
              </Switch.Root>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className="text-xs">Noise texture</span>
              <Switch.Root
                className="SwitchRoot"
                id="airplane-mode"
                defaultChecked={iconInfo.background.noiseTexture}
                onCheckedChange={(e) =>
                  setIconInfo({
                    ...iconInfo,
                    background: {
                      ...iconInfo.background,
                      noiseTexture: e,
                    },
                  })
                }>
                <Switch.Thumb className="SwitchThumb" />
              </Switch.Root>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span
                className={`text-xs ${isDisabled(
                  !iconInfo.background.noiseTexture
                )}`}>
                Noise Opacity
              </span>

              <div className="flex items-center justify-end gap-1">
                <span className="text-xs text-slate-400">
                  {iconInfo.background.noiseOpacity}%
                </span>
                <Slider.Root
                  className="SliderRoot"
                  defaultValue={[iconInfo.background.noiseOpacity]}
                  max={100}
                  step={1}
                  onValueChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      background: {
                        ...iconInfo.background,
                        noiseOpacity: e[0],
                      },
                    })
                  }>
                  <Slider.Track className="SliderTrack">
                    <Slider.Range className="SliderRange" />
                  </Slider.Track>
                  <Slider.Thumb className="SliderThumb" aria-label="Volume" />
                </Slider.Root>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion className="w-full" type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-slate-300 bg-gradient-1 shadow-md hover:bg-[#4b4b4b] rounded-md font-bold text-xs px-3">
            Border
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2">
            <div className="flex items-center justify-between text-white mt-2">
              <span className={"text-xs"}>Stroke size</span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.background.strokeSize}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      background: {
                        ...iconInfo.background,
                        strokeSize: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  px
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span
                className={`text-xs ${isDisabled(
                  iconInfo.background.strokeSize === 0
                )}`}>
                Stroke Color
              </span>
              <ColorPicker
                defaultColor={iconInfo.background.strokeColor}
                onChoose={(color) =>
                  setIconInfo({
                    ...iconInfo,
                    background: {
                      ...iconInfo.background,
                      strokeColor: color,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span
                className={`text-xs ${isDisabled(
                  iconInfo.background.strokeSize === 0
                )}`}>
                Stroke opacity
              </span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.background.strokeOpacity}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      background: {
                        ...iconInfo.background,
                        strokeOpacity: e.target.value || "100",
                      },
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  %
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className={"text-xs"}>Radius</span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.background.radius}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      background: {
                        ...iconInfo.background,
                        radius: e.target.value || "128",
                      },
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  px
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion className="w-full" type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-slate-300 bg-gradient-1 shadow-md hover:bg-[#4b4b4b] rounded-md font-bold text-xs px-3">
            Icon
          </AccordionTrigger>
          <AccordionContent className="space-y-3 p-2">
            <div className="flex items-center justify-between text-white mt-2">
              <span className={"text-xs"}>Text</span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="text"
                  defaultValue={iconInfo.type === "text" ? iconInfo.value : ""}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      type: "text",
                      value: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className={`text-xs`}>Color</span>
              <ColorPicker
                defaultColor={iconInfo.icon.color}
                onChoose={(color) =>
                  setIconInfo({
                    ...iconInfo,
                    icon: {
                      ...iconInfo.icon,
                      color: color,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className={"text-xs"}>Size</span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.icon.size}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      icon: {
                        ...iconInfo.icon,
                        size: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  px
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-white mt-2">
              <span className={"text-xs"}>Total Size</span>
              <div className="relative">
                <input
                  className="bg-[#0003] text-white after:content-['*'] w-[100px] rounded-[6px] px-2 py-1 border focus:border-gray-500 border-[#ffffff0a] outline-none transition-all duration-300"
                  type="number"
                  defaultValue={iconInfo.totalSize}
                  onInput={(v) => v.currentTarget.value.replace(/[^\d]/g, "")}
                  onChange={(e) =>
                    setIconInfo({
                      ...iconInfo,
                      totalSize: Number(e.target.value) || 0,
                    })
                  }
                />
                <div className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400">
                  px
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="svg-editor w-screen h-screen relative">
      <header className="h-14 px-4 flex justify-between items-center bg-[#1f2023] shadow backdrop-blur-xl">
        <div className="logo text-left flex items-center gap-4">
          <MainHeader />
          {/* <div className="w-[1px] h-[16px] bg-[#fff3] rounded-[3px]"></div>
          <div className="actions gap-1">
            <Button className="text-white gap-1" variant="ghost" size="sm">
              <UndoIcon />
              Undo
            </Button>
            <Button className="text-white gap-1" variant="ghost" size="sm">
              <RedoIcon />
              Redo
            </Button>
          </div> */}
        </div>
        <div
          className="absolute top-[50%] left-[50%] md:block hidden mx-auto text-gray-500 text-center text-sm font-bold"
          style={{
            transform: "translate(-50%,-50%)",
          }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              setIconInfo({
                ...iconInfo,
                filename: e.currentTarget.innerText.slice(0, 100) || "",
              })
            }
            className="text-center cursor-text input-ext-png border-none outline-none bg-[#1f2023]">
            {iconInfo.filename}
          </div>
        </div>
        <div className="text-right gap-3 flex items-center">
          <DropdownMenu open={openExportMenu} onOpenChange={setOpenExportMenu}>
            <DropdownMenuTrigger className="">
              <div
                className="flex items-center justify-center text-slate-300 border outline-none px-3 py-1 rounded-md text-sm font-semibold bg-gradient-2 border-slate-600/70"
                onMouseMove={() => setOpenExportMenu(true)}
                onClick={() => setShowExportModal(true)}>
                <ExportIcon /> <span className="pl-2">Export icon</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-[#2e3031] border border-[#ffffff0d] text-sm text-[#fff6]"
              onMouseLeave={() => setOpenExportMenu(false)}>
              <DropdownMenuItem
                className="DropdownMenuItem cursor-pointer"
                onClick={() => {
                  setOpenExportMenu(false);
                  setShowExportModal(!showExportModal);
                }}>
                <ImageIcon />
                <span className="pl-2">Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="DropdownMenuItem cursor-pointer"
                onClick={() => {
                  copySvgAsPngToClipboard(ref.current);
                  toast("Copied image to clipboard", {
                    style: { backgroundColor: "#3b3b3b", color: "white" },
                  });
                }}>
                <CopyIcon />
                <span className="pl-2">Copy Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="DropdownMenuItem cursor-pointer"
                onClick={() => {
                  copySvgToClipboard(ref.current);
                  toast("Copied svg to clipboard", {
                    style: { backgroundColor: "#3b3b3b", color: "white" },
                  });
                }}>
                <CopyIcon />
                <span className="pl-2">Copy Svg</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="DropdownMenuItem cursor-pointer"
                onClick={handleCopyLink}>
                <LinkIcon />
                <span className="pl-2">Share Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="DropdownMenuItem cursor-pointer"
                onClick={() => toast("Working...")}>
                <LinkIcon />
                <span className="pl-2">API Link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main
        className="relative dot-bg overflow-auto"
        style={{
          height: "calc(100vh - 54px)",
        }}>
        {/* tools */}
        <div className="block md:hidden absolute bottom-0 w-full">
          <div className="flex w-full items-center justify-around">
            <button
              className="rounded-tl-lg w-full transition-all duration-300 bg-[#232526] p-4 shadow-md text-slate-300 hover:bg-[#3b3d3f]"
              onClick={() => {
                setShowBottomRightPanel(false);
                setShowBottomLeftPanel(!showBottomLeftPanel);
              }}>
              <LayoutDashboard className="mx-auto" />
            </button>
            <button
              className="rounded-tr-lg w-full transition-all duration-300 bg-[#232526] p-4 shadow-md text-slate-300 hover:bg-[#3b3d3f]"
              onClick={() => {
                setShowBottomLeftPanel(false);
                setShowBottomRightPanel(!showBottomRightPanel);
              }}>
              <Palette className="mx-auto" />
            </button>
          </div>
        </div>

        <PanelWrapper position="left">{renderLeftPanel()}</PanelWrapper>

        <div
          className="preview absolute top-[50%] left-[50%] text-white"
          style={{
            transform: "translate(-50%,-60%)",
            width: iconInfo.totalSize,
            height: iconInfo.totalSize,
          }}>
          <div className="relative">
            <svg
              ref={ref}
              id="iconce-svg"
              width={iconInfo.totalSize}
              height={iconInfo.totalSize}
              viewBox={`0 0 ${iconInfo.totalSize} ${iconInfo.totalSize}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect
                id="r4"
                width={iconInfo.totalSize - iconInfo.background.strokeSize}
                height={iconInfo.totalSize - iconInfo.background.strokeSize}
                x={iconInfo.background.strokeSize / 2}
                y={iconInfo.background.strokeSize / 2}
                rx={iconInfo.background.radius}
                fill={
                  iconInfo.fillStyle.fillType === "Linear"
                    ? "url(#r5)"
                    : iconInfo.fillStyle.primaryColor
                }
                stroke={iconInfo.background.strokeColor}
                strokeWidth={iconInfo.background.strokeSize}
                strokeOpacity={`${iconInfo.background.strokeOpacity}%`}
                paintOrder="stroke"></rect>
              {iconInfo.background.radialGlare && (
                <rect
                  width={iconInfo.totalSize - iconInfo.background.strokeSize}
                  height={iconInfo.totalSize - iconInfo.background.strokeSize}
                  x={iconInfo.background.strokeSize / 2}
                  y={iconInfo.background.strokeSize / 2}
                  fill="url(#r6)"
                  rx={iconInfo.background.radius}
                  style={{ mixBlendMode: "overlay" }}></rect>
              )}
              {iconInfo.background.noiseTexture && (
                <NoiseTexture opacity={iconInfo.background.noiseOpacity} />
              )}
              <clipPath id="clip">
                <use xlinkHref="#r4"></use>
              </clipPath>
              <defs>
                <linearGradient
                  id="r5"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform={`rotate(${iconInfo.fillStyle.angle})`}
                  style={{
                    transformOrigin: "center center",
                  }}>
                  <stop stopColor={iconInfo.fillStyle.primaryColor}>
                    {iconInfo.animate && (
                      <animate
                        attributeName="stop-color"
                        values={`${iconInfo.fillStyle.primaryColor};${iconInfo.fillStyle.secondaryColor};${iconInfo.fillStyle.primaryColor}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    )}
                  </stop>
                  <stop
                    offset="1"
                    stopColor={iconInfo.fillStyle.secondaryColor}>
                    {iconInfo.animate && (
                      <animate
                        attributeName="stop-color"
                        values={`${iconInfo.fillStyle.secondaryColor};${iconInfo.fillStyle.primaryColor};${iconInfo.fillStyle.secondaryColor}`}
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    )}
                  </stop>
                </linearGradient>
                <radialGradient
                  id="r6"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(256) rotate(90) scale(512)">
                  <stop stopColor="white"></stop>
                  <stop offset="1" stopColor="white" stopOpacity="0"></stop>
                </radialGradient>
              </defs>
              {iconInfo.type === "svg" ? (
                <Icon
                  className="text-white"
                  name={toCamelCase(iconInfo.value) as any}
                  width={iconInfo.icon.size}
                  height={iconInfo.icon.size}
                  color={iconInfo.icon.color}
                  alignmentBaseline="middle"
                  x={(iconInfo.totalSize - iconInfo.icon.size) / 2}
                  y={(iconInfo.totalSize - iconInfo.icon.size) / 2}
                />
              ) : iconInfo.type === "text" &&
                !iconInfo.value.endsWith(".gif") ? (
                <text
                  x="50%"
                  y="50%"
                  fontSize={iconInfo.icon.size}
                  fontWeight={700}
                  fill={iconInfo.icon.color}
                  textAnchor="middle"
                  dy="0.35em">
                  {iconInfo.value}
                </text>
              ) : (
                <image
                  href={iconInfo.value}
                  x={(iconInfo.totalSize - iconInfo.icon.size) / 2}
                  y={(iconInfo.totalSize - iconInfo.icon.size) / 2}
                  height={iconInfo.icon.size}
                  width={iconInfo.icon.size}
                />
              )}
            </svg>
            <span
              className="text-center absolute top-[105%] left-[50%] text-xs px-2 py-1 text-[#ffffff66] bg-[#ffffff1a] rounded-[20px] min-w-[70px]"
              style={{ transform: "translate(-50%,-20%)" }}>
              {iconInfo.totalSize}x{iconInfo.totalSize}
            </span>
          </div>
        </div>

        <PanelWrapper position="right">{renderRightPanel()}</PanelWrapper>
      </main>

      {/* Modal */}
      <Modal
        showModal={showBottomLeftPanel}
        setShowModal={setShowBottomLeftPanel}
        showBlur={false}>
        <div className="p-4">{renderLeftPanel()}</div>
      </Modal>
      <Modal
        showModal={showBottomRightPanel}
        setShowModal={setShowBottomRightPanel}
        showBlur={false}>
        <div className="p-4">{renderRightPanel()}</div>
      </Modal>
      <Modal showModal={showExportModal} setShowModal={setShowExportModal}>
        <div className="p-4 bg-[#282b2c] text-center rounded-md text-white min-w-[300px] max-w-[768px] shadow-lg">
          {/* <Image
            alt="export party"
            src="/party.svg"
            className="w-16 h-16 mx-auto mb-3"
            width="20"
            height="20"
          /> */}
          <div className="flex items-center justify-between text-[#b9b9b9] text-sm">
            <span className="font-bold">Exports</span>
            <X
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShowExportModal(false)}
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{iconInfo.filename}.svg</span>
              <span className="text-xs text-slate-400 ml-auto h-3">
                {iconInfo.totalSize}x{iconInfo.totalSize}
              </span>
              <label className="checkBox">
                <input
                  id="ch1"
                  type="checkbox"
                  defaultChecked={isExportSVG}
                  onChange={(e) => setIsExportSVG(e.target.checked)}
                />
                <div className="transition1"></div>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">{iconInfo.filename}.png</div>
              <div className="text-xs text-slate-400 ml-auto h-3">
                {iconInfo.totalSize}x{iconInfo.totalSize}
              </div>
              <label className="checkBox">
                <input
                  id="ch2"
                  type="checkbox"
                  defaultChecked={isExportPNG}
                  onChange={(e) => setIsExportPNG(e.target.checked)}
                />
                <div className="transition1"></div>
              </label>
            </div>
          </div>
          <button
            onClick={handleExportPng}
            className="bg-[#3d43ff8e] text-white rounded-md text-sm px-3 py-2 w-full mt-6 hover:bg-[#3d43ffa6] transition-all duration-300">
            export icon
          </button>
        </div>
      </Modal>
      <Toaster />
    </div>
  );
}

export const PanelWrapper = ({
  children,
  position,
}: {
  children: React.ReactNode;
  position: "right" | "left";
}) => {
  return (
    <div
      className={`
      ${
        position == "left"
          ? "left-sider left-6 -translate-x-180 animate-slide-left-fade"
          : "right-sider right-6 translate-x-180 animate-slide-right-fade"
      } absolute top-6 z-10 hidden w-80 overflow-y-auto backdrop-blur-xl rounded-lg bg-[#434a4d28] border border-[#ffffff0d] p-4 shadow-md transition-all duration-500 md:block`}
      style={{
        animationDelay: "0.15s",
        animationFillMode: "forwards",
        height: "calc(100vh - 102px)",
      }}>
      {children}
    </div>
  );
};