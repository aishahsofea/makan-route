import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SharedSelection,
  Slider,
} from "@heroui/react";

type VoiceSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const VoiceSettingsModal = ({
  isOpen,
  onClose,
}: VoiceSettingsModalProps) => {
  const textToSpeech = useTextToSpeech();

  const handleChangeVoice = (keys: SharedSelection) => {
    const voicename = Array.from(keys)[0];
    const voice = textToSpeech.voices.find((v) => v.name === voicename);
    textToSpeech.updateVoiceSettings({ voice: voice ?? null });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Voice Settings</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Select Voice"
              placeholder="Select a voice"
              selectedKeys={[textToSpeech.voiceSettings.voice?.name ?? ""]}
              onSelectionChange={(keys) => handleChangeVoice(keys)}
            >
              {textToSpeech.voices.map((voice) => (
                <SelectItem key={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </Select>

            <Slider
              className="w-full"
              color="secondary"
              label="Speech Rate"
              minValue={0.1}
              maxValue={3}
              step={0.1}
              value={textToSpeech.voiceSettings.rate}
              onChange={(value) =>
                textToSpeech.updateVoiceSettings({ rate: Number(value) })
              }
            />

            <Slider
              className="w-full"
              color="secondary"
              label="Pitch"
              minValue={0}
              maxValue={2}
              step={0.1}
              value={textToSpeech.voiceSettings.pitch}
              onChange={(value) =>
                textToSpeech.updateVoiceSettings({ pitch: Number(value) })
              }
            />

            <Slider
              className="w-full"
              color="secondary"
              label="Volume"
              minValue={0}
              maxValue={2}
              step={0.1}
              value={textToSpeech.voiceSettings.volume}
              onChange={(value) =>
                textToSpeech.updateVoiceSettings({ volume: Number(value) })
              }
            />

            {/* Test voice */}
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="bordered"
                isDisabled={textToSpeech.state.isLoading}
                onPress={() =>
                  textToSpeech.speak(
                    "Hello! This is a test of the voice output system."
                  )
                }
              >
                Test Voice
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="secondary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
