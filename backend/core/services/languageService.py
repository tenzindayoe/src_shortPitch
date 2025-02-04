languages = {
    "languages": [
        {
            "display": "English",
            "name":"English",
            "code": "en"
        },
        {
            "display":"Español",
            "name":"Spanish",   
            "code":"es"
        },
        {
            "display":"Français",
            "name":"French",
            "code":"fr"
        },
        {
            
            "display":"日本語",
            "name":"Japanese",
            "code":"ja"
        },
        
    ]
}


languageVoiceMapping = {
    "en": {
        "language_code": "en-US",
        "voice_name": "en-US-Wavenet-D"
    },
    "es": {
        "language_code": "es-ES",
        "voice_name": "es-ES-Wavenet-A"
    },
    "fr": {
        "language_code": "fr-FR",
        "voice_name": "fr-FR-Wavenet-A"
    },
    "ja": {
        "language_code": "ja-JP",
        "voice_name": "ja-JP-Wavenet-A"
    }
}


def getAllLanguages():
    return languages

def getLanguageFromCode(code):
    for language in languages["languages"]:
        if language["code"] == code:
            return language
    return None
