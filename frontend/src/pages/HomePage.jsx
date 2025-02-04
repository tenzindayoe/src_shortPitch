import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate for routing


const HomePage = () => {
  const [showUI, setShowUI] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center">
      {!showUI ? (
        <div className="flex flex-col items-center">
          {/* First Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            onAnimationComplete={() => setTimeout(() => setShowUI(true), 2000)}
            className="text-4xl font-bold text-black mb-4"
          >
            ShortPitch AI 
          </motion.div>

          {/* Second Text Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-2xl text-gray-600"
          >
            Your personalized 2-minute highlights for your Favourite MLB Games powered by Gemini
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome to ShortPitch
          </h1>
          <button
            className="px-6 py-3 text-lg bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
            onClick={() => navigate("/games-menu")}
          >
            Start the Experience
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
