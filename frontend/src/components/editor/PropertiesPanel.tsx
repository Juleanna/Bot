import { useTranslation } from "react-i18next";
import type { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const glassSelect = "w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-sm text-foreground backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40";
const glassTextarea = "w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40";
const glassCheckbox = "mr-2 accent-primary";

interface Props {
  node: Node | null;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
}

export default function PropertiesPanel({ node, onUpdate }: Props) {
  const { t } = useTranslation("editor");

  if (!node) {
    return (
      <div className="flex w-64 items-center justify-center border-l border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl p-4 text-sm text-muted-foreground">
        {t("panel.select_node")}
      </div>
    );
  }

  const data = node.data as Record<string, unknown>;
  const update = (key: string, value: unknown) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  return (
    <div className="w-64 space-y-4 overflow-y-auto border-l border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl p-4">
      <h3 className="text-sm font-semibold text-foreground">{t("panel.properties")}</h3>

      {/* ── Start ── */}
      {node.type === "start" && (
        <div className="space-y-2">
          <Label>{t("panel.command")}</Label>
          <Input
            value={(data.command as string) || ""}
            placeholder={t("panel.command_placeholder")}
            onChange={(e) => update("command", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("panel.command_hint")}</p>
        </div>
      )}

      {/* ── Message ── */}
      {(node.type === "message" || node.type === "button_menu" || node.type === "reply_keyboard") && (
        <div className="space-y-2">
          <Label>{t("panel.text")}</Label>
          <textarea
            className={glassTextarea}
            rows={3}
            value={(data.text as string) || ""}
            onChange={(e) => update("text", e.target.value)}
          />
        </div>
      )}

      {/* Message extras: parse_mode, checkboxes */}
      {node.type === "message" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.parse_mode")}</Label>
            <select className={glassSelect} value={(data.parse_mode as string) || ""} onChange={(e) => update("parse_mode", e.target.value)}>
              <option value="">{t("panel.parse_mode_none")}</option>
              <option value="HTML">HTML</option>
              <option value="MarkdownV2">MarkdownV2</option>
            </select>
          </div>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.disable_notification} onChange={(e) => update("disable_notification", e.target.checked)} />
            {t("panel.disable_notification")}
          </label>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.protect_content} onChange={(e) => update("protect_content", e.target.checked)} />
            {t("panel.protect_content")}
          </label>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.disable_web_page_preview} onChange={(e) => update("disable_web_page_preview", e.target.checked)} />
            {t("panel.disable_web_page_preview")}
          </label>
        </>
      )}

      {/* ── Button Menu ── */}
      {node.type === "button_menu" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.keyboard_type")}</Label>
            <select className={glassSelect} value={(data.keyboard_type as string) || "inline"} onChange={(e) => update("keyboard_type", e.target.value)}>
              <option value="inline">{t("panel.keyboard_inline")}</option>
              <option value="reply">{t("panel.keyboard_reply")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t("panel.buttons")}</Label>
            {((data.buttons as { label: string; value: string; type?: string; url?: string }[]) || []).map(
              (btn, i) => (
                <div key={i} className="space-y-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-2">
                  <div className="flex gap-1">
                    <Input
                      placeholder={t("panel.button_label")}
                      value={btn.label}
                      onChange={(e) => {
                        const buttons = [...((data.buttons as typeof btn[]) || [])];
                        buttons[i] = { ...buttons[i]!, label: e.target.value };
                        update("buttons", buttons);
                      }}
                      className="text-xs"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                      const buttons = ((data.buttons as typeof btn[]) || []).filter((_, idx) => idx !== i);
                      update("buttons", buttons);
                    }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {(data.keyboard_type as string) === "inline" || !(data.keyboard_type) ? (
                    <>
                      <select className={glassSelect + " !text-xs !p-1"} value={btn.type || "callback"} onChange={(e) => {
                        const buttons = [...((data.buttons as typeof btn[]) || [])];
                        buttons[i] = { ...buttons[i]!, type: e.target.value };
                        update("buttons", buttons);
                      }}>
                        <option value="callback">{t("panel.button_callback")}</option>
                        <option value="url">{t("panel.button_url")}</option>
                        <option value="web_app">{t("panel.button_web_app")}</option>
                      </select>
                      {(btn.type === "url" || btn.type === "web_app") && (
                        <Input placeholder={t("panel.button_url_value")} value={btn.url || ""} onChange={(e) => {
                          const buttons = [...((data.buttons as typeof btn[]) || [])];
                          buttons[i] = { ...buttons[i]!, url: e.target.value };
                          update("buttons", buttons);
                        }} className="text-xs" />
                      )}
                    </>
                  ) : null}
                </div>
              )
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => {
              const buttons = [...((data.buttons as { label: string; value: string }[]) || [])];
              const val = `btn_${buttons.length + 1}`;
              buttons.push({ label: `Button ${buttons.length + 1}`, value: val });
              update("buttons", buttons);
            }}>
              <Plus className="mr-1 h-3 w-3" />
              {t("panel.add_button")}
            </Button>
          </div>
          {(data.keyboard_type as string) === "reply" && (
            <>
              <label className="flex items-center text-sm text-foreground/80">
                <input type="checkbox" className={glassCheckbox} checked={!!data.resize_keyboard} onChange={(e) => update("resize_keyboard", e.target.checked)} />
                {t("panel.resize_keyboard")}
              </label>
              <label className="flex items-center text-sm text-foreground/80">
                <input type="checkbox" className={glassCheckbox} checked={!!data.one_time_keyboard} onChange={(e) => update("one_time_keyboard", e.target.checked)} />
                {t("panel.one_time_keyboard")}
              </label>
              <div className="space-y-2">
                <Label>{t("panel.input_placeholder")}</Label>
                <Input value={(data.input_placeholder as string) || ""} onChange={(e) => update("input_placeholder", e.target.value)} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Condition ── */}
      {node.type === "condition" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.condition_type")}</Label>
            <select className={glassSelect} value={(data.type as string) || "contains"} onChange={(e) => update("type", e.target.value)}>
              <option value="contains">{t("panel.condition_contains")}</option>
              <option value="exact">{t("panel.condition_exact")}</option>
              <option value="regex">{t("panel.condition_regex")}</option>
              <option value="command">{t("panel.condition_command")}</option>
              <option value="media_type">{t("panel.condition_media_type")}</option>
              <option value="callback_data">{t("panel.condition_callback_data")}</option>
              <option value="has_contact">{t("panel.condition_has_contact")}</option>
              <option value="has_location">{t("panel.condition_has_location")}</option>
            </select>
          </div>
          {!["has_contact", "has_location"].includes((data.type as string) || "") && (
            <div className="space-y-2">
              <Label>{t("panel.pattern")}</Label>
              <Input value={(data.pattern as string) || ""} onChange={(e) => update("pattern", e.target.value)} />
            </div>
          )}
        </>
      )}

      {/* ── Media ── */}
      {node.type === "media" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.media_type")}</Label>
            <select className={glassSelect} value={(data.media_type as string) || "image"} onChange={(e) => update("media_type", e.target.value)}>
              <option value="image">{t("panel.media_image")}</option>
              <option value="video">{t("panel.media_video")}</option>
              <option value="document">{t("panel.media_document")}</option>
              <option value="audio">{t("panel.media_audio")}</option>
              <option value="animation">{t("panel.media_animation")}</option>
              <option value="voice">{t("panel.media_voice")}</option>
              <option value="video_note">{t("panel.media_video_note")}</option>
              <option value="sticker">{t("panel.media_sticker")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t("panel.media_url")}</Label>
            <Input value={(data.url as string) || ""} onChange={(e) => update("url", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.caption")}</Label>
            <Input value={(data.caption as string) || ""} onChange={(e) => update("caption", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.parse_mode")}</Label>
            <select className={glassSelect} value={(data.parse_mode as string) || ""} onChange={(e) => update("parse_mode", e.target.value)}>
              <option value="">{t("panel.parse_mode_none")}</option>
              <option value="HTML">HTML</option>
              <option value="MarkdownV2">MarkdownV2</option>
            </select>
          </div>
          {["image", "video", "animation"].includes((data.media_type as string) || "image") && (
            <label className="flex items-center text-sm text-foreground/80">
              <input type="checkbox" className={glassCheckbox} checked={!!data.has_spoiler} onChange={(e) => update("has_spoiler", e.target.checked)} />
              {t("panel.has_spoiler")}
            </label>
          )}
        </>
      )}

      {/* ── Webhook ── */}
      {node.type === "webhook" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.webhook_url")}</Label>
            <Input value={(data.webhook_url as string) || ""} onChange={(e) => update("webhook_url", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.method")}</Label>
            <select className={glassSelect} value={(data.method as string) || "POST"} onChange={(e) => update("method", e.target.value)}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
            </select>
          </div>
        </>
      )}

      {/* ── Form ── */}
      {node.type === "form" && (
        <div className="space-y-2">
          <Label>{t("panel.fields")}</Label>
          {((data.fields as { name: string; type: string; prompt: string }[]) || []).map(
            (field, i) => (
              <div key={i} className="space-y-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-2">
                <Input placeholder={t("panel.field_name")} value={field.name} onChange={(e) => {
                  const fields = [...((data.fields as typeof field[]) || [])];
                  fields[i] = { ...fields[i]!, name: e.target.value };
                  update("fields", fields);
                }} className="text-xs" />
                <Input placeholder={t("panel.field_prompt")} value={field.prompt} onChange={(e) => {
                  const fields = [...((data.fields as typeof field[]) || [])];
                  fields[i] = { ...fields[i]!, prompt: e.target.value };
                  update("fields", fields);
                }} className="text-xs" />
              </div>
            )
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => {
            const fields = [...((data.fields as { name: string; type: string; prompt: string }[]) || [])];
            fields.push({ name: "", type: "text", prompt: "" });
            update("fields", fields);
          }}>
            <Plus className="mr-1 h-3 w-3" />
            {t("panel.add_field")}
          </Button>
        </div>
      )}

      {/* ── Reply Keyboard ── */}
      {node.type === "reply_keyboard" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.buttons")}</Label>
            {((data.buttons as { label: string }[]) || []).map((btn, i) => (
              <div key={i} className="flex gap-1">
                <Input placeholder={t("panel.button_label")} value={btn.label} onChange={(e) => {
                  const buttons = [...((data.buttons as typeof btn[]) || [])];
                  buttons[i] = { ...buttons[i]!, label: e.target.value };
                  update("buttons", buttons);
                }} className="text-xs" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                  const buttons = ((data.buttons as typeof btn[]) || []).filter((_, idx) => idx !== i);
                  update("buttons", buttons);
                }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => {
              const buttons = [...((data.buttons as { label: string }[]) || [])];
              buttons.push({ label: "" });
              update("buttons", buttons);
            }}>
              <Plus className="mr-1 h-3 w-3" />
              {t("panel.add_button")}
            </Button>
          </div>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.resize_keyboard} onChange={(e) => update("resize_keyboard", e.target.checked)} />
            {t("panel.resize_keyboard")}
          </label>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.one_time_keyboard} onChange={(e) => update("one_time_keyboard", e.target.checked)} />
            {t("panel.one_time_keyboard")}
          </label>
          <div className="space-y-2">
            <Label>{t("panel.input_placeholder")}</Label>
            <Input value={(data.input_placeholder as string) || ""} onChange={(e) => update("input_placeholder", e.target.value)} />
          </div>
        </>
      )}

      {/* ── Location ── */}
      {node.type === "location" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.latitude")}</Label>
            <Input type="number" step="any" value={(data.latitude as number) ?? 0} onChange={(e) => update("latitude", parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.longitude")}</Label>
            <Input type="number" step="any" value={(data.longitude as number) ?? 0} onChange={(e) => update("longitude", parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.live_period")}</Label>
            <Input type="number" min={0} max={86400} value={(data.live_period as number) ?? 0} onChange={(e) => update("live_period", parseInt(e.target.value) || 0)} />
            <p className="text-[10px] text-muted-foreground">{t("panel.live_period_hint")}</p>
          </div>
        </>
      )}

      {/* ── Poll ── */}
      {node.type === "poll" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.question")}</Label>
            <textarea className={glassTextarea} rows={2} value={(data.question as string) || ""} onChange={(e) => update("question", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.options")}</Label>
            {((data.options as string[]) || []).map((opt, i) => (
              <div key={i} className="flex gap-1">
                <Input value={opt} onChange={(e) => {
                  const options = [...((data.options as string[]) || [])];
                  options[i] = e.target.value;
                  update("options", options);
                }} className="text-xs" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                  const options = ((data.options as string[]) || []).filter((_, idx) => idx !== i);
                  update("options", options);
                }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => {
              const options = [...((data.options as string[]) || [])];
              options.push("");
              update("options", options);
            }}>
              <Plus className="mr-1 h-3 w-3" />
              {t("panel.add_option")}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>{t("panel.poll_type")}</Label>
            <select className={glassSelect} value={(data.type as string) || "regular"} onChange={(e) => update("type", e.target.value)}>
              <option value="regular">{t("panel.poll_regular")}</option>
              <option value="quiz">{t("panel.poll_quiz")}</option>
            </select>
          </div>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={data.is_anonymous !== false} onChange={(e) => update("is_anonymous", e.target.checked)} />
            {t("panel.is_anonymous")}
          </label>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.allows_multiple_answers} onChange={(e) => update("allows_multiple_answers", e.target.checked)} />
            {t("panel.allows_multiple")}
          </label>
          {(data.type as string) === "quiz" && (
            <>
              <div className="space-y-2">
                <Label>{t("panel.correct_option")}</Label>
                <Input type="number" min={0} value={(data.correct_option_id as number) ?? 0} onChange={(e) => update("correct_option_id", parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>{t("panel.explanation")}</Label>
                <Input value={(data.explanation as string) || ""} onChange={(e) => update("explanation", e.target.value)} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Sticker ── */}
      {node.type === "sticker" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.sticker_id")}</Label>
            <Input value={(data.sticker as string) || ""} onChange={(e) => update("sticker", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.emoji")}</Label>
            <Input value={(data.emoji as string) || ""} onChange={(e) => update("emoji", e.target.value)} />
          </div>
        </>
      )}

      {/* ── Dice ── */}
      {node.type === "dice" && (
        <div className="space-y-2">
          <Label>{t("panel.dice_emoji")}</Label>
          <select className={glassSelect} value={(data.emoji as string) || "\uD83C\uDFB2"} onChange={(e) => update("emoji", e.target.value)}>
            <option value="🎲">🎲</option>
            <option value="🎯">🎯</option>
            <option value="🏀">🏀</option>
            <option value="⚽">⚽</option>
            <option value="🎳">🎳</option>
            <option value="🎰">🎰</option>
          </select>
        </div>
      )}

      {/* ── Contact ── */}
      {node.type === "contact" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.phone_number")}</Label>
            <Input value={(data.phone_number as string) || ""} onChange={(e) => update("phone_number", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.first_name")}</Label>
            <Input value={(data.first_name as string) || ""} onChange={(e) => update("first_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.last_name")}</Label>
            <Input value={(data.last_name as string) || ""} onChange={(e) => update("last_name", e.target.value)} />
          </div>
        </>
      )}

      {/* ── Delay ── */}
      {node.type === "delay" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.seconds")}</Label>
            <Input type="number" min={1} max={300} value={(data.seconds as number) || 3} onChange={(e) => update("seconds", parseInt(e.target.value) || 1)} />
          </div>
          <label className="flex items-center text-sm text-foreground/80">
            <input type="checkbox" className={glassCheckbox} checked={!!data.show_typing} onChange={(e) => update("show_typing", e.target.checked)} />
            {t("panel.show_typing")}
          </label>
        </>
      )}

      {/* ── Chat Action ── */}
      {node.type === "chat_action" && (
        <div className="space-y-2">
          <Label>{t("panel.action")}</Label>
          <select className={glassSelect} value={(data.action as string) || "typing"} onChange={(e) => update("action", e.target.value)}>
            <option value="typing">{t("panel.action_typing")}</option>
            <option value="upload_photo">{t("panel.action_upload_photo")}</option>
            <option value="record_video">{t("panel.action_record_video")}</option>
            <option value="upload_video">{t("panel.action_upload_video")}</option>
            <option value="record_voice">{t("panel.action_record_voice")}</option>
            <option value="upload_voice">{t("panel.action_upload_voice")}</option>
            <option value="upload_document">{t("panel.action_upload_document")}</option>
            <option value="find_location">{t("panel.action_find_location")}</option>
          </select>
        </div>
      )}

      {/* ── Invoice ── */}
      {node.type === "invoice" && (
        <>
          <div className="space-y-2">
            <Label>{t("panel.invoice_title")}</Label>
            <Input value={(data.title as string) || ""} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.invoice_description")}</Label>
            <textarea className={glassTextarea} rows={2} value={(data.description as string) || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.invoice_payload")}</Label>
            <Input value={(data.payload as string) || ""} onChange={(e) => update("payload", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.invoice_currency")}</Label>
            <Input value={(data.currency as string) || "USD"} onChange={(e) => update("currency", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("panel.invoice_prices")}</Label>
            {((data.prices as { label: string; amount: number }[]) || []).map((price, i) => (
              <div key={i} className="flex gap-1">
                <Input placeholder={t("panel.invoice_price_label")} value={price.label} onChange={(e) => {
                  const prices = [...((data.prices as typeof price[]) || [])];
                  prices[i] = { ...prices[i]!, label: e.target.value };
                  update("prices", prices);
                }} className="text-xs flex-1" />
                <Input type="number" placeholder={t("panel.invoice_price_amount")} value={price.amount} onChange={(e) => {
                  const prices = [...((data.prices as typeof price[]) || [])];
                  prices[i] = { ...prices[i]!, amount: parseInt(e.target.value) || 0 };
                  update("prices", prices);
                }} className="text-xs w-20" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                  const prices = ((data.prices as typeof price[]) || []).filter((_, idx) => idx !== i);
                  update("prices", prices);
                }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => {
              const prices = [...((data.prices as { label: string; amount: number }[]) || [])];
              prices.push({ label: "", amount: 0 });
              update("prices", prices);
            }}>
              <Plus className="mr-1 h-3 w-3" />
              {t("panel.invoice_add_price")}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>{t("panel.invoice_photo_url")}</Label>
            <Input value={(data.photo_url as string) || ""} onChange={(e) => update("photo_url", e.target.value)} />
          </div>
        </>
      )}
    </div>
  );
}
