import { useState, useEffect } from "react";

const LanguageDropdown = ({setParentLanguage}) => {
    const [languages, setLanguages] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);

    useEffect(() => {
        
        if (selectedLanguage) {
            setParentLanguage(selectedLanguage);
        }
    }, [selectedLanguage]);

    useEffect(() => {
        fetch("http://shortpitchserver.com/getSupportedLanguages")
            .then((response) => response.json())
            .then((data) => {
                setLanguages(data['languages']);
                if (data['languages'] && data['languages'].length > 0) {
                    setSelectedLanguage(data['languages'][0].code);
                }
            })
            .catch((error) => console.error("Error fetching languages:", error));
    }, []);

    if (!languages) {
        return <div className="w-full text-center p-4">Loading languages...</div>;
    }

    return (
        <div className="w-full relative flex items-center justify-center">
            <div className="relative w-full">
                <select
                    className="w-full p-4 border-none rounded-lg shadow-lg bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
                    shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] pr-10"
                    value={selectedLanguage || ""}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.display}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    ▼
                </div>
            </div>
        </div>
    );
};

export default LanguageDropdown;