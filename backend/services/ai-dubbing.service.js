const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default Urdu voice ID (you can change this to any ElevenLabs voice)
const URDU_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (multilingual)

/**
 * Generate dubbed audio using ElevenLabs TTS
 * @param {String} text - Text to convert to speech (in Urdu)
 * @param {String} voiceId - ElevenLabs voice ID (optional)
 * @returns {Object} - Audio buffer and info
 */
exports.generateUrduDubbing = async (text, voiceId = URDU_VOICE_ID) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      console.warn('⚠️ ElevenLabs API key not configured. Skipping dubbing.');
      return { success: false, message: 'API key not configured' };
    }

    console.log('🎙️ Generating Urdu dubbing with ElevenLabs...');

    const response = await axios({
      method: 'POST',
      url: `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      data: {
        text: text,
        model_id: 'eleven_multilingual_v2', // Supports Urdu
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
      responseType: 'arraybuffer',
    });

    console.log('✅ Urdu dubbing generated successfully');

    return {
      success: true,
      audioBuffer: response.data,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('❌ Error generating Urdu dubbing:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.detail?.message || error.message,
    };
  }
};

/**
 * Get available ElevenLabs voices
 * @returns {Array} - List of available voices
 */
exports.getAvailableVoices = async () => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return [];
    }

    const response = await axios({
      method: 'GET',
      url: `${ELEVENLABS_API_URL}/voices`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error.message);
    return [];
  }
};

/**
 * Translate text to Urdu (placeholder - would use Google Translate API or similar)
 * @param {String} text - Text to translate
 * @returns {String} - Translated text
 */
exports.translateToUrdu = async (text) => {
  // For prototype, return the text with a note
  // In production, integrate with Google Translate API, DeepL, or similar
  console.log('📝 Translation to Urdu (placeholder)');
  
  return `[Urdu Translation] ${text}`;
  
  // TODO: Implement actual translation API
  // Example with Google Translate:
  // const { Translate } = require('@google-cloud/translate').v2;
  // const translate = new Translate();
  // const [translation] = await translate.translate(text, 'ur');
  // return translation;
};

/**
 * Process video description for Urdu dubbing
 * @param {String} description - Video description/script
 * @param {Boolean} autoTranslate - Whether to auto-translate to Urdu
 * @returns {Object} - Processing result
 */
exports.processVideoForUrduDubbing = async (description, autoTranslate = false) => {
  try {
    let urduText = description;

    // Auto-translate if requested
    if (autoTranslate) {
      urduText = await this.translateToUrdu(description);
    }

    // Generate Urdu audio
    const dubbing = await this.generateUrduDubbing(urduText);

    return {
      success: dubbing.success,
      originalText: description,
      urduText: urduText,
      audioBuffer: dubbing.audioBuffer,
      message: dubbing.message,
    };
  } catch (error) {
    console.error('Error processing video for dubbing:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Check if ElevenLabs API is configured and working
 * @returns {Boolean}
 */
exports.isConfigured = () => {
  return !!ELEVENLABS_API_KEY;
};

/**
 * Get API usage info (for free tier monitoring)
 * @returns {Object} - Usage information
 */
exports.getUsageInfo = async () => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return { configured: false };
    }

    const response = await axios({
      method: 'GET',
      url: `${ELEVENLABS_API_URL}/user`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return {
      configured: true,
      subscription: response.data.subscription,
      characterCount: response.data.character_count,
      characterLimit: response.data.character_limit,
    };
  } catch (error) {
    console.error('Error fetching usage info:', error.message);
    return { configured: true, error: error.message };
  }
};
