
data received 

{
    "id" : <string>
    "total_duration":<float>
    "background_music_url":<String>
    "video":[
        {
            "section_id":<string>: 
            "section_duration":<float>
            "section_components":[
                SECTION COMPONENT TYPE OBJECT
            ]
        }
        ...

    ]


}



SECTION COMPONENTS

1. Dialogue
    {
        "type":"Dialogue",
        "url":<string>
        "duration" : <float>
    }
2. LineBox
    {
        "type":"LineBox",
        "data":{} # contains the json linebox info..for now leave it undefined
    }
3. PlayerCard
    {
        "type":"PlayerCard",
        "data":{
            "name",
            "id",
            "team"
            ...
        }
    }
4. GameInfoCard{
    "type":"GameInfoCard",
    "data":{
        "gameId":<string>
        "location":<string>
        "dateAndTime":<string>
        "homeTeamName":<string>
        "awayTeamName":<string>
        "homeTeamLogoURL":<string>
        "awayTeamLogoURL":<string>
    }
}
5. HighlightVideo{
    "type":"HighlightVideo",
    "data":{
        "gameId":<string>
        "title":<string>
        "description":<string>
        "url":<string>
    }
}

6. Image{
    "type":"Chart"
    "data":{
        "gameId":<string>
        "title":<string>
        "url":<string>
    }
}