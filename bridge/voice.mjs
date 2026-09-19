/**
 * The free voice.
 *
 * Microsoft's neural voices, through the same Read Aloud service Edge uses. No
 * account and no API key, and it runs on Microsoft's side — so it is quick on
 * any laptop, unlike an in-browser neural model on a weak GPU (Kokoro here ran
 * slower than realtime on integrated graphics; this returns a sentence in
 * about a second).
 *
 * The trade-off is that the text of each sentence JARVIS speaks is sent to
 * Microsoft. If that is not acceptable, set JARVIS_FREE_VOICE=off and the app
 * falls back to the browser voice (or Kokoro, if you enable it in .env.local).
 *
 * en-GB-RyanNeural is a British male voice. Other good male options:
 *   en-GB-ThomasNeural   younger, lighter
 *   en-US-GuyNeural      American, warm
 *   en-US-AndrewNeural   American, conversational
 *   en-AU-WilliamNeural  Australian
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const setting = (process.env.JARVIS_FREE_VOICE ?? '').trim()

/** Whether the free voice is on. Anything but "off" leaves it on. */
export const freeVoiceEnabled = setting.toLowerCase() !== 'off'

/** "off" is a switch, not a voice name; otherwise the value picks the voice. */
export const FREE_VOICE =
  setting && setting.toLowerCase() !== 'off' ? setting : 'en-GB-RyanNeural'

/** SSML is XML, and the library passes the text through untouched. */
const escapeXml = (s) =>
  s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c])

/**
 * Speak one sentence. Resolves to a Readable of MP3 bytes.
 *
 * A fresh client per call: the speech loop synthesises a sentence ahead of the
 * one playing, so two calls overlap, and a client holds one socket.
 */
export async function speakFree(text) {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(FREE_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(escapeXml(text))
  return audioStream
}
