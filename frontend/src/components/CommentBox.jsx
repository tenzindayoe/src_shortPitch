import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { Send } from "lucide-react"; // ✅ Send icon

const CommentBox = ({ gameId }) => {
    const INITIAL_LOAD = 20;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD);
    const [lastFetchedDate, setLastFetchedDate] = useState(null);
    const commentBoxRef = useRef(null);
    let pollingInterval = useRef(null);

    const API_URL = "http://shortpitchserver.com/comments";

    const fetchComments = async (loadMore = false) => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}?game_id=${gameId}&count=${loadedCount}`);
            const data = await response.json();

            if (data.comments.length < loadedCount) {
                setHasMore(false);
            }

            if (loadMore) {
                setComments((prev) => [...data.comments.reverse(), ...prev]);
            } else {
                setComments(data.comments.reverse());
                scrollToBottom();
            }

            setLastFetchedDate(data.comments[data.comments.length - 1]?.date || null);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }

        setLoading(false);
        restartPolling();
    };

    const restartPolling = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = setInterval(() => fetchComments(), 8000);
    };

    const scrollToBottom = () => {
        if (commentBoxRef.current) {
            commentBoxRef.current.scrollTo({ top: commentBoxRef.current.scrollHeight, behavior: "smooth" });
        }
    };

    const handleScroll = () => {
        if (commentBoxRef.current.scrollTop === 0 && hasMore && !loading) {
            setLoadedCount((prev) => prev + INITIAL_LOAD);
            fetchComments(true);
        }
    };

    useEffect(() => {
        fetchComments();
        restartPolling();
        return () => clearInterval(pollingInterval.current);
    }, [gameId]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    game_id: gameId,
                    username: "Guest",
                    comment: newComment
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments((prev) => [...prev, data.new_comment]);
                setNewComment("");
                scrollToBottom();
                setLoadedCount(INITIAL_LOAD);
                fetchComments();
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendComment();
        }
    };

    return (
        <div className="w-full h-full  bg-gray-900 p-4  rounded-2xl flex flex-col space-y-3 relative shadow-lg border border-gray-700">
            {/* Header with Animation */}
            <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">💬 Live Comments</h2>
                <Lottie
                    autoplay
                    loop
                    src="https://assets2.lottiefiles.com/private_files/lf30_nrsyejbu.json" // ✅ Typing animation
                    style={{ height: 40, width: 40 }}
                />
            </div>

            {/* Comment List */}
            <motion.div
                ref={commentBoxRef}
                className="flex-1 overflow-y-auto p-2 space-y-3 bg-gray-800 rounded-xl scrollbar-hide"
                style={{ maxHeight: "300px", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onScroll={handleScroll}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {loading && comments.length === 0 ? (
                    <p className="text-gray-400 text-center">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-gray-400 text-center">No comments yet. Be the first!</p>
                ) : (
                    <AnimatePresence>
                        {comments.map((c, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="p-3 bg-gray-700 rounded-lg flex flex-col shadow-md border border-gray-600"
                            >
                                <span className="text-sm text-blue-400 font-semibold">{c.username}</span>
                                <p className="text-white text-sm">{c.comment}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* Input Box */}
            <div className="flex space-x-2 relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a comment..."
                    className="flex-1 p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendComment}
                    className="bg-blue-500 p-2 rounded-lg text-white shadow-md hover:bg-blue-600 flex items-center"
                >
                    <Send size={24} />
                </motion.button>
            </div>
        </div>
    );
};

export default CommentBox;
