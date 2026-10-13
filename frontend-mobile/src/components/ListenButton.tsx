import { useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { useLanguage } from "../i18n/LanguageProvider";
import { selectVoice } from "../i18n/translations";
export function ListenButton({ text }: { text: string }) {
  const { language, t } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    setSpeaking(false);
    setUnavailable(false);
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        generation.current++;
        setSpeaking(false);
        void import("expo-speech").then((s) => s.stop()).catch(() => {});
      }
    });
    return () => {
      generation.current++;
      listener.remove();
      void import("expo-speech").then((s) => s.stop()).catch(() => {});
    };
  }, [language, text]);
  async function listen() {
    const own = ++generation.current;
    try {
      const speech = await import("expo-speech");
      await speech.stop();
      if (own !== generation.current) return;
      if (speaking) {
        setSpeaking(false);
        return;
      }
      const voice = selectVoice(
        await speech.getAvailableVoicesAsync(),
        language,
      );
      if (own !== generation.current) return;
      if (!voice) {
        setUnavailable(true);
        return;
      }
      setSpeaking(true);
      setUnavailable(false);
      speech.speak(text, {
        voice: voice.identifier,
        language: voice.language,
        rate: 0.85,
        onDone: () => {
          if (own === generation.current) setSpeaking(false);
        },
        onStopped: () => {
          if (own === generation.current) setSpeaking(false);
        },
        onError: () => {
          if (own === generation.current) {
            setSpeaking(false);
            setUnavailable(true);
          }
        },
      });
    } catch {
      if (own === generation.current) {
        setSpeaking(false);
        setUnavailable(true);
      }
    }
  }
  return (
    <View>
      <Button
        variant="ghost"
        iconLeft={speaking ? "Square" : "Volume2"}
        onPress={() => void listen()}
      >
        {t(speaking ? "Stop listening" : "Listen")}
      </Button>
      {unavailable ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-sm text-muted-foreground"
        >
          {t(
            "Voice is not available. Ask your manager to read this instruction.",
          )}
        </Text>
      ) : null}
    </View>
  );
}
