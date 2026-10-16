import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context";
import { selectVoice } from "@/i18n/translations";
export default function ListenButton({ text }: { text: string }) {
  const { language } = useLanguage();
  return <SpeechControl key={`${language}:${text}`} text={text} />;
}
function SpeechControl({ text }: { text: string }) {
  const { language, t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function listen() {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    const synth = window.speechSynthesis;
    const voice =
      synth &&
      selectVoice(
        synth.getVoices().map((v) => ({ language: v.lang, voice: v })),
        language,
      )?.voice;
    if (!synth || !voice) {
      setUnavailable(true);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setUnavailable(true);
    };
    setUnavailable(false);
    setSpeaking(true);
    synth.speak(utterance);
  }
  return (
    <div>
      <Button variant="ghost" onClick={listen} aria-pressed={speaking}>
        {speaking ? <Square /> : <Volume2 />}
        {t(speaking ? "Stop listening" : "Listen")}
      </Button>
      {unavailable ? (
        <p role="status" className="mt-1 text-sm text-muted-foreground">
          {t(
            "Voice is not available. Ask your manager to read this instruction.",
          )}
        </p>
      ) : null}
    </div>
  );
}
