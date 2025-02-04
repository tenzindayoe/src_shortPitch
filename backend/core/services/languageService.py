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
    "en": "0m1WGWVzxS7KbWobXtnw",
    "es": "9oPKasc15pfAbMr7N6Gs",
    "fr": "O31r762Gb3WFygrEOGh0",
    "ja": "3JDquces8E8bkmvbh6Bc"

}

def getAllLanguages():
    return languages

def getLanguageFromCode(code):
    for language in languages["languages"]:
        if language["code"] == code:
            return language
    return None
